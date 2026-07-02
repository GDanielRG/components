import { FilePlusIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { DocumentItem } from '@/components/documents/document-item';
import type { DocumentData } from '@/components/documents/types';
import {
    formatDocumentKilobytes,
    generateTempId,
    getAcceptedDocumentMimes,
    getDocumentDisplayName,
    getDocumentFileSizeError,
    isExistingDocument,
} from '@/components/documents/utils';
import { OptionalLabel } from '@/components/optional-label';
import type { DocumentsCopy } from '@/components/types/shared-component-copy';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

interface DocumentsFormSectionProps {
    documents: DocumentData[];
    onChange: (documents: DocumentData[]) => void;
    allowedDocumentMimes: string[];
    maxDocumentKilobytes?: number;
    label?: string;
    buttonText?: string;
    isOptional?: boolean;
    errors?: Record<string, string | undefined>;
}

export function DocumentsFormSection({
    documents,
    onChange,
    allowedDocumentMimes,
    maxDocumentKilobytes = 0,
    label,
    buttonText,
    isOptional = true,
    errors = {},
}: DocumentsFormSectionProps) {
    const copy: DocumentsCopy = useSharedComponentCopy();
    const resolvedLabel = label ?? copy.documentsTitle;
    const resolvedButtonText = buttonText ?? copy.documentsAdd;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [documentIndexToDelete, setDocumentIndexToDelete] = useState<
        number | null
    >(null);
    const [deleteIsOpen, setDeleteIsOpen] = useState(false);
    const acceptedMimes = getAcceptedDocumentMimes(allowedDocumentMimes);

    const getDocumentErrors = (index: number) => {
        const document = documents[index];
        const localFileError =
            document && !isExistingDocument(document)
                ? (getDocumentFileSizeError(
                      document.file,
                      maxDocumentKilobytes,
                      copy.documentsValidationMaxSize,
                  ) ?? undefined)
                : undefined;

        return {
            nameError: errors[`documents.${index}.name`],
            descriptionError: errors[`documents.${index}.description`],
            fileError: errors[`documents.${index}.file`] ?? localFileError,
            idError: errors[`documents.${index}.id`],
        };
    };

    const hasLocalDocumentFileErrors = documents.some((document) => {
        if (isExistingDocument(document)) {
            return false;
        }

        return Boolean(
            getDocumentFileSizeError(
                document.file,
                maxDocumentKilobytes,
                copy.documentsValidationMaxSize,
            ),
        );
    });

    const documentError =
        errors.documents ??
        (hasLocalDocumentFileErrors && maxDocumentKilobytes > 0
            ? copy.documentsBatchTooLarge(
                  formatDocumentKilobytes(maxDocumentKilobytes),
              )
            : undefined);

    const handleFilesChanged = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length) {
            const newDocuments: DocumentData[] = files.map((file) => ({
                tempId: generateTempId(),
                file,
                name: '',
                description: '',
            }));

            onChange([...documents, ...newDocuments]);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUpdate = (index: number, document: DocumentData) => {
        const updatedDocuments = [...documents];

        updatedDocuments[index] = document;
        onChange(updatedDocuments);
    };

    const handleRemove = (index: number) => {
        onChange(documents.filter((_, currentIndex) => currentIndex !== index));
    };

    const handleDeleteClick = (index: number) => {
        setDocumentIndexToDelete(index);
        setDeleteIsOpen(true);
    };

    const handleLocalDelete = () => {
        if (documentIndexToDelete === null) {
            return;
        }

        handleRemove(documentIndexToDelete);
        setDeleteIsOpen(false);
        setDocumentIndexToDelete(null);
    };

    const handleDeleteDialogOpenChange = (open: boolean) => {
        setDeleteIsOpen(open);

        if (!open) {
            setDocumentIndexToDelete(null);
        }
    };

    const documentToDelete =
        documentIndexToDelete !== null
            ? documents[documentIndexToDelete]
            : null;

    return (
        <Field>
            <FieldLabel htmlFor="documents">
                {resolvedLabel} {isOptional && <OptionalLabel />}
            </FieldLabel>

            <div className="flex flex-col gap-2">
                {documents.map((document, index) => {
                    const documentErrors = getDocumentErrors(index);

                    return (
                        <DocumentItem
                            key={
                                isExistingDocument(document)
                                    ? `document-${document.id}`
                                    : `temp-document-${document.tempId}`
                            }
                            document={document}
                            onUpdate={(updatedDocument) =>
                                handleUpdate(index, updatedDocument)
                            }
                            onDelete={() => handleDeleteClick(index)}
                            acceptedMimes={acceptedMimes}
                            nameError={documentErrors.nameError}
                            descriptionError={documentErrors.descriptionError}
                            fileError={documentErrors.fileError}
                            idError={documentErrors.idError}
                        />
                    );
                })}

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto"
                >
                    <FilePlusIcon data-icon="inline-start" />
                    {resolvedButtonText}
                </Button>
            </div>

            <input
                id="documents"
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedMimes}
                onChange={handleFilesChanged}
                className="hidden"
            />

            {documentToDelete && (
                <DeleteConfirmationModal
                    open={deleteIsOpen}
                    onOpenChange={handleDeleteDialogOpenChange}
                    title={copy.documentsDeleteTitle}
                    description={copy.documentsDeleteNamedDescription(
                        getDocumentDisplayName(documentToDelete),
                    )}
                    processing={false}
                    onDestroy={handleLocalDelete}
                />
            )}

            <FieldError>{documentError}</FieldError>
        </Field>
    );
}
