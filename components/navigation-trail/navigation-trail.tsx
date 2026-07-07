import {
    useMessageScroller,
    useMessageScrollerVisibility,
} from '@/components/chat';
import {
    NavigationTrailRail,
    type NavigationTrailItem,
} from '@/components/navigation-trail/navigation-trail-rail';

export type { NavigationTrailItem };

/**
 * Thin connected wrapper: bridges `chat`'s message-scroller hooks
 * (`useMessageScrollerVisibility` for the active id, `useMessageScroller` for
 * click-to-scroll) into `NavigationTrailRail`'s plain props. Must render
 * inside the same `MessageScrollerProvider` tree (from `chat`, typically via
 * `SectionScrollerProvider`) as the content it tracks.
 *
 * This file is the stage-2 swap seam: a future move to IntersectionObserver-
 * driven visibility would replace this wrapper's internals only —
 * `NavigationTrailRail` (the presentational rail) would not change.
 */
function NavigationTrail({
    items,
    ariaLabel,
    className,
    contentWidthClassName,
}: {
    items: NavigationTrailItem[];
    ariaLabel: string;
    className?: string;
    contentWidthClassName?: string;
}) {
    const { currentAnchorId } = useMessageScrollerVisibility();
    const { scrollToMessage } = useMessageScroller();

    return (
        <NavigationTrailRail
            items={items}
            activeId={currentAnchorId}
            onSelect={scrollToMessage}
            ariaLabel={ariaLabel}
            className={className}
            contentWidthClassName={contentWidthClassName}
        />
    );
}

export { NavigationTrail };
