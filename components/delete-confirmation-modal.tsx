import { LoaderCircle, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

export default function DeleteConfirmationModal({
    isOpen,
    setIsOpen,
    title,
    description,
    processing,
    onDestroy,
    confirmDataTest,
    cancelLabel,
    confirmLabel,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    title: string;
    description: ReactNode;
    processing: boolean;
    onDestroy: () => void;
    confirmDataTest?: string;
    cancelLabel?: string;
    confirmLabel?: string;
}) {
    const copy = useSharedComponentCopy() as {
        dialogCancel?: string;
        dialogDelete?: string;
    };
    const resolvedCancelLabel = cancelLabel ?? copy.dialogCancel ?? 'Cancelar';
    const resolvedConfirmLabel =
        confirmLabel ?? copy.dialogDelete ?? 'Eliminar';

    const submit = () => {
        if (!processing) {
            onDestroy();
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10">
                        <Trash2 className="stroke-destructive" />
                    </AlertDialogMedia>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={() => setIsOpen(false)}
                        disabled={processing}
                    >
                        {resolvedCancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={submit}
                        disabled={processing}
                        variant="destructive"
                        data-test={confirmDataTest}
                    >
                        {processing ? (
                            <LoaderCircle
                                className="animate-spin"
                                data-icon="inline-start"
                            />
                        ) : (
                            <Trash2 data-icon="inline-start" />
                        )}
                        {resolvedConfirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
