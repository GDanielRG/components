import { Plus } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not(:disabled)',
    'input:not(:disabled):not([type="hidden"])',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

export function OptionalAddButton({
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
    const [focusRequest, setFocusRequest] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const focusOnOpenRef = useRef(false);
    const isOpen = open ?? internalOpen;

    useLayoutEffect(() => {
        if (!focusOnOpenRef.current) {
            return;
        }

        focusOnOpenRef.current = false;

        if (!isOpen) {
            return;
        }

        const content = contentRef.current;
        const focusTarget =
            content?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? content;

        // Opening hides the trigger; hand focus into the revealed content.
        focusTarget?.focus({ preventScroll: true });
    }, [focusRequest, isOpen]);

    const handleOpenChange = (nextOpen: boolean) => {
        focusOnOpenRef.current = nextOpen;

        if (nextOpen) {
            setFocusRequest((request) => request + 1);
        }

        setInternalOpen(nextOpen);
        onOpenChange?.(nextOpen);
    };

    return (
        <Collapsible
            open={isOpen}
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
                render={<div ref={contentRef} tabIndex={-1} />}
                className={cn(closedLabel && 'w-full', contentClassName)}
            >
                {children}
            </CollapsibleContent>
        </Collapsible>
    );
}
