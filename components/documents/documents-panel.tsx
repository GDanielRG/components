import { router } from '@inertiajs/react';
import { FilePlusIcon } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { DocumentsPanelItem } from '@/components/documents/documents-panel-item';
import { SidebarDocumentUploadCard } from '@/components/documents/sidebar-document-upload-card';
import type {
    Document,
    ExistingDocumentData,
} from '@/components/documents/types';
import { usePendingDocumentsUpload } from '@/components/documents/use-pending-documents-upload';
import {
    getAcceptedDocumentMimes,
    getDocumentDisplayName,
} from '@/components/documents/utils';
import type { DocumentsCopy } from '@/components/types/shared-component-copy';
import type { RouteDefinition } from '@/components/types/wayfinder';
import { Button } from '@/components/ui/button';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

interface DocumentsPanelProps {
    documents: Document[];
    allowedDocumentMimes: string[];
    maxDocumentKilobytes: number;
    storeAction: RouteDefinition<'post'>;
    updateDocumentAction: (
        documentId: number,
    ) => RouteDefinition<'put' | 'patch' | 'post'>;
    destroyDocumentAction: (documentId: number) => RouteDefinition<'delete'>;
    showDocumentAction: (documentId: number) => RouteDefinition<'get'>;
}

interface DocumentsPanelParts {
    content: ReactNode;
    footer: ReactNode;
    hasContent: boolean;
    count: number;
}

const mapExistingDocument = (document: Document): ExistingDocumentData => {
    return {
        can_be_deleted: document.can_be_deleted,
        id: document.id,
        name: document.name,
        description: document.description,
        path: document.path,
        formatted_created_at: document.formatted_created_at!,
        formatted_created_at_diff: document.formatted_created_at_diff!,
        formatted_updated_at:
            document.formatted_updated_at ?? document.formatted_created_at,
        formatted_updated_at_diff:
            document.formatted_updated_at_diff ??
            document.formatted_created_at_diff,
        created_at: document.created_at!,
        updated_at: document.updated_at,
    };
};

export function useDocumentsPanel({
    documents,
    allowedDocumentMimes,
    maxDocumentKilobytes,
    storeAction,
    updateDocumentAction,
    destroyDocumentAction,
    showDocumentAction,
}: DocumentsPanelProps): DocumentsPanelParts {
    const copy: DocumentsCopy = useSharedComponentCopy();
    const mappedDocuments = useMemo<ExistingDocumentData[]>(
        () => documents.map(mapExistingDocument),
        [documents],
    );
    const acceptedMimes = useMemo(
        () => getAcceptedDocumentMimes(allowedDocumentMimes),
        [allowedDocumentMimes],
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [documentToDelete, setDocumentToDelete] =
        useState<ExistingDocumentData | null>(null);
    const [deleteIsOpen, setDeleteIsOpen] = useState(false);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const {
        documentBatch,
        handleFilesChanged,
        retryDocumentBatch,
        dismissDocumentBatch,
        cancelDocumentBatch,
    } = usePendingDocumentsUpload({
        maxDocumentKilobytes,
        storeAction,
    });

    const confirmDeleteDocument = (document: ExistingDocumentData) => {
        setDocumentToDelete(document);
        setDeleteIsOpen(true);
    };

    const handleDeleteDocument = () => {
        if (!documentToDelete) {
            return;
        }

        setDeleteProcessing(true);

        router.delete(destroyDocumentAction(documentToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setDeleteProcessing(false);
                setDeleteIsOpen(false);
                setDocumentToDelete(null);
            },
        });
    };

    const handleDeleteDialogOpenChange = (open: boolean) => {
        if (!open) {
            if (deleteProcessing) {
                return;
            }

            setDeleteIsOpen(false);
            setDocumentToDelete(null);

            return;
        }

        setDeleteIsOpen(true);
    };

    const content = (
        <>
            <div className="[&>[data-document-item]:not(:last-child)]:border-b">
                {mappedDocuments.map((document) => (
                    <DocumentsPanelItem
                        key={`document-${document.id}-${document.updated_at ?? document.created_at}`}
                        document={document}
                        updateDocumentAction={updateDocumentAction}
                        showDocumentAction={showDocumentAction}
                        onDelete={
                            document.can_be_deleted
                                ? () => confirmDeleteDocument(document)
                                : undefined
                        }
                        acceptedMimes={acceptedMimes}
                    />
                ))}
            </div>

            {documentToDelete && (
                <DeleteConfirmationModal
                    open={deleteIsOpen || deleteProcessing}
                    onOpenChange={handleDeleteDialogOpenChange}
                    title={copy.documentsDeleteTitle}
                    description={copy.documentsDeleteNamedDescription(
                        getDocumentDisplayName(documentToDelete),
                    )}
                    processing={deleteProcessing}
                    onDestroy={handleDeleteDocument}
                />
            )}
        </>
    );

    const footer = (
        <div className="space-y-3">
            <input
                id="sidebar-documents-input"
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedMimes}
                onChange={(event) => {
                    handleFilesChanged(event);

                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }}
                className="hidden"
            />

            {documentBatch ? (
                <SidebarDocumentUploadCard
                    batch={documentBatch}
                    onRetry={retryDocumentBatch}
                    onDismiss={dismissDocumentBatch}
                    onCancel={cancelDocumentBatch}
                />
            ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full justify-center sm:flex-1"
                        data-test="add-documents-button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={deleteProcessing}
                    >
                        <FilePlusIcon />
                        {copy.documentsAdd}
                    </Button>
                </div>
            )}
        </div>
    );

    return {
        content,
        footer,
        hasContent: mappedDocuments.length > 0,
        count: mappedDocuments.length,
    };
}
