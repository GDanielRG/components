import { FileWarningIcon } from 'lucide-react';
import { DocumentErrorMessages } from '@/components/documents/document-error-messages';
import { DocumentFileIcon } from '@/components/documents/document-file-icon';
import type { DocumentUploadItem } from '@/components/documents/types';
import { formatBytes } from '@/components/documents/utils';
import {
    Attachment,
    AttachmentContent,
    AttachmentDescription,
    AttachmentMedia,
    AttachmentTitle,
} from '@/components/ui/attachment';
import { Spinner } from '@/components/ui/spinner';

interface PendingDocumentItemProps {
    item: DocumentUploadItem;
}

export function PendingDocumentItem({ item }: PendingDocumentItemProps) {
    return (
        <div data-document-item>
            <Attachment state={item.state} className="w-full items-start">
                <AttachmentMedia>
                    {item.state === 'uploading' ? (
                        <Spinner />
                    ) : item.state === 'error' ? (
                        <FileWarningIcon />
                    ) : (
                        <DocumentFileIcon fileName={item.displayName} />
                    )}
                </AttachmentMedia>

                <AttachmentContent>
                    <AttachmentTitle>{item.displayName}</AttachmentTitle>

                    <AttachmentDescription>
                        {formatBytes(item.size)}
                    </AttachmentDescription>

                    <DocumentErrorMessages
                        messages={[
                            item.errors.name,
                            item.errors.description,
                            item.errors.file,
                            item.errors.id,
                        ]}
                    />
                </AttachmentContent>
            </Attachment>
        </div>
    );
}
