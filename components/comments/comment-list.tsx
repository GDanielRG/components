import { Form } from '@inertiajs/react';
import {
    MoreHorizontalIcon,
    PencilIcon,
    PencilOffIcon,
    TrashIcon,
} from 'lucide-react';
import { useState } from 'react';
import { ActionsDropdownMenu } from '@/components/actions-dropdown-menu';
import { CommentForm } from '@/components/comments/comment-form';
import type { Comment } from '@/components/comments/types';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import type {
    CommentsCopy,
    DialogCopy,
} from '@/components/types/shared-component-copy';
import type { RouteDefinition } from '@/components/types/wayfinder';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Item,
    ItemContent,
    ItemGroup,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { useIsSidebarSheet } from '@/hooks/use-sidebar-sheet';

interface CommentListProps {
    comments: Comment[];
    updateFormAction?: (commentId: number) => RouteDefinition<'put' | 'patch'>;
    editingCommentId?: number | null;
    onEdit?: (commentId: number) => void;
    onCancelEdit?: () => void;
    destroyFormAction?: (commentId: number) => RouteDefinition<'delete'>;
    disableDateTooltip?: boolean;
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
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
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
    const authoredName = comment.employee?.user?.name;
    const initials = authoredName ? getInitials(authoredName) : null;
    const canManageComment = Boolean(comment.can_be_managed);
    const hasPrimaryAction = isEditing
        ? Boolean(onCancelEdit)
        : Boolean(onEdit);
    const hasDeleteAction = Boolean(destroyFormAction);
    const formattedActivityAt =
        comment.formatted_updated_at ?? comment.formatted_created_at;
    const formattedActivityAtDiff =
        comment.formatted_updated_at_diff ?? comment.formatted_created_at_diff;

    return (
        <div data-comment-item className="bg-background">
            <Item className="items-start gap-2 rounded-none border-0 px-2 py-2.5 sm:gap-2.5 sm:px-3 sm:py-3">
                {authoredName && (
                    <ItemMedia className="mt-0.5 self-start">
                        <Avatar className="size-7 sm:size-8">
                            <AvatarFallback className="text-xs sm:text-sm">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </ItemMedia>
                )}

                <ItemContent className="min-w-0 gap-1.5">
                    <ItemTitle className="line-clamp-none block w-full text-sm leading-snug">
                        {authoredName && (
                            <span className="mr-1.5 wrap-break-word text-foreground sm:mr-2">
                                {authoredName}
                            </span>
                        )}

                        <span className="inline-flex items-center gap-1.5 align-baseline whitespace-nowrap sm:gap-2">
                            {disableDateTooltip ? (
                                <Popover>
                                    <PopoverTrigger
                                        openOnHover
                                        delay={120}
                                        closeDelay={80}
                                    >
                                        <span className="cursor-pointer text-xs text-muted-foreground underline underline-offset-2">
                                            {formattedActivityAtDiff}
                                        </span>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        side="top"
                                        align="start"
                                        className="w-fit max-w-[14rem] p-2 text-xs"
                                    >
                                        <p>{formattedActivityAt}</p>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <span className="cursor-pointer text-xs text-muted-foreground underline underline-offset-2">
                                            {formattedActivityAtDiff}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{formattedActivityAt}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            {canManageComment &&
                                (onEdit || destroyFormAction) && (
                                    <ActionsDropdownMenu
                                        align="start"
                                        contentClassName="w-fit"
                                        trigger={(open) => (
                                            <Button
                                                type="button"
                                                variant={
                                                    open ? 'secondary' : 'ghost'
                                                }
                                                size="icon-sm"
                                                data-test="comment-actions"
                                                aria-label={
                                                    copy.commentsActions
                                                }
                                            >
                                                <MoreHorizontalIcon />
                                            </Button>
                                        )}
                                    >
                                        {isEditing && onCancelEdit ? (
                                            <DropdownMenuItem
                                                data-test="cancel-edit-comment"
                                                onClick={onCancelEdit}
                                            >
                                                <PencilOffIcon />
                                                {copy.commentsCancelEdit}
                                            </DropdownMenuItem>
                                        ) : (
                                            onEdit && (
                                                <DropdownMenuItem
                                                    data-test="edit-comment"
                                                    onClick={() =>
                                                        onEdit(comment.id)
                                                    }
                                                >
                                                    <PencilIcon />
                                                    {copy.commentsEdit}
                                                </DropdownMenuItem>
                                            )
                                        )}
                                        {hasPrimaryAction &&
                                            hasDeleteAction && (
                                                <DropdownMenuSeparator />
                                            )}
                                        {destroyFormAction && (
                                            <DropdownMenuItem
                                                data-test="delete-comment"
                                                variant="destructive"
                                                onClick={() =>
                                                    setDeleteOpen(true)
                                                }
                                            >
                                                <TrashIcon />
                                                {copy.dialogDelete}
                                            </DropdownMenuItem>
                                        )}
                                    </ActionsDropdownMenu>
                                )}
                        </span>
                    </ItemTitle>

                    {isEditing && updateFormAction ? (
                        <div>
                            <CommentForm
                                formAction={updateFormAction(comment.id)}
                                mode="edit"
                                initialValue={comment.content}
                                onCancel={onCancelEdit}
                                autoFocus
                            />
                        </div>
                    ) : (
                        <p className="text-xs leading-normal wrap-break-word text-foreground">
                            {comment.content}
                        </p>
                    )}
                </ItemContent>
            </Item>
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
}: CommentListProps) {
    const isSidebarSheet = useIsSidebarSheet();

    return (
        <ItemGroup className="gap-0 [&>[data-comment-item]:not(:last-child)]:border-b">
            {comments.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    updateFormAction={updateFormAction}
                    isEditing={editingCommentId === comment.id}
                    onEdit={onEdit}
                    onCancelEdit={onCancelEdit}
                    destroyFormAction={destroyFormAction}
                    disableDateTooltip={disableDateTooltip || isSidebarSheet}
                />
            ))}
        </ItemGroup>
    );
}
