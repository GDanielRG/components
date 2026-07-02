import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';

import { cn } from '@/lib/utils';

function ScrollArea({
    className,
    children,
    fadeEdges = false,
    ...props
}: ScrollAreaPrimitive.Root.Props & {
    /**
     * Mask the scroll edges with the owned `scroll-fade` utility as an
     * overflow-more cue. Applied to the Viewport (not the Root) so the
     * ScrollBar sibling stays unclipped. `true`/`'y'` fades the block axis,
     * `'x'` the inline axis. Defaults to `false` (no mask, byte-identical to
     * an unfaded ScrollArea).
     */
    fadeEdges?: boolean | 'y' | 'x';
}) {
    return (
        <ScrollAreaPrimitive.Root
            data-slot="scroll-area"
            className={cn('relative', className)}
            {...props}
        >
            <ScrollAreaPrimitive.Viewport
                data-slot="scroll-area-viewport"
                className={cn(
                    'size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1',
                    fadeEdges === 'x' && 'scroll-fade-x',
                    (fadeEdges === true || fadeEdges === 'y') &&
                        'scroll-fade-y',
                )}
            >
                {children}
            </ScrollAreaPrimitive.Viewport>
            <ScrollBar />
            <ScrollAreaPrimitive.Corner />
        </ScrollAreaPrimitive.Root>
    );
}

function ScrollBar({
    className,
    orientation = 'vertical',
    ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
    return (
        <ScrollAreaPrimitive.Scrollbar
            data-slot="scroll-area-scrollbar"
            data-orientation={orientation}
            orientation={orientation}
            className={cn(
                'flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent',
                className,
            )}
            {...props}
        >
            <ScrollAreaPrimitive.Thumb
                data-slot="scroll-area-thumb"
                className="relative flex-1 rounded-full bg-border"
            />
        </ScrollAreaPrimitive.Scrollbar>
    );
}

export { ScrollArea, ScrollBar };
