import { Form } from '@inertiajs/react';
import { MoreHorizontalIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { ActionsDropdownMenu } from '@/components/actions-dropdown-menu';
import { TimestampWithReveal } from '@/components/chat/timestamp-with-reveal';
import { CommentForm } from '@/components/comments/comment-form';
import type { Comment } from '@/components/comments/types';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import type {
    CommentsCopy,
    DialogCopy,
} from '@/components/types/shared-component-copy';
import type { RouteDefinition } from '@/components/types/wayfinder';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Button } from '@/components/ui/button';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Message,
    MessageAvatar,
    MessageContent,
    MessageFooter,
    MessageGroup,
} from '@/components/ui/message';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';

interface CommentListProps {
    comments: Comment[];
    updateFormAction?: (commentId: number) => RouteDefinition<'put' | 'patch'>;
    editingCommentId?: number | null;
    onEdit?: (commentId: number) => void;
    onCancelEdit?: () => void;
    destroyFormAction?: (commentId: number) => RouteDefinition<'delete'>;
    disableDateTooltip?: boolean;
    renderItem?: (item: ReactNode, comment: Comment) => ReactNode;
    /**
     * Override the list wrapper. Defaults to a `MessageGroup`. Pass an identity
     * renderer (`(items) => items`) when each item is already wrapped (via
     * `renderItem`) for an external container such as `MessageScrollerContent`,
     * so the wrapped items become its direct DOM children. The scroller's
     * height and anchor tracking measure direct children, and a
     * `display: contents` wrapper between them generates no box — breaking those
     * measurements — so the wrapper must be dropped, not flattened with CSS.
     */
    renderContainer?: (items: ReactNode) => ReactNode;
}

interface CommentDeleteDialogProps {
    commentId: number;
    destroyFormAction: (commentId: number) => RouteDefinition<'delete'>;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

function CommentDeleteDialog({
    commentId,
    destroyFormAction,
    isOpen,
    setIsOpen,
}: CommentDeleteDialogProps) {
    const copy: CommentsCopy & DialogCopy = useSharedComponentCopy();
    const destroyRoute = destroyFormAction(commentId);

    return (
        <Form
            action={destroyRoute}
            options={{ preserveScroll: true }}
            disableWhileProcessing
        >
            {({ processing, submit }) => (
                <DeleteConfirmationModal
                    open={isOpen || processing}
                    onOpenChange={setIsOpen}
                    title={copy.commentsDeleteTitle}
                    description={copy.commentsDeleteDescription}
                    processing={processing}
                    onDestroy={submit}
                />
            )}
        </Form>
    );
}

function getInitials(name: string): string {
    return (
        name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join('') || '?'
    );
}

interface CommentItemProps {
    comment: Comment;
    updateFormAction?: (commentId: number) => RouteDefinition<'put' | 'patch'>;
    isEditing?: boolean;
    onEdit?: (commentId: number) => void;
    onCancelEdit?: () => void;
    destroyFormAction?: (commentId: number) => RouteDefinition<'delete'>;
    disableDateTooltip?: boolean;
}

function CommentItem({
    comment,
    updateFormAction,
    isEditing = false,
    onEdit,
    onCancelEdit,
    destroyFormAction,
    disableDateTooltip = false,
}: CommentItemProps) {
    const copy: CommentsCopy & DialogCopy = useSharedComponentCopy();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const authoredName = comment.author?.name ?? comment.employee?.user?.name;
    const authorAvatar = comment.author?.avatar ?? null;
    const initials = authoredName ? getInitials(authoredName) : '?';
    const isCurrentUser = Boolean(comment.is_current_user);
    const canManageComment = Boolean(comment.can_be_managed);
    const hasPrimaryAction = Boolean(onEdit);
    const hasDeleteAction = Boolean(destroyFormAction);
    const hasActions = canManageComment && Boolean(onEdit || destroyFormAction);
    const formattedActivityAt =
        comment.formatted_updated_at ?? comment.formatted_created_at;
    const formattedActivityAtDiff =
        comment.formatted_updated_at_diff ?? comment.formatted_created_at_diff;
    const timestamp =
        formattedActivityAtDiff && formattedActivityAt
            ? {
                  absoluteLabel: formattedActivityAt,
                  relativeLabel: formattedActivityAtDiff,
              }
            : null;
    const commentActions =
        !isEditing && hasActions ? (
            <ActionsDropdownMenu
                align="end"
                contentClassName="w-fit"
                trigger={(open) => (
                    <Button
                        type="button"
                        variant={open ? 'secondary' : 'ghost'}
                        size="icon-xs"
                        data-test="comment-actions"
                        aria-label={copy.commentsActions}
                    >
                        <MoreHorizontalIcon data-icon="icon" />
                    </Button>
                )}
            >
                {onEdit && (
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            data-test="edit-comment"
                            onClick={() => onEdit(comment.id)}
                        >
                            <PencilIcon />
                            {copy.commentsEdit}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                )}
                {hasPrimaryAction && hasDeleteAction && (
                    <DropdownMenuSeparator />
                )}
                {destroyFormAction && (
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            data-test="delete-comment"
                            variant="destructive"
                            onClick={() => setDeleteOpen(true)}
                        >
                            <TrashIcon />
                            {copy.dialogDelete}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                )}
            </ActionsDropdownMenu>
        ) : null;
    const avatar = (
        <Avatar size="sm" aria-label={authoredName ?? undefined}>
            {authorAvatar && (
                <AvatarImage src={authorAvatar} alt={authoredName ?? ''} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
    );

    return (
        <div data-comment-item>
            <Message
                align={isCurrentUser ? 'end' : 'start'}
                className="items-start px-2 py-1.5 sm:px-3"
            >
                <MessageAvatar className="min-w-6">
                    {authoredName ? (
                        <Tooltip>
                            <TooltipTrigger render={avatar} />
                            <TooltipContent
                                side={isCurrentUser ? 'left' : 'right'}
                                align="center"
                            >
                                {authoredName}
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        avatar
                    )}
                </MessageAvatar>

                <MessageContent className="min-w-0">
                    <Bubble
                        variant={isEditing ? 'outline' : 'muted'}
                        className="max-w-full"
                    >
                        <BubbleContent
                            className={cn(isEditing && 'w-full p-0')}
                        >
                            {isEditing && updateFormAction ? (
                                <CommentForm
                                    formAction={updateFormAction(comment.id)}
                                    mode="edit"
                                    initialValue={comment.content}
                                    onCancel={onCancelEdit}
                                    autoFocus
                                />
                            ) : (
                                <span className="whitespace-pre-wrap">
                                    {comment.content}
                                </span>
                            )}
                        </BubbleContent>
                    </Bubble>

                    {!isEditing && (timestamp || commentActions) && (
                        <MessageFooter
                            className={cn(
                                'w-full gap-1.5 px-0',
                                isCurrentUser && 'translate-x-8',
                            )}
                        >
                            {timestamp && (
                                <TimestampWithReveal
                                    relativeLabel={timestamp.relativeLabel}
                                    absoluteLabel={timestamp.absoluteLabel}
                                    disableDateTooltip={disableDateTooltip}
                                    className="no-underline"
                                />
                            )}

                            {commentActions}
                        </MessageFooter>
                    )}
                </MessageContent>
            </Message>
            {canManageComment && destroyFormAction && (
                <CommentDeleteDialog
                    commentId={comment.id}
                    destroyFormAction={destroyFormAction}
                    isOpen={deleteOpen}
                    setIsOpen={setDeleteOpen}
                />
            )}
        </div>
    );
}

export function CommentList({
    comments,
    updateFormAction,
    editingCommentId = null,
    onEdit,
    onCancelEdit,
    destroyFormAction,
    disableDateTooltip = false,
    renderItem,
    renderContainer,
}: CommentListProps) {
    const items = comments.map((comment) => {
        const item = (
            <CommentItem
                key={comment.id}
                comment={comment}
                updateFormAction={updateFormAction}
                isEditing={editingCommentId === comment.id}
                onEdit={onEdit}
                onCancelEdit={onCancelEdit}
                destroyFormAction={destroyFormAction}
                disableDateTooltip={disableDateTooltip}
            />
        );

        return renderItem?.(item, comment) ?? item;
    });

    if (renderContainer) {
        return <>{renderContainer(items)}</>;
    }

    return <MessageGroup className="gap-2 py-2">{items}</MessageGroup>;
}
