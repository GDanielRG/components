import { Form } from '@inertiajs/react';
import { DownloadCloudIcon, FilesIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { DocumentFileIcon } from '@/components/documents/document-file-icon';
import type { Document } from '@/components/documents/types';
import { getDocumentDisplayName } from '@/components/documents/utils';
import type {
    DialogCopy,
    DocumentsCopy,
} from '@/components/types/shared-component-copy';
import type { RouteDefinition } from '@/components/types/wayfinder';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

interface DocumentDeleteDialogProps {
    documentId: number;
    destroyDocumentAction: (documentId: number) => RouteDefinition<'delete'>;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose?: () => void;
    onSuccess?: () => void;
}

export function DocumentDeleteDialog({
    documentId,
    destroyDocumentAction,
    isOpen,
    setIsOpen,
    onClose,
    onSuccess,
}: DocumentDeleteDialogProps) {
    const copy: DialogCopy & DocumentsCopy = useSharedComponentCopy();

    return (
        <Form
            action={destroyDocumentAction(documentId)}
            options={{ preserveScroll: true }}
            disableWhileProcessing
            onSuccess={() => onSuccess?.()}
        >
            {({ processing, submit }) => (
                <DeleteConfirmationModal
                    open={isOpen || processing}
                    onOpenChange={(open) => {
                        if (!open && processing) {
                            return;
                        }

                        setIsOpen(open);

                        if (!open) {
                            onClose?.();
                        }
                    }}
                    title={copy.documentsDeleteTitle}
                    description={copy.documentsDeleteDescription}
                    processing={processing}
                    onDestroy={submit}
                />
            )}
        </Form>
    );
}

interface DocumentsListContentProps<D extends Document> {
    documents: D[];
    showDocumentAction: (documentId: number) => RouteDefinition<'get'>;
    showHeader?: boolean;
    onDeleteDocument?: (document: D) => void;
}

function DocumentsListContent<D extends Document>({
    documents,
    showDocumentAction,
    showHeader = true,
    onDeleteDocument,
}: DocumentsListContentProps<D>) {
    const copy: DialogCopy & DocumentsCopy = useSharedComponentCopy();

    return (
        <>
            {showHeader && (
                <>
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>
                            {copy.documentsTitle}
                        </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                </>
            )}
            {documents.map((document) => {
                const deleteAction =
                    document.can_be_deleted && onDeleteDocument
                        ? () => onDeleteDocument(document)
                        : undefined;

                return (
                    <DocumentActionsDropdown
                        key={document.id}
                        document={document}
                        showDocumentAction={showDocumentAction}
                        onDelete={deleteAction}
                    />
                );
            })}
        </>
    );
}

interface DocumentsListDropdownProps {
    documents: Document[];
    destroyDocumentAction: (documentId: number) => RouteDefinition<'delete'>;
    showDocumentAction: (documentId: number) => RouteDefinition<'get'>;
    trigger?: React.ReactElement;
    compact?: boolean;
}

export function DocumentsListDropdown({
    documents,
    destroyDocumentAction,
    showDocumentAction,
    trigger,
    compact = false,
}: DocumentsListDropdownProps) {
    const [open, setOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<number | null>(
        null,
    );
    const [deleteDocumentIsOpen, setDeleteDocumentIsOpen] = useState(false);

    if (documents.length === 0) {
        return null;
    }

    const handleDeleteDocument = (document: Document) => {
        setDocumentToDelete(document.id);
        setDeleteDocumentIsOpen(true);
    };

    const defaultTrigger = (
        <Button size="sm" variant={open ? 'secondary' : 'outline'}>
            <FilesIcon />
            {compact ? documents.length : `${documents.length}`}
        </Button>
    );

    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger render={trigger ?? defaultTrigger} />
                <DropdownMenuContent side="right" className="w-fit">
                    <DocumentsListContent
                        documents={documents}
                        showDocumentAction={showDocumentAction}
                        onDeleteDocument={handleDeleteDocument}
                    />
                </DropdownMenuContent>
            </DropdownMenu>

            {documentToDelete && (
                <DocumentDeleteDialog
                    documentId={documentToDelete}
                    destroyDocumentAction={destroyDocumentAction}
                    isOpen={deleteDocumentIsOpen}
                    setIsOpen={setDeleteDocumentIsOpen}
                    onClose={() => setDocumentToDelete(null)}
                    onSuccess={() => {
                        setDeleteDocumentIsOpen(false);
                        setDocumentToDelete(null);
                    }}
                />
            )}
        </>
    );
}

interface DocumentsListSubMenuProps<D extends Document> {
    documents: D[];
    showDocumentAction: (documentId: number) => RouteDefinition<'get'>;
    label?: string;
    onDeleteDocument?: (document: D) => void;
}

export function DocumentsListSubMenu<D extends Document>({
    documents,
    showDocumentAction,
    label,
    onDeleteDocument,
}: DocumentsListSubMenuProps<D>) {
    const copy: DialogCopy & DocumentsCopy = useSharedComponentCopy();

    if (documents.length === 0) {
        return null;
    }

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <FilesIcon />
                {label ?? copy.documentsViewList}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent align="center" side="bottom">
                <DocumentsListContent
                    documents={documents}
                    showDocumentAction={showDocumentAction}
                    onDeleteDocument={onDeleteDocument}
                />
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    );
}

interface DocumentActionsDropdownProps {
    document: Document;
    showDocumentAction: (documentId: number) => RouteDefinition<'get'>;
    onDelete?: () => void;
}

function DocumentActionsDropdown({
    document,
    showDocumentAction,
    onDelete,
}: DocumentActionsDropdownProps) {
    const copy: DialogCopy & DocumentsCopy = useSharedComponentCopy();
    const documentDisplayName = getDocumentDisplayName(document);

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <DocumentFileIcon fileName={documentDisplayName} />
                <span>{documentDisplayName}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent side="bottom" align="end">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>{documentDisplayName}</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
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
                    {copy.documentsDownload}
                </DropdownMenuItem>
                {onDelete && (
                    <DropdownMenuItem variant="destructive" onClick={onDelete}>
                        <TrashIcon />
                        {copy.dialogDelete}
                    </DropdownMenuItem>
                )}
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    );
}
