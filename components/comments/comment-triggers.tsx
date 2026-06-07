import { MessageCircleIcon, MessageCirclePlusIcon } from 'lucide-react';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { CommentList } from '@/components/comments/comment-list';
import { ActiveTriggerIcon } from '@/components/ui/active-trigger-icon';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';
import type { Comment } from '@/types';
import type { RouteDefinition } from '@/types/wayfinder';
import type { CommentsCopy } from '../../types/shared-component-copy';

interface CommentsToggleButtonProps {
    onClick: () => void;
    size?: 'default' | 'sm';
    commentCount?: number;
    isActive?: boolean;
}

export function CommentsToggleButton({
    onClick,
    size = 'default',
    commentCount = 0,
    isActive = false,
}: CommentsToggleButtonProps) {
    const copy: CommentsCopy = useSharedComponentCopy();
    const hasComments = commentCount > 0;
    const Icon = hasComments ? MessageCircleIcon : MessageCirclePlusIcon;
    const label = hasComments
        ? copy.commentsCount(commentCount)
        : copy.commentsSubmit;

    return (
        <Button
            size={size}
            variant="outline"
            data-test="toggle-comments"
            aria-label={label}
            onClick={onClick}
            className={cn(isActive && 'group')}
        >
            <ActiveTriggerIcon icon={Icon} isActive={isActive} />
            {label}
        </Button>
    );
}

interface CommentsListPopoverProps {
    comments: Comment[];
    trigger?: ReactElement | ((open: boolean) => ReactElement);
    destroyFormAction?: (commentId: number) => RouteDefinition<'delete'>;
    compact?: boolean;
    dataTest?: string;
}

export function CommentsListPopover({
    comments,
    trigger,
    destroyFormAction,
    compact = false,
    dataTest,
}: CommentsListPopoverProps) {
    const copy: CommentsCopy = useSharedComponentCopy();
    const [open, setOpen] = useState(false);

    if (comments.length === 0) {
        return null;
    }

    const label = copy.commentsCount(comments.length);
    const defaultTrigger = (
        <Button
            type="button"
            variant={open ? 'secondary' : 'outline'}
            size="sm"
            data-test={dataTest}
        >
            <MessageCircleIcon />
            {compact ? comments.length : label}
        </Button>
    );

    const triggerElement =
        typeof trigger === 'function'
            ? trigger(open)
            : (trigger ?? defaultTrigger);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={triggerElement} />
            <PopoverContent className="w-xs overflow-y-auto p-0">
                <ScrollArea className="max-h-72">
                    <CommentList
                        comments={comments}
                        destroyFormAction={destroyFormAction}
                        disableDateTooltip
                    />
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
