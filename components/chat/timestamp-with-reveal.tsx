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
import { useIsSidebarSheet } from '@/hooks/use-sidebar-sheet';
import { cn } from '@/lib/utils';

interface TimestampWithRevealProps {
    relativeLabel: string;
    absoluteLabel: string;
    disableDateTooltip?: boolean;
    className?: string;
}

export function TimestampWithReveal({
    relativeLabel,
    absoluteLabel,
    disableDateTooltip = false,
    className,
}: TimestampWithRevealProps) {
    const isSidebarSheet = useIsSidebarSheet();

    if (!relativeLabel || !absoluteLabel) {
        return null;
    }

    const diffLabel = (
        <span
            className={cn(
                'cursor-pointer text-xs text-muted-foreground underline underline-offset-2',
                className,
            )}
        >
            {relativeLabel}
        </span>
    );

    // Use a popover inside sidebar sheets where tooltip portal stacking is unreliable.
    if (disableDateTooltip || isSidebarSheet) {
        return (
            <Popover>
                <PopoverTrigger openOnHover delay={120} closeDelay={80}>
                    {diffLabel}
                </PopoverTrigger>
                <PopoverContent
                    side="top"
                    align="start"
                    className="w-fit max-w-[14rem] p-2 text-xs"
                >
                    <p>{absoluteLabel}</p>
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger>{diffLabel}</TooltipTrigger>
            <TooltipContent>
                <p>{absoluteLabel}</p>
            </TooltipContent>
        </Tooltip>
    );
}
