import { ChevronDownIcon, RotateCcwIcon, XIcon } from 'lucide-react';
import { DocumentErrorMessages } from '@/components/documents/document-error-messages';
import { DocumentFileIcon } from '@/components/documents/document-file-icon';
import type { DocumentUploadBatch } from '@/components/documents/types';
import { getDocumentDisplayName } from '@/components/documents/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { FieldError } from '@/components/ui/field';
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';
import type {
    DialogCopy,
    DocumentsCopy,
} from '../../types/shared-component-copy';

const formatBytes = (bytes: number): string => {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const kilobytes = bytes / 1024;

    if (kilobytes < 1024) {
        return `${kilobytes.toFixed(kilobytes >= 100 ? 0 : 1)} KB`;
    }

    const megabytes = kilobytes / 1024;

    return `${megabytes.toFixed(megabytes >= 100 ? 0 : 1)} MB`;
};

interface SidebarDocumentUploadCardProps {
    batch: DocumentUploadBatch;
    onRetry: () => void;
    onDismiss: () => void;
    onCancel: () => void;
}

export function SidebarDocumentUploadCard({
    batch,
    onRetry,
    onDismiss,
    onCancel,
}: SidebarDocumentUploadCardProps) {
    const copy: DialogCopy & DocumentsCopy = useSharedComponentCopy();
    const isUploading = batch.status === 'uploading';
    const hasItemErrors = Object.keys(batch.itemErrors).length > 0;
    const hasGeneralError = Boolean(batch.error);
    const showRetry = !isUploading && batch.canRetry;
    const handleCloseButtonClick = isUploading ? onCancel : onDismiss;
    const closeButtonLabel = isUploading
        ? copy.documentsCancelBatch
        : copy.documentsCloseUploadError;
    const progressLabel = isUploading
        ? copy.documentsUploadProgress(
              formatBytes(batch.loadedBytes),
              formatBytes(batch.totalBytes),
          )
        : formatBytes(batch.totalBytes);
    const title = isUploading
        ? copy.documentsUploading
        : copy.documentsUploadError;
    const description = isUploading
        ? progressLabel
        : copy.documentsUploadTotal(progressLabel);

    return (
        <Card
            size="sm"
            className="gap-0 rounded-xl border border-foreground/10 bg-background shadow-sm ring-0"
            data-test="sidebar-document-batch-card"
        >
            <CardHeader className="gap-0 pb-0">
                <div className="flex items-start justify-between gap-3">
                    <CardTitle
                        className="min-w-0 flex-1 text-sm leading-snug"
                        data-test="sidebar-document-batch-title"
                    >
                        {title}
                    </CardTitle>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={handleCloseButtonClick}
                        aria-label={closeButtonLabel}
                        data-test="sidebar-document-batch-dismiss-button"
                        className="-mt-0.5 shrink-0"
                    >
                        <XIcon />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Popover>
                        <Badge
                            variant="outline"
                            className={cn(
                                'group cursor-pointer underline decoration-dotted underline-offset-4',
                                hasItemErrors &&
                                    'border-destructive/30 text-destructive',
                            )}
                            data-test="sidebar-document-batch-items-trigger"
                            render={<PopoverTrigger />}
                        >
                            <ChevronDownIcon className="transition-transform duration-200 group-data-[popup-open]:rotate-180" />
                            {copy.documentsCount(batch.items.length)}
                        </Badge>
                        <PopoverContent
                            side="top"
                            align="end"
                            className="max-h-72 w-80 overflow-y-auto p-0"
                            data-test="sidebar-document-batch-items-popover"
                        >
                            <ScrollArea className="max-h-72">
                                <ItemGroup className="gap-0 [&>[data-slot=item]:not(:last-child)]:border-b [&>[data-slot=item]:not(:last-child)]:border-border">
                                    {batch.items.map((item) => {
                                        const itemErrors =
                                            batch.itemErrors[item.tempId] ?? {};
                                        const displayName =
                                            getDocumentDisplayName(item);

                                        return (
                                            <Item
                                                key={item.tempId}
                                                size="sm"
                                                className="items-start rounded-none px-3 py-2.5"
                                            >
                                                <ItemMedia className="mt-0.5 rounded-md bg-muted p-1.5 text-muted-foreground">
                                                    <DocumentFileIcon
                                                        className="size-4"
                                                        fileName={displayName}
                                                    />
                                                </ItemMedia>
                                                <ItemContent className="min-w-0 gap-0.5">
                                                    <ItemTitle className="line-clamp-none block w-full text-sm leading-snug break-words whitespace-normal">
                                                        {displayName}
                                                    </ItemTitle>
                                                    <ItemDescription className="line-clamp-none text-xs leading-tight">
                                                        {formatBytes(
                                                            item.file.size,
                                                        )}
                                                    </ItemDescription>
                                                    <DocumentErrorMessages
                                                        messages={[
                                                            itemErrors.name,
                                                            itemErrors.description,
                                                            itemErrors.file,
                                                            itemErrors.id,
                                                        ]}
                                                        className="pt-0.5"
                                                    />
                                                </ItemContent>
                                            </Item>
                                        );
                                    })}
                                </ItemGroup>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>

                    <CardDescription>{description}</CardDescription>
                </div>

                {hasGeneralError && (
                    <FieldError data-test="sidebar-document-batch-general-error">
                        {batch.error}
                    </FieldError>
                )}

                {isUploading && (
                    <div className="space-y-2">
                        <Progress value={batch.progress ?? 0} />
                        <p className="text-xs text-muted-foreground">
                            {Math.round(batch.progress ?? 0)}%
                        </p>
                    </div>
                )}

                {isUploading && (
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            data-test="sidebar-document-batch-cancel-button"
                        >
                            {copy.dialogCancel}
                        </Button>
                    </div>
                )}
            </CardContent>

            {!isUploading && (
                <CardFooter
                    className={cn(
                        'gap-2 pt-3',
                        showRetry ? 'justify-between' : 'justify-end',
                    )}
                >
                    <>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onDismiss}
                            data-test="sidebar-document-batch-dismiss-button-footer"
                        >
                            {showRetry ? copy.dialogCancel : copy.dialogClose}
                        </Button>
                        {showRetry && (
                            <Button
                                type="button"
                                onClick={onRetry}
                                data-test="sidebar-document-batch-retry-button"
                            >
                                <RotateCcwIcon />
                                {copy.documentsRetry}
                            </Button>
                        )}
                    </>
                </CardFooter>
            )}
        </Card>
    );
}
