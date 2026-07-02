import { RotateCcwIcon, XIcon } from 'lucide-react';
import type { PendingDocumentUpload } from '@/components/documents/types';
import { formatBytes } from '@/components/documents/utils';
import type {
    DialogCopy,
    DocumentsCopy,
} from '@/components/types/shared-component-copy';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';
import { Progress } from '@/components/ui/progress';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';

interface DocumentUploadStatusProps {
    upload: PendingDocumentUpload;
    onRetry: () => void;
    onDismiss: () => void;
    onCancel: () => void;
}

/**
 * Compact batch-level status for a pending upload. The per-file rows live inline
 * in the documents list; this only owns the honest group-level progress while
 * uploading, and the error + retry/dismiss affordance on failure.
 */
export function DocumentUploadStatus({
    upload,
    onRetry,
    onDismiss,
    onCancel,
}: DocumentUploadStatusProps) {
    const copy: DialogCopy & DocumentsCopy = useSharedComponentCopy();
    const { isUploading, progress, loadedBytes, totalBytes, error, canRetry } =
        upload;

    return (
        <div
            data-test="sidebar-document-batch-card"
            className={cn(
                'flex flex-col gap-2 rounded-xl border bg-card p-3 text-sm shadow-sm',
                !isUploading && 'border-destructive/30',
            )}
        >
            {isUploading ? (
                <>
                    <div className="flex items-center justify-between gap-2">
                        <span
                            className="min-w-0 truncate font-medium"
                            data-test="sidebar-document-batch-title"
                        >
                            {copy.documentsUploading}
                        </span>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="-mr-1 shrink-0"
                            onClick={onCancel}
                            aria-label={copy.documentsCancelBatch}
                            data-test="sidebar-document-batch-dismiss-button"
                        >
                            <XIcon data-icon="icon" />
                        </Button>
                    </div>

                    <Progress value={progress ?? 0} />

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                            {copy.documentsUploadProgress(
                                formatBytes(loadedBytes),
                                formatBytes(totalBytes),
                            )}
                        </span>
                        <span>{Math.round(progress ?? 0)}%</span>
                    </div>
                </>
            ) : (
                <>
                    <FieldError
                        className="font-medium"
                        data-test="sidebar-document-batch-general-error"
                    >
                        {error ?? copy.documentsReviewErrors}
                    </FieldError>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onDismiss}
                            data-test="sidebar-document-batch-dismiss-button-footer"
                        >
                            {canRetry ? copy.dialogCancel : copy.dialogClose}
                        </Button>

                        {canRetry && (
                            <Button
                                type="button"
                                onClick={onRetry}
                                data-test="sidebar-document-batch-retry-button"
                            >
                                <RotateCcwIcon data-icon="inline-start" />
                                {copy.documentsRetry}
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
