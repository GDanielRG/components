import { usePage } from '@inertiajs/react';
import type { RealtimeUpdatesProps } from '@/components/realtime/realtime-updates';
import { RealtimeUpdates } from '@/components/realtime/realtime-updates';
import { useCommentTypingPresence } from '@/hooks/use-comment-typing-presence';
import { configureRealtimeEcho } from '@/lib/realtime';

type GeneratedChannel = `comments.posts.${string | number}`;
type AppCacheTag = 'posts' | 'dashboard';

const liveUpdates = {
    feature: 'comments',
    channel: 'comments.posts.1' satisfies GeneratedChannel,
    event: '.CommentChanged',
    only: ['comments'],
    invalidateCacheTags: ['posts'] satisfies AppCacheTag[],
} satisfies Omit<RealtimeUpdatesProps, 'enabled' | 'visible'>;

/** Type-only smoke consumer for app-generated realtime values. */
export function RealtimeContract() {
    configureRealtimeEcho(usePage().props.realtime.connection);

    const typing = useCommentTypingPresence({
        channel:
            'comments.typing.posts.1' satisfies `comments.typing.posts.${number}`,
        enabled: true,
        visible: true,
    });

    return (
        <div data-typing={typing.typingUsers.length}>
            <RealtimeUpdates {...liveUpdates} enabled visible />
        </div>
    );
}
