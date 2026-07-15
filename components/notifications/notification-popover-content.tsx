import { ArchiveIcon, BellIcon } from 'lucide-react';
import type { UIEvent } from 'react';
import type {
    NotificationCenterCopy,
    NotificationCenterItem,
} from '@/components/notifications/types';
import { defaultNotificationCenterCopy } from '@/components/notifications/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item';
import {
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

type NotificationPopoverContentProps = {
    items: NotificationCenterItem[];
    unreadCount: number;
    loading: boolean;
    hasMore: boolean;
    copy?: NotificationCenterCopy;
    onItemClick: (item: NotificationCenterItem) => void;
    onArchive: (item: NotificationCenterItem) => void;
    onLoadOlder: () => void;
};

export function NotificationPopoverContent({
    items,
    unreadCount,
    loading,
    hasMore,
    copy = defaultNotificationCenterCopy,
    onItemClick,
    onArchive,
    onLoadOlder,
}: NotificationPopoverContentProps) {
    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        const target = event.target;

        if (!(target instanceof HTMLElement) || loading || !hasMore) {
            return;
        }

        const remaining =
            target.scrollHeight - target.scrollTop - target.clientHeight;

        if (remaining <= 24) {
            onLoadOlder();
        }
    };

    return (
        <PopoverContent align="end" className="w-96 gap-0 p-0">
            <PopoverHeader className="px-4 py-3">
                <PopoverTitle>{copy.title}</PopoverTitle>
                <PopoverDescription>
                    {copy.unreadLabel(unreadCount)}
                </PopoverDescription>
            </PopoverHeader>
            <Separator />
            <ScrollArea
                className="h-96"
                onScrollCapture={handleScroll}
                data-test="notification-scroll-area"
            >
                {items.length === 0 && !loading ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <BellIcon />
                            </EmptyMedia>
                            <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
                            <EmptyDescription>
                                {copy.emptyDescription}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <ItemGroup className="gap-0 p-2">
                        {items.map((item) => (
                            <NotificationPopoverItem
                                key={item.id}
                                item={item}
                                archiveLabel={copy.archiveLabel}
                                onItemClick={onItemClick}
                                onArchive={onArchive}
                            />
                        ))}
                    </ItemGroup>
                )}
                {loading ? (
                    <div
                        className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground"
                        role="status"
                    >
                        <Spinner />
                        <span className="sr-only">{copy.loadingLabel}</span>
                    </div>
                ) : null}
                {hasMore && !loading ? (
                    <div className="flex justify-center p-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onLoadOlder}
                        >
                            {copy.loadOlderLabel}
                        </Button>
                    </div>
                ) : null}
            </ScrollArea>
        </PopoverContent>
    );
}

function NotificationPopoverItem({
    item,
    archiveLabel,
    onItemClick,
    onArchive,
}: {
    item: NotificationCenterItem;
    archiveLabel: string;
    onItemClick: (item: NotificationCenterItem) => void;
    onArchive: (item: NotificationCenterItem) => void;
}) {
    const unread = item.readAt === null;

    return (
        <Item
            size="sm"
            className="flex-nowrap"
            data-test={`notification-${item.id}`}
        >
            <ItemMedia>
                {unread ? (
                    <Badge
                        className="size-2 p-0"
                        aria-hidden="true"
                        data-test={`notification-${item.id}-unread-dot`}
                    />
                ) : null}
            </ItemMedia>
            <Button
                type="button"
                variant="ghost"
                className="h-auto min-w-0 flex-1 justify-start p-0"
                onClick={() => onItemClick(item)}
                data-test={`notification-${item.id}-link`}
            >
                <ItemContent>
                    <ItemTitle>
                        {unread ? <strong>{item.title}</strong> : item.title}
                    </ItemTitle>
                    {item.body ? (
                        <ItemDescription>{item.body}</ItemDescription>
                    ) : null}
                    <ItemDescription>{item.relativeTime}</ItemDescription>
                </ItemContent>
            </Button>
            <ItemActions className="opacity-0 transition-opacity group-focus-within/item:opacity-100 group-hover/item:opacity-100">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={archiveLabel}
                    data-test={`notification-${item.id}-archive`}
                    onClick={() => onArchive(item)}
                >
                    <ArchiveIcon data-icon="inline-start" />
                </Button>
            </ItemActions>
        </Item>
    );
}
