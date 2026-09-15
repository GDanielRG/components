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

describe('DialogFormLayout — header semantics', () => {
    it('labels the popup with the visible title, rendered as a heading', () => {
        const popup = renderDialogForm();
        expect(screen.getByRole('heading', { name: title })).toBeVisible();
        expect(popup).toHaveAccessibleName(title);
    });

    it('describes the popup with the description element when one is passed', () => {
        const popup = renderDialogForm({ description });
        expect(screen.getByText(description)).toBeVisible();
        expect(popup).toHaveAccessibleDescription(description);
    });

    it('accepts structured description content', () => {
        const popup = renderDialogForm({
            description: <div data-test="metadata">Metadata</div>,
        });
        expect(screen.getByTestId('metadata')).toBeVisible();
        expect(popup).toHaveAccessibleDescription('Metadata');
    });

    it('has no accessible description when none is passed', () => {
        const popup = renderDialogForm();

        expect(popup).not.toHaveAccessibleDescription();
    });

    it('exposes the footer cancel action through the shared browser-test seam', () => {
        renderDialogForm({ footer: <button type="submit">Guardar</button> });

        expect(screen.getByTestId('dialog-cancel')).toBeVisible();
    });
});
