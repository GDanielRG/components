import { Form } from '@inertiajs/react';
import type { ComponentProps, ReactNode } from 'react';
import { ArchiveConfirmationModal } from '@/components/archive-confirmation-modal';

type ArchiveConfirmationFormProps = Omit<
    ComponentProps<typeof Form>,
    'children'
> & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: ReactNode;
    confirmDataTest?: string;
    cancelLabel?: string;
    confirmLabel?: string;
};

/**
 * Archive analog of {@link DestroyConfirmationForm}: pairs an Inertia `<Form>`
 * with the registry {@link ArchiveConfirmationModal}. Archive reuses the DELETE
 * route, so callers pass the resource's `destroy` action as `action`.
 */
export function ArchiveConfirmationForm({
    open,
    onOpenChange,
    title,
    description,
    confirmDataTest,
    cancelLabel,
    confirmLabel,
    options,
    onSuccess,
    ...formProps
}: ArchiveConfirmationFormProps) {
    return (
        <Form
            {...formProps}
            showProgress={false}
            options={{ preserveScroll: true, ...options }}
            disableWhileProcessing
            onSuccess={(...args) => {
                onOpenChange(false);
                onSuccess?.(...args);
            }}
        >
            {({ processing, submit }) => (
                <ArchiveConfirmationModal
                    open={open || processing}
                    onOpenChange={onOpenChange}
                    title={title}
                    description={description}
                    processing={processing}
                    onArchive={submit}
                    confirmDataTest={confirmDataTest}
                    cancelLabel={cancelLabel}
                    confirmLabel={confirmLabel}
                />
            )}
        </Form>
    );
}
