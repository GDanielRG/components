import {
    CommentsListPopover,
    CommentsToggleButton,
} from '@/components/comments';
import {
    DocumentsListDropdown,
    DocumentsToggleButton,
} from '@/components/documents';
import { ButtonGroup } from '@/components/ui/button-group';
import type { Comment, Document } from '@/types';
import type { RouteDefinition } from '@/types/wayfinder';

interface ActivityTriggersProps {
    comments: Comment[];
    documents: Document[];
    destroyCommentForm?: (commentId: number) => RouteDefinition<'delete'>;
    compact?: boolean;
    className?: string;
    commentsTriggerDataTest?: string;
}

/**
 * Inline activity triggers: a documents dropdown + a comments popover, for
 * surfaces (table rows, lists) that reveal activity in place without a sidebar.
 */
export function ActivityTriggers({
    comments,
    documents,
    destroyCommentForm,
    compact = false,
    className,
    commentsTriggerDataTest,
}: ActivityTriggersProps) {
    return (
        <ButtonGroup className={className}>
            <DocumentsListDropdown documents={documents} compact={compact} />
            <CommentsListPopover
                comments={comments}
                destroyFormAction={destroyCommentForm}
                compact={compact}
                dataTest={commentsTriggerDataTest}
            />
        </ButtonGroup>
    );
}

interface ActivitySidebarTriggersProps {
    comments: Comment[];
    documents: Document[];
    documentCount?: number;
    activePanel?: 'comments' | 'documents' | null;
    onCommentsClick: () => void;
    onDocumentsClick: () => void;
    className?: string;
}

/**
 * Sidebar activity triggers: documents + comments toggle buttons that open the
 * right-sidebar panels. Pair with `useCommentsDocumentsSidebar`.
 */
export function ActivitySidebarTriggers({
    comments,
    documents,
    documentCount,
    activePanel = null,
    onCommentsClick,
    onDocumentsClick,
    className,
}: ActivitySidebarTriggersProps) {
    return (
        <ButtonGroup className={className}>
            <DocumentsToggleButton
                documentCount={documentCount ?? documents.length}
                isActive={activePanel === 'documents'}
                onClick={onDocumentsClick}
            />
            <CommentsToggleButton
                commentCount={comments.length}
                isActive={activePanel === 'comments'}
                onClick={onCommentsClick}
            />
        </ButtonGroup>
    );
}
