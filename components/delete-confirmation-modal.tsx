import { LoaderCircle, Trash2 } from 'lucide-react';
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

export default function DeleteConfirmationModal({
    isOpen,
    setIsOpen,
    title,
    description,
    processing,
    onDestroy,
    confirmDataTest,
    cancelLabel = 'Cancelar',
    confirmLabel = 'Eliminar',
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    title: string;
    description: string;
    processing: boolean;
    onDestroy: () => void;
    confirmDataTest?: string;
    cancelLabel?: string;
    confirmLabel?: string;
}) {
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
                        {cancelLabel}
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
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
