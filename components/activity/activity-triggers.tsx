import {
    CommentsListPopover,
    CommentsToggleButton,
} from '@/components/comments';
import type { Comment } from '@/components/comments/types';
import {
    DocumentsListDropdown,
    DocumentsToggleButton,
} from '@/components/documents';
import type { Document } from '@/components/documents/types';
import type { ActivityCopy } from '@/components/types/shared-component-copy';
import type { RouteDefinition } from '@/components/types/wayfinder';
import { ButtonGroup } from '@/components/ui/button-group';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

interface ActivityTriggersProps {
    comments: Comment[];
    documents: Document[];
    destroyDocumentAction: (documentId: number) => RouteDefinition<'delete'>;
    showDocumentAction: (documentId: number) => RouteDefinition<'get'>;
    destroyCommentForm?: (commentId: number) => RouteDefinition<'delete'>;
    invalidateCacheTags?: string | string[];
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
    destroyDocumentAction,
    showDocumentAction,
    destroyCommentForm,
    invalidateCacheTags,
    compact = false,
    className,
    commentsTriggerDataTest,
}: ActivityTriggersProps) {
    return (
        <ButtonGroup className={className}>
            <DocumentsListDropdown
                documents={documents}
                destroyDocumentAction={destroyDocumentAction}
                showDocumentAction={showDocumentAction}
                invalidateCacheTags={invalidateCacheTags}
                compact={compact}
            />
            <CommentsListPopover
                comments={comments}
                destroyFormAction={destroyCommentForm}
                invalidateCacheTags={invalidateCacheTags}
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
    readOnly?: boolean;
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
    readOnly = false,
    className,
}: ActivitySidebarTriggersProps) {
    const copy: ActivityCopy = useSharedComponentCopy();

    return (
        <ButtonGroup className={className}>
            <DocumentsToggleButton
                documentCount={documentCount ?? documents.length}
                isActive={activePanel === 'documents'}
                onClick={onDocumentsClick}
                emptyLabel={readOnly ? copy.activityDocumentsTab : undefined}
            />
            <CommentsToggleButton
                commentCount={comments.length}
                isActive={activePanel === 'comments'}
                onClick={onCommentsClick}
                emptyLabel={readOnly ? copy.activityCommentsTab : undefined}
            />
        </ButtonGroup>
    );
}
