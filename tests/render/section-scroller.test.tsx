// @vitest-environment jsdom
//
// Mocks the `@/components/chat` seam, same as navigation-trail.test.tsx and
// for the same reason: the real `@shadcn/react` package is a registry
// metadata dependency for CONSUMER apps, not a devDependency of this repo, so
// it is not installed here and cannot be resolved by Vite even behind a
// `vi.mock` boundary. These tests exist to prove `SectionScroller`'s own
// contract — not to re-verify the primitive is a message scroller — so a
// faithful div-per-slot stand-in is sufficient: it proves
// `SectionScrollerItem` defaults `scrollAnchor` to `true` (closing the trap
// where `MessageScrollerItem` defaults it to `false`, so `currentAnchorId`
// never resolves) and that `SectionScroller`'s content element receives items
// as DIRECT children (closing the trap where the primitive's visibility/
// scroll walk reads `content.children` only and does not descend). The mock
// hooks are plain stubs, not real context, so they can't reproduce the
// "useMessageScroller must be used within a MessageScroller" failure that
// occurs when `NavigationTrail` sits outside `SectionScrollerProvider` — that
// contract is proved end to end by the app's real Pest Browser tests instead.
import type { ComponentProps, ReactNode } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    SectionScroller,
    SectionScrollerItem,
    SectionScrollerProvider,
} from '@/components/navigation-trail/section-scroller';

vi.mock('@/components/chat', () => ({
    MessageScrollerProvider: ({ children }: { children?: ReactNode }) => (
        <>{children}</>
    ),
    MessageScroller: ({ children, ...props }: ComponentProps<'div'>) => (
        <div data-slot="message-scroller" {...props}>
            {children}
        </div>
    ),
    MessageScrollerViewport: ({
        children,
        ...props
    }: ComponentProps<'div'>) => (
        <div data-slot="message-scroller-viewport" {...props}>
            {children}
        </div>
    ),
    MessageScrollerContent: ({ children, ...props }: ComponentProps<'div'>) => (
        <div data-slot="message-scroller-content" {...props}>
            {children}
        </div>
    ),
    MessageScrollerItem: ({
        messageId,
        scrollAnchor = false,
        children,
        ...props
    }: {
        messageId?: string;
        scrollAnchor?: boolean;
        children?: ReactNode;
    } & ComponentProps<'div'>) => (
        <div
            data-slot="message-scroller-item"
            data-message-id={messageId}
            data-scroll-anchor={scrollAnchor ? 'true' : 'false'}
            {...props}
        >
            {children}
        </div>
    ),
}));

afterEach(() => {
    cleanup();
});

describe('SectionScrollerItem', () => {
    it('defaults scrollAnchor to true', () => {
        const { getByTestId } = render(
            <SectionScrollerProvider>
                <SectionScroller>
                    <SectionScrollerItem messageId="a" data-test="row-a">
                        <div>A</div>
                    </SectionScrollerItem>
                </SectionScroller>
            </SectionScrollerProvider>,
        );

        expect(getByTestId('row-a')).toHaveAttribute(
            'data-scroll-anchor',
            'true',
        );
    });

    it('allows scrollAnchor to be overridden to false', () => {
        const { getByTestId } = render(
            <SectionScrollerProvider>
                <SectionScroller>
                    <SectionScrollerItem
                        messageId="a"
                        scrollAnchor={false}
                        data-test="row-a"
                    >
                        <div>A</div>
                    </SectionScrollerItem>
                </SectionScroller>
            </SectionScrollerProvider>,
        );

        expect(getByTestId('row-a')).toHaveAttribute(
            'data-scroll-anchor',
            'false',
        );
    });
});

describe('SectionScroller', () => {
    it('renders SectionScrollerItem rows as direct children of the content element', () => {
        const { container, getByTestId } = render(
            <SectionScrollerProvider>
                <SectionScroller contentClassName="custom-content">
                    <SectionScrollerItem messageId="a" data-test="row-a">
                        <div>A</div>
                    </SectionScrollerItem>
                    <SectionScrollerItem messageId="b" data-test="row-b">
                        <div>B</div>
                    </SectionScrollerItem>
                </SectionScroller>
            </SectionScrollerProvider>,
        );

        const content = container.querySelector(
            '[data-slot="message-scroller-content"]',
        );

        expect(content).toHaveClass('custom-content');
        expect(getByTestId('row-a').parentElement).toBe(content);
        expect(getByTestId('row-b').parentElement).toBe(content);
    });

    it('breaks tracking silently when a row is wrapped in an extra div (documents the trap)', () => {
        const { container, getByTestId } = render(
            <SectionScrollerProvider>
                <SectionScroller>
                    <div className="accidental-wrapper">
                        <SectionScrollerItem messageId="a" data-test="row-a">
                            <div>A</div>
                        </SectionScrollerItem>
                    </div>
                </SectionScroller>
            </SectionScrollerProvider>,
        );

        const content = container.querySelector(
            '[data-slot="message-scroller-content"]',
        );

        expect(getByTestId('row-a').parentElement).not.toBe(content);
        expect(getByTestId('row-a').parentElement).toHaveClass(
            'accidental-wrapper',
        );
    });
});
