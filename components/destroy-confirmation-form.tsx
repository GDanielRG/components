import { Form } from '@inertiajs/react';
import type { ComponentProps, ReactNode } from 'react';
import DeleteConfirmationModal from '@/components/delete-confirmation-modal';

type FormProps = Omit<ComponentProps<typeof Form>, 'children'>;

type DestroyConfirmationFormBaseProps = {
    title: string;
    description: ReactNode;
    confirmDataTest?: string;
    cancelLabel?: string;
    confirmLabel?: string;
};

type DestroyConfirmationFormControlProps =
    | {
          isOpen: boolean;
          setIsOpen: (isOpen: boolean) => void;
          open?: never;
          onOpenChange?: never;
      }
    | {
          isOpen?: never;
          setIsOpen?: never;
          open: boolean;
          onOpenChange: (open: boolean) => void;
      };

type DestroyConfirmationFormRouteProps =
    | {
          action: FormProps['action'];
          form?: never;
      }
    | {
          action?: never;
          form: FormProps;
      };

type DestroyConfirmationFormProps = DestroyConfirmationFormBaseProps &
    DestroyConfirmationFormControlProps &
    DestroyConfirmationFormRouteProps;

export default function DestroyConfirmationForm({
    action,
    form,
    isOpen,
    setIsOpen,
    open,
    onOpenChange,
    title,
    description,
    confirmDataTest,
    cancelLabel,
    confirmLabel,
}: DestroyConfirmationFormProps) {
    const formProps: FormProps = form ?? { action };
    const resolvedIsOpen = isOpen ?? open;
    const setResolvedIsOpen = setIsOpen ?? onOpenChange;

    return (
        <Form
            {...formProps}
            showProgress={false}
            options={{ preserveScroll: true, ...formProps.options }}
            disableWhileProcessing
            onSuccess={() => setResolvedIsOpen(false)}
        >
            {({ processing, submit }) => (
                <DeleteConfirmationModal
                    isOpen={resolvedIsOpen || processing}
                    setIsOpen={setResolvedIsOpen}
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
