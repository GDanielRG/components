import type { ComponentProps } from 'react';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';
import type { SharedComponentCopy } from '../types/shared-component-copy';

type OptionalLabelProps = Omit<ComponentProps<'span'>, 'children'> & {
    label?: string;
};

export function OptionalLabel({
    label,
    className,
    ...props
}: OptionalLabelProps) {
    const copy: SharedComponentCopy = useSharedComponentCopy();
    const resolvedLabel = label ?? copy.optionalLabel;

    return (
        <span
            data-slot="optional-label"
            className={cn('text-xs text-muted-foreground', className)}
            {...props}
        >
            {resolvedLabel}
        </span>
    );
}
