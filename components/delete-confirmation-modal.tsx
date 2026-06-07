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
import type { DialogCopy } from '../types/shared-component-copy';

export function DeleteConfirmationModal({
    open,
    onOpenChange,
    title,
    description,
    processing,
    onDestroy,
    confirmDataTest,
    cancelLabel,
    confirmLabel,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: ReactNode;
    processing: boolean;
    onDestroy: () => void;
    confirmDataTest?: string;
    cancelLabel?: string;
    confirmLabel?: string;
}) {
    const copy: DialogCopy = useSharedComponentCopy();
    const resolvedCancelLabel = cancelLabel ?? copy.dialogCancel;
    const resolvedConfirmLabel = confirmLabel ?? copy.dialogDelete;

    const submit = () => {
        if (!processing) {
            onDestroy();
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
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
                        onClick={() => onOpenChange(false)}
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
