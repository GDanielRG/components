import { Form } from '@inertiajs/react';
import type { ComponentProps, ReactNode } from 'react';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

type DestroyConfirmationFormProps = Omit<
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

export function DestroyConfirmationForm({
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
}: DestroyConfirmationFormProps) {
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
                <DeleteConfirmationModal
                    open={open || processing}
                    onOpenChange={onOpenChange}
                    title={title}
                    description={description}
                    processing={processing}
                    onDestroy={submit}
                    confirmDataTest={confirmDataTest}
                    cancelLabel={cancelLabel}
                    confirmLabel={confirmLabel}
                />
            )}
        </Form>
    );
}
