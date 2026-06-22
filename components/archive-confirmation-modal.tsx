import { ArchiveIcon, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import type {
    ArchiveCopy,
    DialogCopy,
} from '@/components/types/shared-component-copy';
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

/**
 * Confirmation dialog for archiving a record (a soft delete reused as archive).
 *
 * Mirrors the registry-owned {@link DeleteConfirmationModal} but with archive
 * semantics: a destructive action tone and the `ArchiveIcon`, because archiving
 * removes the record from the working dataset while keeping it reachable
 * read-only with an archive badge.
 */
export function ArchiveConfirmationModal({
    open,
    onOpenChange,
    title,
    description,
    processing,
    onArchive,
    confirmDataTest,
    cancelLabel,
    confirmLabel,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: ReactNode;
    processing: boolean;
    onArchive: () => void;
    confirmDataTest?: string;
    cancelLabel?: string;
    confirmLabel?: string;
}) {
    const copy: ArchiveCopy & DialogCopy = useSharedComponentCopy();
    const resolvedCancelLabel = cancelLabel ?? copy.dialogCancel;
    const resolvedConfirmLabel = confirmLabel ?? copy.archiveConfirmLabel;

    const submit = () => {
        if (!processing) {
            onArchive();
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10">
                        <ArchiveIcon className="stroke-destructive" />
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
                        variant="destructive"
                        onClick={submit}
                        disabled={processing}
                        data-test={confirmDataTest}
                    >
                        {processing ? (
                            <LoaderCircle
                                className="animate-spin"
                                data-icon="inline-start"
                            />
                        ) : (
                            <ArchiveIcon data-icon="inline-start" />
                        )}
                        {resolvedConfirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
