// @vitest-environment jsdom
//
// Accessibility regression gate for the DialogFormLayout header. The layout
// used to render the title through `CardTitle` (a plain `div`) and the
// description through `CardDescription`, which cost the dialog its `h2` / `p`
// semantics. It now renders Base UI's `DialogTitle` / `DialogDescription` in
// their default elements, so this mounts the REAL layout inside a REAL Base UI
// dialog and proves:
//   1. the popup's `aria-labelledby` resolves to the element carrying the
//      visible title text, and that element is an `h2`;
//   2. `aria-describedby` resolves to the `p` carrying the description;
//   3. `aria-describedby` is ABSENT when no description is passed (a dangling
//      reference is worse than none).
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DialogFormLayout } from '@/components/dialog-form-layout';
import { Dialog, DialogContent } from '@/components/ui/dialog';

afterEach(cleanup);

const title = 'Editar empleado';
const description = 'Actualiza los datos del empleado.';

function renderDialogForm(props: { description?: string } = {}) {
    render(
        <Dialog open={true}>
            <DialogContent data-test="dialog-popup">
                <DialogFormLayout title={title} description={props.description}>
                    <input aria-label="Nombre" />
                </DialogFormLayout>
            </DialogContent>
        </Dialog>,
    );

    return screen.getByTestId('dialog-popup');
}

function resolveReference(popup: HTMLElement, attribute: string) {
    const id = popup.getAttribute(attribute);

    expect(id).not.toBeNull();

    return document.getElementById(id as string);
}

describe('DialogFormLayout — header semantics', () => {
    it('labels the popup with the visible title, rendered as a heading', () => {
        const popup = renderDialogForm();
        const label = resolveReference(popup, 'aria-labelledby');

        expect(label).not.toBeNull();
        expect(label).toHaveTextContent(title);
        expect(label?.tagName).toBe('H2');
        // The title must be the accessible name, not merely present somewhere.
        expect(popup).toHaveAccessibleName(title);
    });

    it('describes the popup with the description paragraph when one is passed', () => {
        const popup = renderDialogForm({ description });
        const describedBy = resolveReference(popup, 'aria-describedby');

        expect(describedBy).not.toBeNull();
        expect(describedBy).toHaveTextContent(description);
        expect(describedBy?.tagName).toBe('P');
        expect(popup).toHaveAccessibleDescription(description);
    });

    it('omits aria-describedby entirely when no description is passed', () => {
        const popup = renderDialogForm();

        expect(popup).not.toHaveAttribute('aria-describedby');
    });
});
