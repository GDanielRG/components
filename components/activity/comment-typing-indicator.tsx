import { useEffect, useRef, useState } from 'react';
import type { ActivityCopy } from '@/components/types/shared-component-copy';
import {
    Avatar,
    AvatarFallback,
    AvatarGroup,
    AvatarGroupCount,
    AvatarImage,
} from '@/components/ui/avatar';
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

/**
 * Minimal display shape for a user currently typing a comment. The app maps its
 * presence/whisper payload onto this; the registry component is presentational
 * and never sees channel names, policies, email, or draft content.
 */
export interface CommentTypingIndicatorUser {
    id: number | string;
    name: string;
    avatar?: string | null;
}

const MAX_VISIBLE_AVATARS = 3;

/**
 * Enter/leave duration. Kept in sync with the `duration-300` utility on the
 * animated wrapper below — change both together.
 */
const TYPING_TRANSITION_MS = 300;

function avatarInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return '?';
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Ephemeral "someone is typing" affordance for the end of the comments panel: a
 * grouped-avatar marker with a single shimmering localized line. Pure
 * presentation — no live wiring here.
 *
 * It stays mounted through its own leave transition (collapsing height + fade)
 * so it eases out instead of vanishing, retaining the last roster while it
 * closes. Once empty it unmounts and renders nothing; the parent list item is
 * `empty:hidden`, so a closed indicator leaves no gap behind.
 */
export function CommentTypingIndicator({
    users,
}: {
    users: CommentTypingIndicatorUser[];
}) {
    const copy: ActivityCopy = useSharedComponentCopy();
    const hasTypers = users.length > 0;

    // Stable content key so the presence effect reacts to roster *changes*, not
    // to every fresh array identity from the parent (which would otherwise keep
    // resetting the leave timer and pin a phantom row open).
    const rosterKey = users.map((user) => `${user.id}:${user.name}`).join('|');

    const [isMounted, setIsMounted] = useState(hasTypers);
    // Last non-empty roster, held on screen while the marker animates closed.
    const [roster, setRoster] = useState(users);

    // Mirror props into a ref so the key-driven presence effect can read the
    // latest users without depending on the per-render array identity. Synced
    // post-commit per the project's react-hooks/refs rule.
    const usersRef = useRef(users);
    useEffect(() => {
        usersRef.current = users;
    });

    useEffect(() => {
        if (rosterKey.length > 0) {
            setRoster(usersRef.current);
            setIsMounted(true);

            return;
        }

        const timeout = setTimeout(
            () => setIsMounted(false),
            TYPING_TRANSITION_MS,
        );

        return () => clearTimeout(timeout);
    }, [rosterKey]);

    if (!isMounted) {
        return null;
    }

    const displayUsers = hasTypers ? users : roster;
    const visibleUsers = displayUsers.slice(0, MAX_VISIBLE_AVATARS);
    const overflowCount = displayUsers.length - visibleUsers.length;

    return (
        <div
            data-test="comment-typing-indicator"
            data-state={hasTypers ? 'open' : 'closed'}
            className="grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-300 ease-out data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0 motion-reduce:transition-none starting:grid-rows-[0fr] starting:opacity-0"
        >
            <div className="overflow-hidden">
                <Marker className="px-3 py-1">
                    <MarkerIcon className="h-6 w-auto">
                        <AvatarGroup>
                            {visibleUsers.map((user) => (
                                <Avatar key={user.id} size="sm">
                                    {user.avatar ? (
                                        <AvatarImage
                                            src={user.avatar}
                                            alt={user.name}
                                        />
                                    ) : null}
                                    <AvatarFallback>
                                        {avatarInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {overflowCount > 0 ? (
                                <AvatarGroupCount>
                                    +{overflowCount}
                                </AvatarGroupCount>
                            ) : null}
                        </AvatarGroup>
                    </MarkerIcon>
                    <MarkerContent className="shimmer text-xs">
                        {copy.commentsTyping(
                            displayUsers.map((user) => user.name),
                        )}
                    </MarkerContent>
                </Marker>
            </div>
        </div>
    );
}
