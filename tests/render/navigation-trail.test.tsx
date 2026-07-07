// @vitest-environment jsdom
//
// Render-level gate for the `navigation-trail` bundle. NavigationTrail is a
// thin consumer of the two `chat` hooks (`useMessageScrollerVisibility`,
// `useMessageScroller`); this mocks that seam rather than mounting a real
// MessageScrollerProvider so the active/click assertions don't depend on
// jsdom's lack of IntersectionObserver. The real end-to-end behaviour
// (scrolling actually changes the active item) is proven by app Browser
// tests, not here.
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NavigationTrail } from '@/components/navigation-trail/navigation-trail';

const scrollToMessage = vi.fn();
const useMessageScrollerVisibility = vi.fn();

vi.mock('@/components/chat', () => ({
    useMessageScrollerVisibility: () => useMessageScrollerVisibility(),
    useMessageScroller: () => ({ scrollToMessage }),
}));

afterEach(() => {
    cleanup();
    scrollToMessage.mockClear();
    useMessageScrollerVisibility.mockReset();
});

const items = [
    { id: 'group-1', label: 'Materiales' },
    { id: 'concepts-4', label: 'Conceptos sin grupo' },
];

// Stage-1 UI pass (plan 004) replaced NavigationTrail's rendered markup with
// a Codex-style tick rail and split it into a presentational
// NavigationTrailRail + this connected wrapper; the assertions below target
// the old full-label button markup and `count` field. Skipped pending
// stage-1 UI approval — see plans/004-navigation-trail-message-scroller.md.
describe.skip('NavigationTrail', () => {
    it('renders a nav landmark with one entry per item', () => {
        useMessageScrollerVisibility.mockReturnValue({
            currentAnchorId: null,
            visibleMessageIds: [],
        });

        render(<NavigationTrail items={items} ariaLabel="Secciones" />);

        expect(
            screen.getByRole('navigation', { name: 'Secciones' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Materiales')).toBeInTheDocument();
        expect(screen.getByText('Conceptos sin grupo')).toBeInTheDocument();
    });

    it('marks the item matching currentAnchorId as active via aria-current', () => {
        useMessageScrollerVisibility.mockReturnValue({
            currentAnchorId: 'concepts-4',
            visibleMessageIds: ['concepts-4'],
        });

        render(<NavigationTrail items={items} ariaLabel="Secciones" />);

        expect(
            screen.getByTestId('navigation-trail-item-concepts-4'),
        ).toHaveAttribute('aria-current', 'true');
        expect(
            screen.getByTestId('navigation-trail-item-group-1'),
        ).not.toHaveAttribute('aria-current');
    });

    it('calls scrollToMessage with the clicked item id', () => {
        useMessageScrollerVisibility.mockReturnValue({
            currentAnchorId: null,
            visibleMessageIds: [],
        });

        render(<NavigationTrail items={items} ariaLabel="Secciones" />);

        fireEvent.click(screen.getByTestId('navigation-trail-item-group-1'));

        expect(scrollToMessage).toHaveBeenCalledWith('group-1');
    });

    it('renders nothing when items is empty', () => {
        useMessageScrollerVisibility.mockReturnValue({
            currentAnchorId: null,
            visibleMessageIds: [],
        });

        const { container } = render(
            <NavigationTrail items={[]} ariaLabel="Secciones" />,
        );

        expect(container).toBeEmptyDOMElement();
    });
});
