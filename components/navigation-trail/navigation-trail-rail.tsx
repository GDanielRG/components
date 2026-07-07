import { useState } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type NavigationTrailItem = {
    id: string;
    label: string;
    description?: string;
};

/**
 * Purely presentational Codex-style tick rail: a slim column of tiny ticks
 * overlaid just past the tracked content column's right edge (zero layout
 * space of its own — the caller only needs a `relative` ancestor sized to the
 * content region, and passes `contentWidthClassName` so the rail's
 * positioning wrapper matches the content's own max-width instead of the
 * full row). Hovering/focusing the rail expands every tick; the specific
 * hovered/focused tick additionally opens a `Popover` with its name (and
 * description, when supplied) — an interactive container, not a text pill,
 * so a future actions row (e.g. group operations) can be added to the same
 * popup without a redesign (see the comment inside `NavigationTrailTick`).
 * Click still calls `onSelect`.
 *
 * No hook imports on purpose: `activeId`/`onSelect` are plain props, so this
 * component has no opinion on how visibility/scroll-to is tracked. See
 * `NavigationTrail` (the connected wrapper, a separate file) for the bridge
 * to `chat`'s message-scroller hooks — that wrapper is the seam a stage-2
 * IntersectionObserver swap would replace; this file would not change.
 */
function NavigationTrailRail({
    items,
    activeId,
    onSelect,
    ariaLabel,
    className,
    contentWidthClassName,
}: {
    items: NavigationTrailItem[];
    activeId: string | null;
    onSelect: (id: string) => void;
    ariaLabel: string;
    className?: string;
    /**
     * The tracked content column's own max-width class (e.g. `"max-w-4xl"`),
     * so the rail's right edge tracks where the cards/tables actually end
     * instead of the full (possibly much wider) row. Omit to anchor against
     * the full row width instead.
     */
    contentWidthClassName?: string;
}) {
    if (items.length === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-y-0 left-0 hidden w-full lg:block',
                contentWidthClassName,
            )}
        >
            <nav
                aria-label={ariaLabel}
                data-slot="navigation-trail"
                className={cn(
                    'group/navigation-trail pointer-events-auto absolute inset-y-0 right-0 z-10 flex w-6 flex-col items-end justify-center gap-1.5 py-6',
                    className,
                )}
            >
                {items.map((item) => (
                    <NavigationTrailTick
                        key={item.id}
                        item={item}
                        isActive={item.id === activeId}
                        onSelect={onSelect}
                    />
                ))}
            </nav>
        </div>
    );
}

/**
 * One tick + its Popover. Base UI's `Popover.Trigger` already exposes
 * `openOnHover`/`delay`/`closeDelay` (verified against the installed
 * `@base-ui/react` types — no wrapper change needed), and its popup
 * participates in the same hover interaction as the trigger, so the pointer
 * can travel from the tick into the open popup without it closing. Base UI's
 * Popover intentionally does NOT open on mere keyboard focus (unlike
 * Tooltip/PreviewCard) — likely because a popover can hold interactive
 * content, so `onFocus`/`onBlur` below add that explicitly, using a shared
 * `data-navigation-trail-tick` marker (not refs) to tell "focus moved to my
 * own trigger or popup" apart from "focus left both" across the popup's
 * portal boundary. `onKeyDown` closes on Escape defensively, in case a
 * focus-opened (not hover/click-opened) popover doesn't already dismiss on
 * its own.
 */
function NavigationTrailTick({
    item,
    isActive,
    onSelect,
}: {
    item: NavigationTrailItem;
    isActive: boolean;
    onSelect: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);

    const closeUnlessFocusStaysInside = (event: FocusEvent) => {
        const next = event.relatedTarget;
        if (
            next instanceof Element &&
            next.closest(`[data-navigation-trail-tick="${item.id}"]`)
        ) {
            return;
        }
        setOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                data-navigation-trail-tick={item.id}
                type="button"
                data-slot="navigation-trail-item"
                data-test={`navigation-trail-item-${item.id}`}
                aria-current={isActive ? 'true' : undefined}
                openOnHover
                delay={0}
                closeDelay={100}
                onClick={() => onSelect(item.id)}
                onFocus={() => setOpen(true)}
                onBlur={closeUnlessFocusStaysInside}
                onKeyDown={closeOnEscape}
                className="flex h-2.5 w-6 items-center justify-end px-1 focus-visible:outline-none"
            >
                <span
                    aria-hidden="true"
                    className={cn(
                        'h-0.5 w-3 rounded-full bg-muted-foreground/40 transition-all group-focus-within/navigation-trail:w-5 group-hover/navigation-trail:w-5',
                        isActive &&
                            'h-1 w-5 bg-foreground group-focus-within/navigation-trail:w-6 group-hover/navigation-trail:w-6',
                    )}
                />
                <span className="sr-only">{item.label}</span>
            </PopoverTrigger>
            <PopoverContent
                data-navigation-trail-tick={item.id}
                side="left"
                onBlur={closeUnlessFocusStaysInside}
                onKeyDown={closeOnEscape}
                className="w-64 gap-1 p-3 text-left text-sm"
            >
                <span className="font-medium">{item.label}</span>
                {item.description && (
                    <span className="text-muted-foreground">
                        {item.description}
                    </span>
                )}
                {/* Actions slot: a future per-item action row (e.g. group
                    operations) renders here, inside this same popup, once the
                    app has something to put there. Not built this pass — no
                    prop exists yet; adding one (e.g. a `renderActions?:
                    (item: NavigationTrailItem) => ReactNode` prop threaded
                    down from `NavigationTrailRail`) is a non-breaking
                    addition. */}
            </PopoverContent>
        </Popover>
    );
}

export { NavigationTrailRail };
