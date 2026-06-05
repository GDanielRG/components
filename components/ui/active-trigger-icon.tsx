import type { LucideIcon } from 'lucide-react';
import { XIcon } from 'lucide-react';

interface ActiveTriggerIconProps {
    icon: LucideIcon;
    isActive?: boolean;
}

export default function ActiveTriggerIcon({
    icon: Icon,
    isActive = false,
}: ActiveTriggerIconProps) {
    return (
        <span className="relative inline-grid place-items-center">
            <Icon />
            {isActive && (
                <span className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary group-hover:grid place-items-center p-1">
                    <XIcon className="stroke-primary-foreground size-3" />
                </span>
            )}
        </span>
    );
}
