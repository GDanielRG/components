import { BellIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NotificationBellProps = Omit<ComponentProps<typeof Button>, 'children'> & {
    unseenCount: number;
};

export function NotificationBell({
    unseenCount,
    className,
    ...props
}: NotificationBellProps) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn('relative', className)}
            {...props}
        >
            <BellIcon data-icon="inline-start" />
            {unseenCount > 0 ? (
                <Badge
                    variant="destructive"
                    className="pointer-events-none absolute -top-1 -right-1 min-w-5 px-1 tabular-nums"
                    data-test="notification-unseen-badge"
                >
                    {unseenCount > 99 ? '99+' : unseenCount}
                </Badge>
            ) : null}
        </Button>
    );
}
