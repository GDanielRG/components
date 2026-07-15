import { useState } from 'react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { NotificationPopoverContent } from '@/components/notifications/notification-popover-content';
import type {
    NotificationCenterCopy,
    NotificationCenterItem,
} from '@/components/notifications/types';
import { defaultNotificationCenterCopy } from '@/components/notifications/types';
import { Popover, PopoverTrigger } from '@/components/ui/popover';

type NotificationCenterProps = {
    items: NotificationCenterItem[];
    unseenCount: number;
    unreadCount: number;
    loading: boolean;
    hasMore: boolean;
    copy?: NotificationCenterCopy;
    triggerClassName?: string;
    onOpen: () => void;
    onOpenChange?: (open: boolean) => void;
    onItemClick: (item: NotificationCenterItem) => void;
    onArchive: (item: NotificationCenterItem) => void;
    onLoadOlder: () => void;
};

export function NotificationCenter({
    items,
    unseenCount,
    unreadCount,
    loading,
    hasMore,
    copy = defaultNotificationCenterCopy,
    triggerClassName,
    onOpen,
    onOpenChange,
    onItemClick,
    onArchive,
    onLoadOlder,
}: NotificationCenterProps) {
    const [open, setOpen] = useState(false);

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        onOpenChange?.(nextOpen);

        if (nextOpen && !open) {
            onOpen();
        }
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger
                render={
                    <NotificationBell
                        unseenCount={unseenCount}
                        className={triggerClassName}
                        aria-label={copy.triggerLabel}
                        data-test="notification-center-trigger"
                    />
                }
            />
            <NotificationPopoverContent
                items={items}
                unreadCount={unreadCount}
                loading={loading}
                hasMore={hasMore}
                copy={copy}
                onItemClick={onItemClick}
                onArchive={onArchive}
                onLoadOlder={onLoadOlder}
            />
        </Popover>
    );
}
