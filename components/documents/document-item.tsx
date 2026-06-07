import {
    EllipsisVerticalIcon,
    EraserIcon,
    FileTextIcon,
    RefreshCwIcon,
    TrashIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { ActionsDropdownMenu } from '@/components/actions-dropdown-menu';
import { DocumentErrorMessages } from '@/components/documents/document-error-messages';
import { DocumentFileIcon } from '@/components/documents/document-file-icon';
import type { DocumentData } from '@/components/documents/types';
import {
    getDocumentDisplayName,
    isExistingDocument,
} from '@/components/documents/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import type { DocumentsCopy } from '../../types/shared-component-copy';

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
    const hasExplicitMetadata = Boolean(document.name || document.description);
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

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        const updatedDocument = { ...document, name: newName };

        onUpdate(updatedDocument);

        if (!newName && !updatedDocument.description) {
            setIsEditingMetadata(false);
        }
    };

    const handleDescriptionChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        const newDescription = e.target.value;
        const updatedDocument = { ...document, description: newDescription };

        onUpdate(updatedDocument);

        if (!updatedDocument.name && !newDescription) {
            setIsEditingMetadata(false);
        }
    };

    const handleFileReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        onUpdate({ ...document, file });
        e.target.value = '';
    };

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <DocumentFileIcon className="size-4" fileName={displayName} />
                <p>{displayName}</p>
                <ActionsDropdownMenu
                    trigger={
                        <Button variant="outline" size="icon-sm">
                            <EllipsisVerticalIcon />
                        </Button>
                    }
                >
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

                    <DropdownMenuItem variant="destructive" onClick={onDelete}>
                        <TrashIcon />
                        {copy.documentsDeleteTitle}
                    </DropdownMenuItem>
                </ActionsDropdownMenu>
            </div>

            {isEditingMetadata && (
                <>
                    <div className="flex items-center gap-2">
                        <Input
                            type="text"
                            value={document.name || ''}
                            onChange={handleNameChange}
                            placeholder={copy.documentsNamePlaceholder}
                        />
                    </div>
                    <Textarea
                        value={document.description || ''}
                        onChange={handleDescriptionChange}
                        placeholder={copy.documentsDescriptionPlaceholder}
                        rows={3}
                    />
                </>
            )}

            <DocumentErrorMessages
                messages={[nameError, descriptionError, fileError, idError]}
            />

            <input
                ref={fileInputRef}
                type="file"
                accept={acceptedMimes}
                onChange={handleFileReplace}
                className="hidden"
            />
        </div>
    );
}
