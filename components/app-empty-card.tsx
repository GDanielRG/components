import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';

type EmptyCardProps = {
    className?: string;
    icon: LucideIcon;
    title: string;
    subtitle: string;
    content?: ReactNode;
};

/**
 * Bordered empty-state card matching the sibling apps' `app-empty-card`: an
 * icon medallion, title, subtitle and an optional action slot.
 */
export default function EmptyCard({
    className,
    icon: Icon,
    title,
    subtitle,
    content,
}: EmptyCardProps) {
    return (
        <Empty className={cn('border', className)}>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Icon />
                </EmptyMedia>
                <EmptyTitle>{title}</EmptyTitle>
                <EmptyDescription>{subtitle}</EmptyDescription>
            </EmptyHeader>
            {content ? (
                <EmptyContent className="md:max-w-xl">{content}</EmptyContent>
            ) : null}
        </Empty>
    );
}
