import { useForm } from '@inertiajs/react';
import {
    CloudAlertIcon,
    DownloadCloudIcon,
    FileTextIcon,
    LoaderCircle,
    MoreHorizontalIcon,
    RefreshCwIcon,
    RotateCcwIcon,
    SaveIcon,
    TrashIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { ActionsDropdownMenu } from '@/components/actions-dropdown-menu';
import { DocumentErrorMessages } from '@/components/documents/document-error-messages';
import { DocumentFileIcon } from '@/components/documents/document-file-icon';
import type { ExistingDocumentData } from '@/components/documents/types';
import { getDocumentDisplayName } from '@/components/documents/utils';
import { OptionalAddButton } from '@/components/optional-add-button';
import type {
    DocumentsCopy,
    FormCopy,
} from '@/components/types/shared-component-copy';
import type { RouteDefinition } from '@/components/types/wayfinder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { useIsSidebarSheet } from '@/hooks/use-sidebar-sheet';
import { cn } from '@/lib/utils';

const existingDocumentErrorFields = ['name', 'description', 'file'] as const;

interface ExistingDocumentFormData {
    name: string;
    description: string;
    file: File | null;
}

interface DocumentsPanelItemProps {
    document: ExistingDocumentData;
    updateDocumentAction: (
        documentId: number,
    ) => RouteDefinition<'put' | 'patch' | 'post'>;
    showDocumentAction: (documentId: number) => RouteDefinition<'get'>;
    onDelete?: () => void;
    acceptedMimes?: string;
}

export function DocumentsPanelItem({
    document,
    updateDocumentAction,
    showDocumentAction,
    onDelete,
    acceptedMimes,
}: DocumentsPanelItemProps) {
    const copy: DocumentsCopy & FormCopy = useSharedComponentCopy();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditingMetadata, setIsEditingMetadata] = useState(false);
    const isSidebarSheet = useIsSidebarSheet();
    const form = useForm<ExistingDocumentFormData>(
        updateDocumentAction(document.id),
        {
            name: document.name ?? '',
            description: document.description ?? '',
            file: null,
        },
    );

    const currentDocument: ExistingDocumentData = {
        ...document,
        name: form.data.name,
        description: form.data.description,
        file: form.data.file ?? undefined,
    };
    const editableName =
        currentDocument.name ?? getDocumentDisplayName(currentDocument);
    const displayName = getDocumentDisplayName(currentDocument);
    const hasEditableMetadata = Boolean(
        editableName || currentDocument.description,
    );
    const hasPendingFile = Boolean(currentDocument.file);
    const hasSavedDate =
        !form.isDirty && Boolean(document.formatted_updated_at_diff);
    const showMetadataEditor =
        !form.processing &&
        (isEditingMetadata || (form.isDirty && !hasPendingFile));
    const saveState = form.isDirty ? 'unsaved-changes' : 'saved';

    let metadataActionLabel = copy.documentsAddMetadata;

    if (showMetadataEditor) {
        metadataActionLabel = copy.documentsDiscardChanges;
    } else if (hasEditableMetadata) {
        metadataActionLabel = copy.documentsEditMetadata;
    }

    const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        form.setData('name', event.target.value);
        form.clearErrors('name');
    };

    const handleDescriptionChange = (
        event: ChangeEvent<HTMLTextAreaElement>,
    ) => {
        form.setData('description', event.target.value);
        form.clearErrors('description');
    };

    const handleFileReplace = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        form.setData('file', file);
        form.clearErrors('file');
        event.target.value = '';
    };

    const toggleMetadataEditor = () => {
        if (showMetadataEditor) {
            setIsEditingMetadata(false);
            form.resetAndClearErrors(...existingDocumentErrorFields);

            return;
        }

        if (
            (currentDocument.name === null ||
                currentDocument.name === undefined) &&
            editableName
        ) {
            form.setData('name', editableName);
        }

        setIsEditingMetadata(true);
    };

    const discardChanges = () => {
        form.resetAndClearErrors(...existingDocumentErrorFields);
    };

    const submitUpdate = () => {
        form.submit({
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingMetadata(false);
            },
        });
    };

    const fileError = form.errors.file;
    const showSaveButton =
        saveState === 'unsaved-changes' &&
        (showMetadataEditor || hasPendingFile);

    return (
        <div data-document-item className="bg-background">
            <Item className="items-start gap-2 rounded-none border-0 px-2 py-2.5 sm:gap-2.5 sm:px-3 sm:py-3">
                <ItemMedia className="mt-0.5 self-start">
                    <DocumentItemMedia
                        displayName={displayName}
                        processing={form.processing}
                        hasPendingFile={hasPendingFile}
                        hasFileError={Boolean(fileError)}
                    />
                </ItemMedia>

                <ItemContent className="min-w-0 gap-1.5">
                    <ItemTitle className="line-clamp-none block w-full text-sm leading-snug">
                        {showMetadataEditor ? (
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <Input
                                        type="text"
                                        value={editableName}
                                        onChange={handleNameChange}
                                        placeholder={
                                            copy.documentsNamePlaceholder
                                        }
                                        data-test={`document-name-input-${document.id}`}
                                    />
                                    <ExistingDocumentActionsMenu
                                        document={document}
                                        showDocumentAction={showDocumentAction}
                                        showMetadataEditor={showMetadataEditor}
                                        metadataActionLabel={
                                            metadataActionLabel
                                        }
                                        rowProcessing={form.processing}
                                        saveState={saveState}
                                        onToggleMetadataEditor={
                                            toggleMetadataEditor
                                        }
                                        onReplaceFile={() =>
                                            fileInputRef.current?.click()
                                        }
                                        onDiscardChanges={() => {
                                            discardChanges();
                                        }}
                                        onDelete={onDelete}
                                        buttonVariant="outline"
                                    />
                                </div>

                                <OptionalAddButton
                                    buttonText={copy.documentsAddDescription}
                                    defaultOpen={Boolean(
                                        currentDocument.description,
                                    )}
                                >
                                    <Textarea
                                        value={
                                            currentDocument.description || ''
                                        }
                                        onChange={handleDescriptionChange}
                                        placeholder={
                                            copy.documentsDescriptionPlaceholder
                                        }
                                        rows={3}
                                        data-test={`document-description-input-${document.id}`}
                                    />
                                </OptionalAddButton>
                            </div>
                        ) : (
                            <>
                                <span
                                    className={cn(
                                        'mr-1.5 break-words text-foreground sm:mr-2',
                                        fileError && 'text-destructive',
                                    )}
                                >
                                    {displayName || copy.documentsFallbackName}
                                </span>

                                <span className="inline-flex items-center gap-1.5 align-baseline whitespace-nowrap sm:gap-2">
                                    {hasSavedDate && (
                                        <SavedDocumentTimestamp
                                            formattedUpdatedAt={
                                                document.formatted_updated_at
                                            }
                                            formattedUpdatedAtDiff={
                                                document.formatted_updated_at_diff
                                            }
                                            isSidebarSheet={isSidebarSheet}
                                        />
                                    )}

                                    <ExistingDocumentActionsMenu
                                        document={document}
                                        showDocumentAction={showDocumentAction}
                                        showMetadataEditor={showMetadataEditor}
                                        metadataActionLabel={
                                            metadataActionLabel
                                        }
                                        rowProcessing={form.processing}
                                        saveState={saveState}
                                        onToggleMetadataEditor={
                                            toggleMetadataEditor
                                        }
                                        onReplaceFile={() =>
                                            fileInputRef.current?.click()
                                        }
                                        onDiscardChanges={() => {
                                            discardChanges();
                                        }}
                                        onDelete={onDelete}
                                        buttonVariant="ghost"
                                    />
                                </span>
                            </>
                        )}
                    </ItemTitle>

                    {!showMetadataEditor && currentDocument.description && (
                        <p className="text-sm leading-normal break-words text-foreground">
                            {currentDocument.description}
                        </p>
                    )}

                    {fileError && (
                        <div className="flex items-center justify-between gap-2 pt-1">
                            <Badge variant="destructive">
                                <CloudAlertIcon />
                                {copy.documentsFileError}
                            </Badge>
                        </div>
                    )}

                    {showSaveButton && (
                        <Button
                            type="button"
                            size="sm"
                            disabled={form.processing}
                            data-test={`save-document-item-button-${document.id}`}
                            onClick={submitUpdate}
                        >
                            <SaveIcon />
                            {copy.saveLabel}
                        </Button>
                    )}

                    <DocumentErrorMessages
                        messages={[
                            form.errors.name,
                            form.errors.description,
                            fileError,
                        ]}
                    />
                </ItemContent>
            </Item>

            <input
                id={`document-file-input-${document.id}`}
                ref={fileInputRef}
                type="file"
                accept={acceptedMimes}
                onChange={handleFileReplace}
                className="hidden"
            />
        </div>
    );
}

interface ExistingDocumentActionsMenuProps {
    document: ExistingDocumentData;
    showDocumentAction: (documentId: number) => RouteDefinition<'get'>;
    showMetadataEditor: boolean;
    metadataActionLabel: string;
    rowProcessing: boolean;
    saveState: 'saved' | 'unsaved-changes';
    onToggleMetadataEditor: () => void;
    onReplaceFile: () => void;
    onDiscardChanges: () => void;
    onDelete?: () => void;
    buttonVariant: 'ghost' | 'outline';
}

function ExistingDocumentActionsMenu({
    document,
    showDocumentAction,
    showMetadataEditor,
    metadataActionLabel,
    rowProcessing,
    saveState,
    onToggleMetadataEditor,
    onReplaceFile,
    onDiscardChanges,
    onDelete,
    buttonVariant,
}: ExistingDocumentActionsMenuProps) {
    const copy: DocumentsCopy & FormCopy = useSharedComponentCopy();

    return (
        <ActionsDropdownMenu
            align="start"
            contentClassName="w-fit"
            trigger={(open) => (
                <Button
                    variant={open ? 'secondary' : buttonVariant}
                    size="icon"
                    aria-label={copy.documentsActions}
                    data-test={`document-item-actions-${document.id}`}
                    disabled={rowProcessing}
                >
                    <MoreHorizontalIcon />
                </Button>
            )}
        >
            <DropdownMenuItem
                render={
                    <a
                        href={showDocumentAction(document.id).url}
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                }
            >
                <DownloadCloudIcon />
                {copy.documentsDownloadFile}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onToggleMetadataEditor}>
                <FileTextIcon />
                {metadataActionLabel}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onReplaceFile}>
                <RefreshCwIcon />
                {copy.documentsReplaceFile}
            </DropdownMenuItem>

            {saveState === 'unsaved-changes' && !showMetadataEditor && (
                <DropdownMenuItem onClick={onDiscardChanges}>
                    <RotateCcwIcon />
                    {copy.documentsDiscardChanges}
                </DropdownMenuItem>
            )}

            {onDelete && (
                <>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem variant="destructive" onClick={onDelete}>
                        <TrashIcon />
                        {copy.documentsDeleteTitle}
                    </DropdownMenuItem>
                </>
            )}
        </ActionsDropdownMenu>
    );
}

interface DocumentItemMediaProps {
    displayName: string;
    processing: boolean;
    hasPendingFile: boolean;
    hasFileError: boolean;
}

function DocumentItemMedia({
    displayName,
    processing,
    hasPendingFile,
    hasFileError,
}: DocumentItemMediaProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-center rounded-md bg-muted p-1.5 text-muted-foreground',
                hasFileError && 'bg-destructive/10 text-destructive',
            )}
        >
            {processing && hasPendingFile ? (
                <LoaderCircle className="size-4 animate-spin" />
            ) : (
                <DocumentFileIcon className="size-4" fileName={displayName} />
            )}
        </div>
    );
}

interface SavedDocumentTimestampProps {
    formattedUpdatedAt?: string | null;
    formattedUpdatedAtDiff?: string | null;
    isSidebarSheet: boolean;
}

function SavedDocumentTimestamp({
    formattedUpdatedAt,
    formattedUpdatedAtDiff,
    isSidebarSheet,
}: SavedDocumentTimestampProps) {
    if (!formattedUpdatedAt || !formattedUpdatedAtDiff) {
        return null;
    }

    const diffLabel = (
        <span className="cursor-pointer text-xs text-muted-foreground underline underline-offset-2">
            {formattedUpdatedAtDiff}
        </span>
    );

    if (isSidebarSheet) {
        return (
            <Popover>
                <PopoverTrigger openOnHover delay={120} closeDelay={80}>
                    {diffLabel}
                </PopoverTrigger>
                <PopoverContent
                    side="top"
                    align="start"
                    className="w-fit max-w-[14rem] p-2 text-xs"
                >
                    <p>{formattedUpdatedAt}</p>
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger>{diffLabel}</TooltipTrigger>
            <TooltipContent>
                <p>{formattedUpdatedAt}</p>
            </TooltipContent>
        </Tooltip>
    );
}
