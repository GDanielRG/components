import {
    EllipsisVerticalIcon,
    EraserIcon,
    FileTextIcon,
    FileWarningIcon,
    RefreshCwIcon,
    TrashIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { ActionsDropdownMenu } from '@/components/actions-dropdown-menu';
import { DocumentErrorMessages } from '@/components/documents/document-error-messages';
import { DocumentFileIcon } from '@/components/documents/document-file-icon';
import type { DocumentData } from '@/components/documents/types';
import {
    formatBytes,
    getDocumentDisplayName,
    isExistingDocument,
} from '@/components/documents/utils';
import type { DocumentsCopy } from '@/components/types/shared-component-copy';
import {
    Attachment,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentMedia,
    AttachmentTitle,
} from '@/components/ui/attachment';
import { Button } from '@/components/ui/button';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';

interface DocumentItemProps {
    document: DocumentData;
    onUpdate: (updatedDocument: DocumentData) => void;
    onDelete: () => void;
    acceptedMimes?: string;
    nameError?: string;
    descriptionError?: string;
    fileError?: string;
    idError?: string;
}

export function DocumentItem({
    document,
    onUpdate,
    onDelete,
    acceptedMimes,
    nameError,
    descriptionError,
    fileError,
    idError,
}: DocumentItemProps) {
    const copy: DocumentsCopy = useSharedComponentCopy();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditingMetadata, setIsEditingMetadata] = useState(
        !!(document.name || document.description),
    );
    const isExisting = isExistingDocument(document);
    const displayName = getDocumentDisplayName(document);
    const fileSize = document.file ? formatBytes(document.file.size) : null;
    const documentKey = isExistingDocument(document)
        ? `existing-${document.id}`
        : `new-${document.tempId}`;
    const hasExplicitMetadata = Boolean(document.name || document.description);
    const hasFieldError = Boolean(
        nameError || descriptionError || fileError || idError,
    );
    let metadataActionLabel = copy.documentsAddMetadata;

    if (isEditingMetadata) {
        metadataActionLabel = copy.documentsDiscardChanges;
    } else if (hasExplicitMetadata) {
        metadataActionLabel = copy.documentsEditMetadata;
    }

    const clearMetadata = (): DocumentData => {
        if (isExistingDocument(document)) {
            return {
                ...document,
                name: null,
                description: null,
            };
        }

        return {
            ...document,
            name: undefined,
            description: undefined,
        };
    };

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        const updatedDocument = { ...document, name: newName };

        onUpdate(updatedDocument);

        if (!newName && !updatedDocument.description) {
            setIsEditingMetadata(false);
        }
    };

    const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const newDescription = e.target.value;
        const updatedDocument = { ...document, description: newDescription };

        onUpdate(updatedDocument);

        if (!updatedDocument.name && !newDescription) {
            setIsEditingMetadata(false);
        }
    };

    const handleFileReplace = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        onUpdate({ ...document, file });
        e.target.value = '';
    };

    return (
        <Attachment
            state={hasFieldError ? 'error' : isExisting ? 'done' : 'idle'}
            className={cn(
                'w-full items-start',
                isEditingMetadata &&
                    'border-transparent bg-transparent focus-within:ring-0',
            )}
        >
            <AttachmentMedia>
                {hasFieldError ? (
                    <FileWarningIcon />
                ) : (
                    <DocumentFileIcon fileName={displayName} />
                )}
            </AttachmentMedia>

            <AttachmentContent>
                <AttachmentTitle>{displayName}</AttachmentTitle>

                {fileSize && !isEditingMetadata && (
                    <AttachmentDescription>{fileSize}</AttachmentDescription>
                )}

                {isEditingMetadata && (
                    <FieldGroup className="gap-2">
                        <Field data-invalid={Boolean(nameError) || undefined}>
                            <FieldLabel
                                htmlFor={`document-name-input-${documentKey}`}
                                className="sr-only"
                            >
                                {copy.documentsNamePlaceholder}
                            </FieldLabel>
                            <Input
                                id={`document-name-input-${documentKey}`}
                                type="text"
                                value={document.name || ''}
                                onChange={handleNameChange}
                                placeholder={copy.documentsNamePlaceholder}
                                aria-invalid={Boolean(nameError)}
                            />
                        </Field>

                        <Field
                            data-invalid={
                                Boolean(descriptionError) || undefined
                            }
                        >
                            <FieldLabel
                                htmlFor={`document-description-input-${documentKey}`}
                                className="sr-only"
                            >
                                {copy.documentsDescriptionPlaceholder}
                            </FieldLabel>
                            <Textarea
                                id={`document-description-input-${documentKey}`}
                                value={document.description || ''}
                                onChange={handleDescriptionChange}
                                placeholder={
                                    copy.documentsDescriptionPlaceholder
                                }
                                rows={3}
                                aria-invalid={Boolean(descriptionError)}
                            />
                        </Field>
                    </FieldGroup>
                )}

                <DocumentErrorMessages
                    messages={[nameError, descriptionError, fileError, idError]}
                />
            </AttachmentContent>

            <AttachmentActions>
                <ActionsDropdownMenu
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={copy.documentsActions}
                        >
                            <EllipsisVerticalIcon data-icon="icon" />
                        </Button>
                    }
                >
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={() => {
                                if (isEditingMetadata) {
                                    setIsEditingMetadata(false);
                                    onUpdate(clearMetadata());

                                    return;
                                }

                                setIsEditingMetadata(true);
                            }}
                        >
                            <FileTextIcon />
                            {metadataActionLabel}
                        </DropdownMenuItem>

                        {hasExplicitMetadata && (
                            <DropdownMenuItem
                                onClick={() => {
                                    setIsEditingMetadata(false);
                                    onUpdate(clearMetadata());
                                }}
                            >
                                <EraserIcon />
                                {copy.documentsClearMetadata}
                            </DropdownMenuItem>
                        )}

                        {(isExisting || document.file) && (
                            <DropdownMenuItem
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <RefreshCwIcon />
                                {copy.documentsReplaceFile}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>

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
                </ActionsDropdownMenu>
            </AttachmentActions>

            <input
                ref={fileInputRef}
                type="file"
                accept={acceptedMimes}
                onChange={handleFileReplace}
                className="hidden"
            />
        </Attachment>
    );
}
