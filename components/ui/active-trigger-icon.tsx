import type { LucideIcon } from 'lucide-react';
import { XIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type ActiveTriggerIconProps = Omit<ComponentProps<'span'>, 'children'> & {
    icon: LucideIcon;
    isActive?: boolean;
};

export function ActiveTriggerIcon({
    icon: Icon,
    isActive = false,
    className,
    ...props
}: ActiveTriggerIconProps) {
    return (
        <span
            data-slot="active-trigger-icon"
            className={cn('relative inline-grid place-items-center', className)}
            {...props}
        >
            <Icon />
            {isActive && (
                <span className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary group-hover:grid place-items-center p-1">
                    <XIcon className="stroke-primary-foreground size-3" />
                </span>
            )}
        </span>
    );
}
