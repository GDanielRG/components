import { Link } from '@inertiajs/react';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MoreHorizontalIcon,
} from 'lucide-react';
import type * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn('mx-auto flex w-full justify-center', className)}
            {...props}
        />
    );
}

function PaginationContent({
    className,
    ...props
}: React.ComponentProps<'ul'>) {
    return (
        <ul
            data-slot="pagination-content"
            className={cn('flex items-center gap-1', className)}
            {...props}
        />
    );
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
    return <li data-slot="pagination-item" {...props} />;
}

// Customization carried by the components registry: links render through
// Inertia's <Link> (SPA visits, not full page loads) and support a `disabled`
// state for boundary pages. <Link as="button"> renders a native <button>, so
// Base UI's default nativeButton (true) must stay — do not pass
// nativeButton={false} here (upstream shadcn pairs it with an <a>).
type PaginationLinkProps = {
    isActive?: boolean;
    disabled?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
    Omit<React.ComponentProps<typeof Link>, 'size'>;

function PaginationLink({
    className,
    isActive,
    size = 'icon',
    disabled,
    ...props
}: PaginationLinkProps) {
    return (
        <Button
            variant={isActive ? 'outline' : 'ghost'}
            size={size}
            disabled={disabled}
            className={cn(
                disabled && 'pointer-events-none opacity-50',
                className,
            )}
            render={
                <Link
                    as="button"
                    aria-current={isActive ? 'page' : undefined}
                    data-slot="pagination-link"
                    data-active={isActive}
                    {...props}
                />
            }
        />
    );
}

function PaginationPrevious({
    className,
    text = 'Previous',
    disabled,
    ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
    return (
        <PaginationLink
            aria-label={text}
            size="default"
            disabled={disabled}
            className={cn('pl-2!', className)}
            {...props}
        >
            <ChevronLeftIcon data-icon="inline-start" />
            <span className="hidden sm:block">{text}</span>
        </PaginationLink>
    );
}

function PaginationNext({
    className,
    text = 'Next',
    disabled,
    ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
    return (
        <PaginationLink
            aria-label={text}
            size="default"
            disabled={disabled}
            className={cn('pr-2!', className)}
            {...props}
        >
            <span className="hidden sm:block">{text}</span>
            <ChevronRightIcon data-icon="inline-end" />
        </PaginationLink>
    );
}

function PaginationEllipsis({
    className,
    ...props
}: React.ComponentProps<'span'>) {
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn(
                'flex size-9 items-center justify-center [&_svg:not([class*="size-"])]:size-4',
                className,
            )}
            {...props}
        >
            <MoreHorizontalIcon />
            <span className="sr-only">More pages</span>
        </span>
    );
}

export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
};
