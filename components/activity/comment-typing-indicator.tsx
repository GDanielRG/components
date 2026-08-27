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

export interface CommentTypingIndicatorUser {
    id: number | string;
    name: string;
    avatar?: string | null;
}

const MAX_VISIBLE_AVATARS = 3;

// Keep in sync with the wrapper's `duration-300` transition.
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

export function CommentTypingIndicator({
    users,
}: {
    users: CommentTypingIndicatorUser[];
}) {
    const copy: ActivityCopy = useSharedComponentCopy();
    const hasTypers = users.length > 0;

    // Key by roster content so fresh array identities cannot reset the leave timer.
    const rosterKey = users.map((user) => `${user.id}:${user.name}`).join('|');

    const [isMounted, setIsMounted] = useState(hasTypers);
    // Retain the last non-empty roster during the leave transition.
    const [roster, setRoster] = useState(users);

    // The key drives the effect; the ref supplies its latest roster.
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
