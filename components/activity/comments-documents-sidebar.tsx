import {
    ArrowDownIcon,
    FilesIcon,
    MessageCircleIcon,
    MessageCirclePlusIcon,
    PanelRightCloseIcon,
    PanelRightOpenIcon,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { AppRightSidebar } from '@/components/app-right-sidebar';
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from '@/components/chat/message-scroller';
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

type RenderCommentLiveUpdates = (state: { enabled: boolean }) => ReactNode;

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
    renderCommentLiveUpdates?: RenderCommentLiveUpdates;
    /**
     * Optional ephemeral typing indicator appended after the comment list as a
     * trailing scroller item. Pass a falsy value (e.g. `null`) when nobody is
     * typing so the scroller never reserves an empty item. App-owned: the
     * registry only places it.
     */
    commentTypingIndicator?: ReactNode;
    /**
     * Fires with the create-composer draft on every change, for live typing
     * presence. Wired to the create `CommentForm`'s `onContentChange`.
     */
    onCommentDraftChange?: (content: string) => void;
    /** Fires when the create-composer textarea receives focus. */
    onCommentDraftFocus?: () => void;
    /** Fires when the create-composer textarea loses focus. */
    onCommentDraftBlur?: () => void;
    /**
     * Fires whenever the create composer closes (cancel, successful submit, tab
     * change, or sidebar close) so the app can stop broadcasting typing.
     */
    onCommentComposerClose?: () => void;
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
    renderCommentLiveUpdates,
    commentTypingIndicator,
    onCommentDraftChange,
    onCommentDraftFocus,
    onCommentDraftBlur,
    onCommentComposerClose,
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
    const chronologicalComments = comments.slice().reverse();
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
        onCommentComposerClose?.();
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

    const toggleSidebar = () => {
        if (open) {
            handleClose();

            return;
        }

        setOpen(true);
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
        toolbar: !open ? (
            <SidebarToggleButton open={false} onToggle={toggleSidebar} />
        ) : null,
        rightSidebar: (
            <>
                {renderCommentLiveUpdates?.({
                    enabled: !isCreatingComment && editingCommentId === null,
                })}
                <CommentsDocumentsSidebar
                    open={open}
                    onOpenChange={handleOpenChange}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    onToggle={toggleSidebar}
                    comments={{
                        count: comments.length,
                        hasContent: comments.length > 0,
                        content: (
                            <>
                                <CommentList
                                    comments={chronologicalComments}
                                    updateFormAction={updateCommentForm}
                                    editingCommentId={editingCommentId}
                                    onEdit={handleEditComment}
                                    onCancelEdit={clearEditingComment}
                                    destroyFormAction={destroyCommentForm}
                                    renderContainer={(items) => items}
                                    renderItem={(item, comment) => (
                                        <MessageScrollerItem
                                            key={comment.id}
                                            messageId={String(comment.id)}
                                        >
                                            {item}
                                        </MessageScrollerItem>
                                    )}
                                />
                                {commentTypingIndicator ? (
                                    <MessageScrollerItem
                                        messageId="comment-typing-indicator"
                                        className="empty:hidden"
                                    >
                                        {commentTypingIndicator}
                                    </MessageScrollerItem>
                                ) : null}
                            </>
                        ),
                        footer: isCreatingComment ? (
                            <CommentForm
                                formAction={storeCommentForm}
                                mode="create"
                                onCancel={hideCreateComment}
                                onContentChange={onCommentDraftChange}
                                onContentFocus={onCommentDraftFocus}
                                onContentBlur={onCommentDraftBlur}
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
                                    <MessageCirclePlusIcon data-icon="inline-start" />
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
            </>
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

    const toggleSidebar = () => {
        if (open) {
            closeSidebar();

            return;
        }

        setOpen(true);
    };

    return {
        documentCount: documentsPanel.count,
        activePanel: open ? activeTab : null,
        openDocumentsTab,
        toolbar: !open ? (
            <SidebarToggleButton open={false} onToggle={toggleSidebar} />
        ) : null,
        rightSidebar: (
            <CommentsDocumentsSidebar
                open={open}
                onOpenChange={handleOpenChange}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onToggle={toggleSidebar}
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

function SidebarToggleButton({
    open,
    onToggle,
}: {
    open: boolean;
    onToggle: () => void;
}) {
    const copy: ActivityCopy = useSharedComponentCopy();

    return (
        <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-label={copy.activityToggleSidebar}
            aria-expanded={open}
            data-test="activity-sidebar-toggle"
            onClick={onToggle}
            className="aria-expanded:bg-transparent aria-expanded:hover:bg-muted"
        >
            {open ? (
                <PanelRightCloseIcon data-icon="icon" />
            ) : (
                <PanelRightOpenIcon data-icon="icon" />
            )}
        </Button>
    );
}

function ActivityTabs({
    activeTab,
    onTabChange,
    comments,
    documents,
}: {
    activeTab: CommentsDocumentsSidebarTab;
    onTabChange: (tab: CommentsDocumentsSidebarTab) => void;
    comments?: SidebarSection;
    documents?: SidebarSection;
}) {
    const copy: ActivityCopy = useSharedComponentCopy();

    return (
        <Tabs
            value={activeTab}
            onValueChange={(value: string) =>
                onTabChange(value as CommentsDocumentsSidebarTab)
            }
        >
            <TabsList>
                {comments && (
                    <TabsTrigger
                        value="comments"
                        aria-label={copy.activityCommentsTab}
                        data-test="activity-tab-comments"
                    >
                        <MessageCircleIcon />
                        {(comments.count ?? 0) > 0 && (
                            <Badge
                                variant={
                                    activeTab === 'comments'
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
                        aria-label={copy.activityDocumentsTab}
                        data-test="activity-tab-documents"
                    >
                        <FilesIcon />
                        {(documents.count ?? 0) > 0 && (
                            <Badge
                                variant={
                                    activeTab === 'documents'
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
        </Tabs>
    );
}

interface CommentsDocumentsSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activeTab: CommentsDocumentsSidebarTab;
    onTabChange: (tab: CommentsDocumentsSidebarTab) => void;
    onToggle: () => void;
    comments?: SidebarSection;
    documents?: SidebarSection;
}

function CommentsDocumentsSidebar({
    open,
    onOpenChange,
    activeTab,
    onTabChange,
    onToggle,
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
            <SidebarHeader className="min-h-13 flex-row items-center justify-between gap-2 px-4 py-2 lg:px-0">
                <ActivityTabs
                    activeTab={resolvedActiveTab}
                    onTabChange={onTabChange}
                    comments={comments}
                    documents={documents}
                />
                <SidebarToggleButton open={open} onToggle={onToggle} />
            </SidebarHeader>

            {showActiveContent && (
                <SidebarContent
                    data-test="activity-sidebar-content"
                    className={cn(
                        'm-4 mt-0 mb-0 min-h-0 flex-initial overflow-hidden lg:mx-0',
                        resolvedActiveTab === 'comments' &&
                            'rounded-xl border bg-background shadow-sm lg:border-0',
                    )}
                >
                    {resolvedActiveTab === 'comments' ? (
                        <MessageScrollerProvider
                            autoScroll
                            defaultScrollPosition="end"
                        >
                            <MessageScroller>
                                <MessageScrollerViewport
                                    aria-label={copy.activityCommentsTab}
                                >
                                    <MessageScrollerContent className="gap-2 py-2">
                                        {activeSection?.content}
                                    </MessageScrollerContent>
                                </MessageScrollerViewport>
                                <MessageScrollerButton>
                                    <ArrowDownIcon data-icon="icon" />
                                    <span className="sr-only">
                                        {copy.activityScrollToLatest}
                                    </span>
                                </MessageScrollerButton>
                            </MessageScroller>
                        </MessageScrollerProvider>
                    ) : (
                        <ScrollArea fadeEdges="y" className="h-full min-h-0">
                            {activeSection?.content}
                        </ScrollArea>
                    )}
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
        </AppRightSidebar>
    );
}
