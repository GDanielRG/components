import { usePage } from '@inertiajs/react';
import { echo } from '@laravel/echo-react';
import type { Broadcaster } from 'laravel-echo';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtimeFeature } from '@/hooks/use-realtime-feature';

type PresenceChannel = Broadcaster['reverb']['presence'];

export interface CommentTypingUser {
    userId: number;
    name: string;
    avatar: string | null;
}

interface PresenceMember {
    user_id: number;
    name: string;
    avatar: string | null;
}

/** Whispers carry only activity; identity comes from authorized presence membership. */
interface TypingWhisper {
    user_id: number;
    active: boolean;
    sent_at: number;
}

interface UseCommentTypingPresenceOptions {
    /** A generated presence channel name, without Echo's `presence-` prefix. */
    channel: string;
    /** The current user can compose a comment. */
    enabled: boolean;
    /** The comments surface is open; presence is neither joined nor advertised while it is closed. */
    visible: boolean;
}

interface UseCommentTypingPresenceResult {
    typingUsers: CommentTypingUser[];
    setDraftContent: (content: string) => void;
    handleDraftFocus: () => void;
    handleDraftBlur: () => void;
    stopTyping: () => void;
}

// Must exceed the local idle plus throttle windows so the sender's stop signal wins.
const IDLE_TIMEOUT_MS = 10000;
const ACTIVE_WHISPER_THROTTLE_MS = 2500;
const LOCAL_IDLE_STOP_MS = 1800;

/**
 * Tracks ephemeral comment typing over Reverb presence; inert unless the comments
 * transport is Reverb and the surface is visible. Nothing is persisted and the
 * current user is excluded.
 */
export function useCommentTypingPresence({
    channel,
    enabled,
    visible,
}: UseCommentTypingPresenceOptions): UseCommentTypingPresenceResult {
    const { transport } = useRealtimeFeature('comments');
    const presenceEnabled = enabled && visible && transport === 'reverb';

    const currentUserId = usePage().props.auth.user?.id ?? null;

    const [typingUsers, setTypingUsers] = useState<CommentTypingUser[]>([]);

    const presenceRef = useRef<PresenceChannel | null>(null);
    // Whispers are advertised only while the presence subscription is usable.
    const presenceReadyRef = useRef(false);
    const membersRef = useRef<Map<number, PresenceMember>>(new Map());
    const typersRef = useRef<
        Map<
            number,
            { user: CommentTypingUser; timeout: ReturnType<typeof setTimeout> }
        >
    >(new Map());

    const isTypingRef = useRef(false);
    const lastActiveWhisperRef = useRef(0);
    const localIdleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const draftIsFocusedRef = useRef(false);
    const draftContentRef = useRef('');

    // Keep the latest identity without resubscribing the presence effect.
    const currentUserIdRef = useRef(currentUserId);
    useEffect(() => {
        currentUserIdRef.current = currentUserId;
    });

    const publishTypers = useCallback(() => {
        setTypingUsers(
            Array.from(typersRef.current.values(), (entry) => entry.user),
        );
    }, []);

    const removeTyper = useCallback(
        (userId: number) => {
            const entry = typersRef.current.get(userId);

            if (!entry) {
                return;
            }

            clearTimeout(entry.timeout);
            typersRef.current.delete(userId);
            publishTypers();
        },
        [publishTypers],
    );

    const markTyperActive = useCallback(
        (member: PresenceMember) => {
            const existing = typersRef.current.get(member.user_id);

            if (existing) {
                clearTimeout(existing.timeout);
            }

            typersRef.current.set(member.user_id, {
                user: {
                    userId: member.user_id,
                    name: member.name,
                    avatar: member.avatar,
                },
                timeout: setTimeout(
                    () => removeTyper(member.user_id),
                    IDLE_TIMEOUT_MS,
                ),
            });
            publishTypers();
        },
        [publishTypers, removeTyper],
    );

    const whisperTyping = useCallback((active: boolean) => {
        const userId = currentUserIdRef.current;

        if (userId === null) {
            return;
        }

        const presenceChannel = presenceRef.current;

        if (!presenceChannel || !presenceReadyRef.current) {
            return;
        }

        try {
            presenceChannel.whisper('typing', {
                user_id: userId,
                active,
                sent_at: Date.now(),
            } satisfies TypingWhisper);
        } catch {
            // Typing presence is best-effort and must never block comment creation.
        }
    }, []);

    const clearLocalIdleTimeout = useCallback(() => {
        if (localIdleTimeoutRef.current === null) {
            return;
        }

        clearTimeout(localIdleTimeoutRef.current);
        localIdleTimeoutRef.current = null;
    }, []);

    const stopTyping = useCallback(() => {
        clearLocalIdleTimeout();
        lastActiveWhisperRef.current = 0;

        if (!isTypingRef.current) {
            return;
        }

        isTypingRef.current = false;
        whisperTyping(false);
    }, [clearLocalIdleTimeout, whisperTyping]);

    const announceTypingActivity = useCallback(() => {
        if (
            !presenceEnabled ||
            !draftIsFocusedRef.current ||
            draftContentRef.current.trim().length === 0
        ) {
            stopTyping();

            return;
        }

        const now = Date.now();
        const shouldWhisper =
            !isTypingRef.current ||
            now - lastActiveWhisperRef.current >= ACTIVE_WHISPER_THROTTLE_MS;

        if (shouldWhisper) {
            isTypingRef.current = true;
            lastActiveWhisperRef.current = now;
            whisperTyping(true);
        }

        clearLocalIdleTimeout();
        localIdleTimeoutRef.current = setTimeout(
            stopTyping,
            LOCAL_IDLE_STOP_MS,
        );
    }, [clearLocalIdleTimeout, presenceEnabled, stopTyping, whisperTyping]);

    const setDraftContent = useCallback(
        (content: string) => {
            draftContentRef.current = content;

            if (
                !presenceEnabled ||
                !draftIsFocusedRef.current ||
                content.trim().length === 0
            ) {
                stopTyping();

                return;
            }

            announceTypingActivity();
        },
        [announceTypingActivity, presenceEnabled, stopTyping],
    );

    const handleDraftFocus = useCallback(() => {
        draftIsFocusedRef.current = true;
    }, []);

    const handleDraftBlur = useCallback(() => {
        draftIsFocusedRef.current = false;
        stopTyping();
    }, [stopTyping]);

    useEffect(() => {
        if (!presenceEnabled) {
            stopTyping();

            return;
        }

        const presenceChannel = echo<'reverb'>().join(channel);
        presenceRef.current = presenceChannel;

        const members = membersRef.current;
        const typers = typersRef.current;
        const myId = currentUserIdRef.current;

        presenceChannel.subscribed(() => {
            presenceReadyRef.current = true;
        });

        presenceChannel.error(() => {
            presenceReadyRef.current = false;
        });

        const stopWatchingConnection =
            echo<'reverb'>().connector.onConnectionChange((status) => {
                if (status !== 'connected') {
                    presenceReadyRef.current = false;
                }
            });

        presenceChannel.here((current: PresenceMember[]) => {
            members.clear();
            current.forEach((member) => members.set(member.user_id, member));
        });

        presenceChannel.joining((member: PresenceMember) => {
            members.set(member.user_id, member);
        });

        presenceChannel.leaving((member: PresenceMember) => {
            members.delete(member.user_id);
            removeTyper(member.user_id);
        });

        presenceChannel.listenForWhisper('typing', (payload: TypingWhisper) => {
            if (!payload || typeof payload.user_id !== 'number') {
                return;
            }

            if (payload.user_id === myId) {
                return;
            }

            const member = members.get(payload.user_id);

            if (!member) {
                return;
            }

            if (payload.active) {
                markTyperActive(member);
            } else {
                removeTyper(payload.user_id);
            }
        });

        return () => {
            stopTyping();
            stopWatchingConnection();
            presenceReadyRef.current = false;
            presenceChannel.stopListeningForWhisper('typing');
            typers.forEach((entry) => clearTimeout(entry.timeout));
            typers.clear();
            members.clear();
            setTypingUsers([]);

            if (presenceRef.current === presenceChannel) {
                presenceRef.current = null;
            }

            echo().leaveChannel(`presence-${channel}`);
        };
    }, [presenceEnabled, channel, markTyperActive, removeTyper, stopTyping]);

    // Clear the remote indicator when this page can no longer send its stop signal.
    useEffect(() => {
        if (!presenceEnabled) {
            return;
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                stopTyping();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
            stopTyping();
        };
    }, [presenceEnabled, stopTyping]);

    return {
        typingUsers,
        setDraftContent,
        handleDraftFocus,
        handleDraftBlur,
        stopTyping,
    };
}
