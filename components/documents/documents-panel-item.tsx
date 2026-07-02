import { useForm } from '@inertiajs/react';
import {
    CloudAlertIcon,
    DownloadCloudIcon,
    FileTextIcon,
    MoreHorizontalIcon,
    RefreshCwIcon,
    RotateCcwIcon,
    SaveIcon,
    TrashIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { ActionsDropdownMenu } from '@/components/actions-dropdown-menu';
import { TimestampWithReveal } from '@/components/chat/timestamp-with-reveal';
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
import {
    Attachment,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentMedia,
    AttachmentTitle,
} from '@/components/ui/attachment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
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
    const hasFileError = Boolean(fileError);
    const showSaveButton =
        saveState === 'unsaved-changes' &&
        (showMetadataEditor || hasPendingFile);

    let attachmentState:
        'idle' | 'uploading' | 'processing' | 'error' | 'done' = 'done';

    if (hasFileError) {
        attachmentState = 'error';
    } else if (form.processing && hasPendingFile) {
        attachmentState = 'uploading';
    }

    return (
        <div data-document-item>
            <Attachment
                state={attachmentState}
                className={cn(
                    'w-full items-start',
                    showMetadataEditor &&
                        'border-transparent bg-transparent focus-within:ring-0',
                )}
            >
                <AttachmentMedia>
                    {form.processing && hasPendingFile ? (
                        <Spinner />
                    ) : (
                        <DocumentFileIcon fileName={displayName} />
                    )}
                </AttachmentMedia>

                <AttachmentContent>
                    {showMetadataEditor ? (
                        <FieldGroup className="gap-2">
                            <Field
                                data-invalid={
                                    Boolean(form.errors.name) || undefined
                                }
                            >
                                <FieldLabel
                                    htmlFor={`document-name-input-${document.id}`}
                                    className="sr-only"
                                >
                                    {copy.documentsNamePlaceholder}
                                </FieldLabel>
                                <Input
                                    id={`document-name-input-${document.id}`}
                                    type="text"
                                    value={editableName}
                                    onChange={handleNameChange}
                                    placeholder={copy.documentsNamePlaceholder}
                                    aria-invalid={Boolean(form.errors.name)}
                                    data-test={`document-name-input-${document.id}`}
                                />
                            </Field>

                            <Field
                                data-invalid={
                                    Boolean(form.errors.description) ||
                                    undefined
                                }
                            >
                                <OptionalAddButton
                                    buttonText={copy.documentsAddDescription}
                                    defaultOpen={Boolean(
                                        currentDocument.description,
                                    )}
                                >
                                    <FieldLabel
                                        htmlFor={`document-description-input-${document.id}`}
                                        className="sr-only"
                                    >
                                        {copy.documentsDescriptionPlaceholder}
                                    </FieldLabel>
                                    <Textarea
                                        id={`document-description-input-${document.id}`}
                                        value={
                                            currentDocument.description || ''
                                        }
                                        onChange={handleDescriptionChange}
                                        placeholder={
                                            copy.documentsDescriptionPlaceholder
                                        }
                                        rows={3}
                                        aria-invalid={Boolean(
                                            form.errors.description,
                                        )}
                                        data-test={`document-description-input-${document.id}`}
                                    />
                                </OptionalAddButton>
                            </Field>
                        </FieldGroup>
                    ) : (
                        <>
                            <AttachmentTitle
                                className={cn(fileError && 'text-destructive')}
                            >
                                {displayName || copy.documentsFallbackName}
                            </AttachmentTitle>

                            {currentDocument.description ? (
                                <AttachmentDescription>
                                    {currentDocument.description}
                                </AttachmentDescription>
                            ) : (
                                hasSavedDate &&
                                document.formatted_updated_at &&
                                document.formatted_updated_at_diff && (
                                    <TimestampWithReveal
                                        className="mt-0.5"
                                        relativeLabel={
                                            document.formatted_updated_at_diff
                                        }
                                        absoluteLabel={
                                            document.formatted_updated_at
                                        }
                                    />
                                )
                            )}
                        </>
                    )}

                    {fileError && (
                        <Badge variant="destructive" className="mt-1 w-fit">
                            <CloudAlertIcon />
                            {copy.documentsFileError}
                        </Badge>
                    )}

                    {showSaveButton && (
                        <Button
                            type="button"
                            size="sm"
                            className="mt-1 w-fit"
                            disabled={form.processing}
                            data-test={`save-document-item-button-${document.id}`}
                            onClick={submitUpdate}
                        >
                            <SaveIcon data-icon="inline-start" />
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
                </AttachmentContent>

                <ExistingDocumentActions
                    document={document}
                    showDocumentAction={showDocumentAction}
                    showMetadataEditor={showMetadataEditor}
                    metadataActionLabel={metadataActionLabel}
                    rowProcessing={form.processing}
                    saveState={saveState}
                    onToggleMetadataEditor={toggleMetadataEditor}
                    onReplaceFile={() => fileInputRef.current?.click()}
                    onDiscardChanges={discardChanges}
                    onDelete={onDelete}
                />
            </Attachment>

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

interface ExistingDocumentActionsProps {
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
}

function ExistingDocumentActions({
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
}: ExistingDocumentActionsProps) {
    const copy: DocumentsCopy & FormCopy = useSharedComponentCopy();

    return (
        <AttachmentActions>
            <ActionsDropdownMenu
                align="start"
                contentClassName="w-fit"
                trigger={(open) => (
                    <Button
                        variant={open ? 'secondary' : 'ghost'}
                        size="icon"
                        aria-label={copy.documentsActions}
                        data-test={`document-item-actions-${document.id}`}
                        disabled={rowProcessing}
                    >
                        <MoreHorizontalIcon data-icon="icon" />
                    </Button>
                )}
            >
                <DropdownMenuGroup>
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
                </DropdownMenuGroup>

                {onDelete && (
                    <>
                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={onDelete}
                            >
                                <TrashIcon />
                                {copy.documentsDeleteTitle}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </>
                )}
            </ActionsDropdownMenu>
        </AttachmentActions>
    );
}
