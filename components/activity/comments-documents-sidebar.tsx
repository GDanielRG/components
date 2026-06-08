import {
    FilesIcon,
    MessageCircleIcon,
    MessageCirclePlusIcon,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
    AppRightSidebar,
    AppRightSidebarCloseButton,
} from '@/components/app-right-sidebar';
import { CommentForm, CommentList } from '@/components/comments';
import type { Comment } from '@/components/comments/types';
import { useDocumentsPanel } from '@/components/documents/documents-panel';
import type { Document } from '@/components/documents/types';
import type { ActivityCopy } from '@/components/types/shared-component-copy';
import type { RouteDefinition } from '@/components/types/wayfinder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { useIsSidebarSheet } from '@/hooks/use-sidebar-sheet';
import { cn } from '@/lib/utils';

type CommentsDocumentsSidebarTab = 'comments' | 'documents';

interface UseCommentsDocumentsSidebarStateProps {
    defaultOpen?: boolean;
    defaultTab?: CommentsDocumentsSidebarTab;
}

interface UseCommentsDocumentsSidebarProps {
    comments: Comment[];
    documents: Document[];
    allowedDocumentMimes: string[];
    maxDocumentKilobytes: number;
    storeCommentForm: RouteDefinition<'post'>;
    storeDocumentAction: RouteDefinition<'post'>;
    updateDocumentAction: (
        documentId: number,
    ) => RouteDefinition<'put' | 'patch' | 'post'>;
    destroyDocumentAction: (documentId: number) => RouteDefinition<'delete'>;
    showDocumentAction: (documentId: number) => RouteDefinition<'get'>;
    updateCommentForm: (commentId: number) => RouteDefinition<'put' | 'patch'>;
    destroyCommentForm: (commentId: number) => RouteDefinition<'delete'>;
    defaultOpen?: boolean;
}

interface UseDocumentsSidebarProps {
    documents: Document[];
    allowedDocumentMimes: string[];
    maxDocumentKilobytes: number;
    storeDocumentAction: RouteDefinition<'post'>;
    updateDocumentAction: (
        documentId: number,
    ) => RouteDefinition<'put' | 'patch' | 'post'>;
    destroyDocumentAction: (documentId: number) => RouteDefinition<'delete'>;
    showDocumentAction: (documentId: number) => RouteDefinition<'get'>;
    defaultOpen?: boolean;
}

function useCommentsDocumentsSidebarState({
    defaultOpen = false,
    defaultTab = 'comments',
}: UseCommentsDocumentsSidebarStateProps) {
    const isSidebarSheet = useIsSidebarSheet();
    const [open, setOpenState] = useState(() => !isSidebarSheet && defaultOpen);
    const [activeTab, setActiveTab] =
        useState<CommentsDocumentsSidebarTab>(defaultTab);

    const setOpen = (nextOpen: boolean) => {
        setOpenState(nextOpen);
    };

    const openTab = (tab: CommentsDocumentsSidebarTab) => {
        if (open && activeTab === tab) {
            setOpen(false);

            return;
        }

        setActiveTab(tab);
        setOpen(true);
    };

    return {
        open,
        setOpen,
        activeTab,
        setActiveTab,
        openCommentsTab: () => openTab('comments'),
        openDocumentsTab: () => openTab('documents'),
        closeSidebar: () => setOpen(false),
        isSidebarSheet,
    };
}

export function useCommentsDocumentsSidebar({
    comments,
    documents,
    allowedDocumentMimes,
    maxDocumentKilobytes,
    storeCommentForm,
    storeDocumentAction,
    updateDocumentAction,
    destroyDocumentAction,
    showDocumentAction,
    updateCommentForm,
    destroyCommentForm,
    defaultOpen,
}: UseCommentsDocumentsSidebarProps) {
    const copy: ActivityCopy = useSharedComponentCopy();
    const [editingCommentId, setEditingCommentId] = useState<number | null>(
        null,
    );
    const [isCreatingComment, setIsCreatingComment] = useState(false);
    const resolvedDefaultOpen =
        defaultOpen ?? (comments.length > 0 || documents.length > 0);
    const defaultTab =
        comments.length > 0 || documents.length === 0
            ? 'comments'
            : 'documents';
    const {
        activeTab,
        closeSidebar,
        open,
        openCommentsTab,
        openDocumentsTab,
        setActiveTab,
        setOpen,
    } = useCommentsDocumentsSidebarState({
        defaultOpen: resolvedDefaultOpen,
        defaultTab,
    });
    const documentsPanel = useDocumentsPanel({
        documents,
        allowedDocumentMimes,
        maxDocumentKilobytes,
        storeAction: storeDocumentAction,
        updateDocumentAction,
        destroyDocumentAction,
        showDocumentAction,
    });

    const clearEditingComment = () => {
        setEditingCommentId(null);
    };

    const hideCreateComment = () => {
        setIsCreatingComment(false);
    };

    const clearCommentComposerState = () => {
        clearEditingComment();
        hideCreateComment();
    };

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
            clearCommentComposerState();
        }
    };

    const handleClose = () => {
        clearCommentComposerState();
        closeSidebar();
    };

    const handleTabChange = (tab: CommentsDocumentsSidebarTab) => {
        setActiveTab(tab);

        if (tab !== 'comments') {
            clearCommentComposerState();
        }
    };

    const handleEditComment = (commentId: number) => {
        hideCreateComment();
        setEditingCommentId(commentId);
    };

    return {
        documentCount: documentsPanel.count,
        activePanel: open ? activeTab : null,
        openCommentsTab,
        openDocumentsTab,
        rightSidebar: (
            <CommentsDocumentsSidebar
                open={open}
                onOpenChange={handleOpenChange}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onClose={handleClose}
                comments={{
                    count: comments.length,
                    hasContent: comments.length > 0,
                    content: (
                        <CommentList
                            comments={comments}
                            updateFormAction={updateCommentForm}
                            editingCommentId={editingCommentId}
                            onEdit={handleEditComment}
                            onCancelEdit={clearEditingComment}
                            destroyFormAction={destroyCommentForm}
                        />
                    ),
                    footer: isCreatingComment ? (
                        <CommentForm
                            formAction={storeCommentForm}
                            mode="create"
                            onCancel={hideCreateComment}
                            autoFocus
                        />
                    ) : (
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="w-full justify-center sm:flex-1"
                                data-test="add-comment-button"
                                onClick={() => setIsCreatingComment(true)}
                            >
                                <MessageCirclePlusIcon />
                                {copy.activityAddComment}
                            </Button>
                        </div>
                    ),
                }}
                documents={{
                    count: documentsPanel.count,
                    hasContent: documentsPanel.hasContent,
                    content: documentsPanel.content,
                    footer: documentsPanel.footer,
                }}
            />
        ),
    };
}

export function useDocumentsSidebar({
    documents,
    allowedDocumentMimes,
    maxDocumentKilobytes,
    storeDocumentAction,
    updateDocumentAction,
    destroyDocumentAction,
    showDocumentAction,
    defaultOpen,
}: UseDocumentsSidebarProps) {
    const resolvedDefaultOpen = defaultOpen ?? documents.length > 0;
    const {
        activeTab,
        closeSidebar,
        open,
        openDocumentsTab,
        setActiveTab,
        setOpen,
    } = useCommentsDocumentsSidebarState({
        defaultOpen: resolvedDefaultOpen,
        defaultTab: 'documents',
    });
    const documentsPanel = useDocumentsPanel({
        documents,
        allowedDocumentMimes,
        maxDocumentKilobytes,
        storeAction: storeDocumentAction,
        updateDocumentAction,
        destroyDocumentAction,
        showDocumentAction,
    });

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
    };

    return {
        documentCount: documentsPanel.count,
        activePanel: open ? activeTab : null,
        openDocumentsTab,
        rightSidebar: (
            <CommentsDocumentsSidebar
                open={open}
                onOpenChange={handleOpenChange}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onClose={closeSidebar}
                documents={{
                    count: documentsPanel.count,
                    hasContent: documentsPanel.hasContent,
                    content: documentsPanel.content,
                    footer: documentsPanel.footer,
                }}
            />
        ),
    };
}

interface SidebarSection {
    count?: number;
    content?: ReactNode;
    footer?: ReactNode;
    hasContent?: boolean;
}

interface CommentsDocumentsSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activeTab: CommentsDocumentsSidebarTab;
    onTabChange: (tab: CommentsDocumentsSidebarTab) => void;
    onClose: () => void;
    comments?: SidebarSection;
    documents?: SidebarSection;
}

function CommentsDocumentsSidebar({
    open,
    onOpenChange,
    activeTab,
    onTabChange,
    onClose,
    comments,
    documents,
}: CommentsDocumentsSidebarProps) {
    const copy: ActivityCopy = useSharedComponentCopy();
    const availableTabs = {
        comments: comments !== undefined,
        documents: documents !== undefined,
    };
    let resolvedActiveTab = activeTab;

    if (activeTab === 'comments' && !availableTabs.comments) {
        resolvedActiveTab = 'documents';
    }

    if (activeTab === 'documents' && !availableTabs.documents) {
        resolvedActiveTab = 'comments';
    }

    const activeSection =
        resolvedActiveTab === 'comments' ? comments : documents;
    const showActiveContent =
        activeSection?.hasContent ?? Boolean(activeSection?.content);

    return (
        <AppRightSidebar open={open} onOpenChange={onOpenChange}>
            <Tabs
                value={resolvedActiveTab}
                orientation="vertical"
                onValueChange={(value: string) =>
                    onTabChange(value as CommentsDocumentsSidebarTab)
                }
                className="min-h-0 flex-1 flex-col gap-0"
            >
                <SidebarHeader className="px-4 lg:px-0 lg:pt-0 lg:pb-4">
                    <div className="flex justify-between gap-3">
                        <TabsList className="h-auto flex-col items-stretch gap-2">
                            {comments && (
                                <TabsTrigger
                                    value="comments"
                                    className="w-full justify-start"
                                >
                                    <MessageCircleIcon className="size-4" />
                                    <span>{copy.activityCommentsTab}</span>
                                    {(comments.count ?? 0) > 0 && (
                                        <Badge
                                            variant={
                                                resolvedActiveTab === 'comments'
                                                    ? 'secondary'
                                                    : 'ghost'
                                            }
                                        >
                                            {comments.count}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            )}
                            {documents && (
                                <TabsTrigger
                                    value="documents"
                                    className="w-full justify-start"
                                >
                                    <FilesIcon className="size-4" />
                                    <span>{copy.activityDocumentsTab}</span>
                                    {(documents.count ?? 0) > 0 && (
                                        <Badge
                                            variant={
                                                resolvedActiveTab ===
                                                'documents'
                                                    ? 'secondary'
                                                    : 'ghost'
                                            }
                                        >
                                            {documents.count}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <AppRightSidebarCloseButton onClick={onClose} />
                    </div>
                </SidebarHeader>

                {showActiveContent && (
                    <SidebarContent
                        data-test="activity-sidebar-content"
                        className="m-4 mt-0 mb-0 min-h-0 flex-initial overflow-hidden rounded-xl border bg-background shadow-sm lg:mx-0 lg:border-0"
                    >
                        <ScrollArea className="h-full min-h-0">
                            {activeSection?.content}
                        </ScrollArea>
                    </SidebarContent>
                )}

                {activeSection?.footer && (
                    <SidebarFooter
                        data-test="activity-sidebar-footer"
                        className={cn(
                            'px-4 lg:px-0 lg:pb-0',
                            showActiveContent ? 'lg:pt-4' : 'pt-0',
                        )}
                    >
                        {activeSection.footer}
                    </SidebarFooter>
                )}
            </Tabs>
        </AppRightSidebar>
    );
}
