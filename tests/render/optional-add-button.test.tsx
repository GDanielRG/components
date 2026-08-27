// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OptionalAddButton } from '@/components/optional-add-button';

vi.mock('@/components/ui/collapsible', async () => {
    const { Collapsible } = await import('@base-ui/react/collapsible');

    return {
        Collapsible: Collapsible.Root,
        CollapsibleTrigger: Collapsible.Trigger,
        CollapsibleContent: Collapsible.Panel,
    };
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('OptionalAddButton focus handoff', () => {
    it('focuses the first enabled control when the content opens', () => {
        render(
            <OptionalAddButton buttonText="Add details">
                <input type="hidden" />
                <button type="button" disabled>
                    Disabled
                </button>
                <input aria-label="Details" />
            </OptionalAddButton>,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

        expect(screen.getByRole('textbox', { name: 'Details' })).toHaveFocus();
    });

    it('moves focus without scrolling the revealed content', () => {
        const focus = vi.spyOn(HTMLElement.prototype, 'focus');

        render(
            <OptionalAddButton buttonText="Add details">
                <input aria-label="Details" />
            </OptionalAddButton>,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

        expect(focus).toHaveBeenCalledWith({ preventScroll: true });
        expect(screen.getByRole('textbox', { name: 'Details' })).toHaveFocus();
    });

    it('focuses the content when it has no enabled control', () => {
        render(
            <OptionalAddButton buttonText="Add note">
                <span>Nothing to edit</span>
            </OptionalAddButton>,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Add note' }));

        expect(screen.getByText('Nothing to edit').parentElement).toHaveFocus();
    });

    it('does not retain focus intent from a rejected controlled request', () => {
        function ControlledExample() {
            const [open, setOpen] = useState(false);

            return (
                <>
                    <button type="button" onClick={() => setOpen(true)}>
                        Open externally
                    </button>
                    <OptionalAddButton
                        buttonText="Add details"
                        open={open}
                        onOpenChange={() => {}}
                    >
                        <input aria-label="Details" />
                    </OptionalAddButton>
                </>
            );
        }

        render(<ControlledExample />);

        const trigger = screen.getByRole('button', { name: 'Add details' });
        fireEvent.click(trigger);
        fireEvent.click(trigger);

        const externalTrigger = screen.getByRole('button', {
            name: 'Open externally',
        });
        externalTrigger.focus();
        fireEvent.click(externalTrigger);

        expect(externalTrigger).toHaveFocus();
    });
});
