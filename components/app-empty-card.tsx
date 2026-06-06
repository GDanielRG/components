import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';

type EmptyCardProps = Omit<
    ComponentProps<typeof Empty>,
    'children' | 'content'
> & {
    icon?: LucideIcon;
    title: string;
    subtitle: string;
    content?: ReactNode;
};

/**
 * Bordered empty-state card: an optional icon medallion, title, subtitle and an
 * optional action slot. Pass `className` to extend the wrapper and omit `icon`
 * for icon-less states.
 */
export function EmptyCard({
    className,
    icon: Icon,
    title,
    subtitle,
    content,
    ...props
}: EmptyCardProps) {
    return (
        <Empty className={cn('border', className)} {...props}>
            <EmptyHeader>
                {Icon ? (
                    <EmptyMedia variant="icon">
                        <Icon />
                    </EmptyMedia>
                ) : null}
                <EmptyTitle>{title}</EmptyTitle>
                <EmptyDescription>{subtitle}</EmptyDescription>
            </EmptyHeader>
            {content ? (
                <EmptyContent className="md:max-w-xl">{content}</EmptyContent>
            ) : null}
        </Empty>
    );
}
