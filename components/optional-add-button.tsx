import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export default function OptionalAddButton({
    children,
    buttonText,
    closedLabel,
    dataTest,
    defaultOpen = false,
    icon = <Plus data-icon="inline-start" />,
    open,
    onOpenChange,
    className,
    contentClassName,
}: {
    children: ReactNode;
    buttonText: string;
    closedLabel?: ReactNode;
    dataTest?: string;
    defaultOpen?: boolean;
    icon?: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    contentClassName?: string;
}) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isOpen = open ?? internalOpen;

    const handleOpenChange = (nextOpen: boolean) => {
        setInternalOpen(nextOpen);
        onOpenChange?.(nextOpen);
    };

    return (
        <Collapsible
            defaultOpen={defaultOpen}
            open={open}
            onOpenChange={handleOpenChange}
            className={cn(
                closedLabel && 'flex flex-col items-start gap-3',
                className,
            )}
        >
            {closedLabel && !isOpen && closedLabel}

            <CollapsibleTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        data-test={dataTest}
                        className="data-panel-open:hidden"
                    />
                }
            >
                {icon}
                {buttonText}
            </CollapsibleTrigger>

            <CollapsibleContent
                className={cn(closedLabel && 'w-full', contentClassName)}
            >
                {children}
            </CollapsibleContent>
        </Collapsible>
    );
}
