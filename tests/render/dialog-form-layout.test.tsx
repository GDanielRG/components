// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DialogFormLayout } from '@/components/dialog-form-layout';
import { Dialog, DialogContent } from '@/components/ui/dialog';

afterEach(cleanup);

const title = 'Editar empleado';
const description = 'Actualiza los datos del empleado.';

function renderDialogForm(
    props: { description?: React.ReactNode; footer?: React.ReactNode } = {},
) {
    render(
        <Dialog open={true}>
            <DialogContent data-test="dialog-popup">
                <DialogFormLayout
                    title={title}
                    description={props.description}
                    footer={props.footer}
                >
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
        expect(popup).toHaveAccessibleName(title);
    });

    it('describes the popup with the description element when one is passed', () => {
        const popup = renderDialogForm({ description });
        const describedBy = resolveReference(popup, 'aria-describedby');

        expect(describedBy).not.toBeNull();
        expect(describedBy).toHaveTextContent(description);
        expect(describedBy?.tagName).toBe('DIV');
        expect(popup).toHaveAccessibleDescription(description);
    });

    it('accepts structured description content without invalid paragraph nesting', () => {
        const popup = renderDialogForm({
            description: <div data-test="metadata">Metadata</div>,
        });
        const describedBy = resolveReference(popup, 'aria-describedby');

        expect(describedBy?.tagName).toBe('DIV');
        expect(screen.getByTestId('metadata')).toBeVisible();
        expect(popup).toHaveAccessibleDescription('Metadata');
    });

    it('omits aria-describedby entirely when no description is passed', () => {
        const popup = renderDialogForm();

        expect(popup).not.toHaveAttribute('aria-describedby');
    });

    it('exposes the footer cancel action through the shared browser-test seam', () => {
        renderDialogForm({ footer: <button type="submit">Guardar</button> });

        expect(screen.getByTestId('dialog-cancel')).toBeVisible();
    });
});
