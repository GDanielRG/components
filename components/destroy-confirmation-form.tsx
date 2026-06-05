import { Form } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import DeleteConfirmationModal from '@/components/delete-confirmation-modal';

type DestroyConfirmationFormProps = {
    action: ComponentProps<typeof Form>['action'];
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    title: string;
    description: string;
    cancelLabel?: string;
    confirmLabel?: string;
};

export default function DestroyConfirmationForm({
    action,
    isOpen,
    setIsOpen,
    title,
    description,
    cancelLabel,
    confirmLabel,
}: DestroyConfirmationFormProps) {
    return (
        <Form
            action={action}
            showProgress={false}
            disableWhileProcessing
            onSuccess={() => setIsOpen(false)}
        >
            {({ processing, submit }) => (
                <DeleteConfirmationModal
                    isOpen={isOpen || processing}
                    setIsOpen={setIsOpen}
                    title={title}
                    description={description}
                    processing={processing}
                    onDestroy={submit}
                    cancelLabel={cancelLabel}
                    confirmLabel={confirmLabel}
                />
            )}
        </Form>
    );
}
