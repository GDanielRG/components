import { Form } from '@inertiajs/react';
import type { ComponentProps, ReactNode } from 'react';
import DeleteConfirmationModal from '@/components/delete-confirmation-modal';

type FormProps = Omit<ComponentProps<typeof Form>, 'children'>;

type DestroyConfirmationFormBaseProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    title: string;
    description: ReactNode;
    confirmDataTest?: string;
    cancelLabel?: string;
    confirmLabel?: string;
};

type DestroyConfirmationFormProps = DestroyConfirmationFormBaseProps &
    (
        | {
              action: FormProps['action'];
              form?: never;
          }
        | {
              action?: never;
              form: FormProps;
          }
    );

export default function DestroyConfirmationForm({
    action,
    form,
    isOpen,
    setIsOpen,
    title,
    description,
    confirmDataTest,
    cancelLabel,
    confirmLabel,
}: DestroyConfirmationFormProps) {
    const formProps: FormProps = form ?? { action };

    return (
        <Form
            {...formProps}
            showProgress={false}
            options={{ preserveScroll: true, ...formProps.options }}
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
                    confirmDataTest={confirmDataTest}
                    cancelLabel={cancelLabel}
                    confirmLabel={confirmLabel}
                />
            )}
        </Form>
    );
}
