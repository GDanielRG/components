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
    /**
     * Relative label rendered inline (e.g. "2h ago"). The reveal surface
     * exposes the absolute timestamp.
     */
    relativeLabel: string;
    /** Absolute timestamp shown on hover/focus reveal. */
    absoluteLabel: string;
    /**
     * Force the openOnHover Popover reveal instead of the default Tooltip,
     * regardless of viewport. Combined with the sidebar-sheet breakpoint so a
     * caller already inside a sidebar sheet always gets the Popover.
     */
    disableDateTooltip?: boolean;
    className?: string;
}

/**
 * Relative timestamp that reveals the absolute date on reveal: a desktop
 * `Tooltip`, or an `openOnHover` `Popover` when inside the sidebar sheet (the
 * Tooltip is unreliable inside the sheet's portal stacking context). The reveal
 * surface is chosen by `disableDateTooltip || useIsSidebarSheet()`.
 */
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
