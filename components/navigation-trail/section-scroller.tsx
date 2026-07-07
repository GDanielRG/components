import type { ComponentProps, ReactNode } from 'react';
import {
    MessageScroller,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from '@/components/chat';

/**
 * Document-style preset over `chat`'s `MessageScrollerProvider`:
 * `defaultScrollPosition="start"`, no `autoScroll` — the opposite defaults
 * from the comments sidebar's own composition (`autoScroll`,
 * `defaultScrollPosition="end"`).
 *
 * Kept separate from `SectionScroller` (rather than folding the provider
 * into it) because `NavigationTrail` must render inside the same provider
 * tree as the scroller it tracks, and it is typically laid out as a sibling
 * of the scroller box (e.g. a sticky rail beside it), not inside it — wrap
 * BOTH in one `SectionScrollerProvider`, not one each.
 */
function SectionScrollerProvider({ children }: { children: ReactNode }) {
    return (
        <MessageScrollerProvider defaultScrollPosition="start">
            {children}
        </MessageScrollerProvider>
    );
}

/**
 * The scrolling box itself: `MessageScroller` + `Viewport` + `Content`. Must
 * render inside a `SectionScrollerProvider` (or another `MessageScrollerProvider`
 * from `chat`).
 *
 * The underlying primitive measures visibility and scroll targets from
 * `content.children` directly — it does not descend into nested wrappers.
 * `children` passed here MUST render as direct DOM children of the content
 * element: no wrapping `<div>` between `SectionScroller` and each
 * `SectionScrollerItem`. Put container/spacing classes on `contentClassName`,
 * never on an intermediate wrapper.
 */
function SectionScroller({
    children,
    className,
    contentClassName,
}: {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}) {
    return (
        <MessageScroller className={className}>
            <MessageScrollerViewport>
                <MessageScrollerContent className={contentClassName}>
                    {children}
                </MessageScrollerContent>
            </MessageScrollerViewport>
        </MessageScroller>
    );
}

/**
 * `MessageScrollerItem` with `scrollAnchor` defaulting to `true`, so a
 * SectionScroller row is trackable by `currentAnchorId` out of the box.
 * Do not change `chat`'s own `MessageScrollerItem` default (`false`) to
 * match — the comments sidebar depends on it staying `false` so only the
 * live-typing row opts in explicitly.
 */
function SectionScrollerItem({
    scrollAnchor = true,
    ...props
}: ComponentProps<typeof MessageScrollerItem>) {
    return <MessageScrollerItem scrollAnchor={scrollAnchor} {...props} />;
}

export { SectionScrollerProvider, SectionScroller, SectionScrollerItem };
