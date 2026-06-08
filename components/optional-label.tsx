import type { ComponentProps } from 'react';
import type { FormCopy } from '@/components/types/shared-component-copy';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';

type OptionalLabelProps = Omit<ComponentProps<'span'>, 'children'> & {
    label?: string;
};

export function OptionalLabel({
    label,
    className,
    ...props
}: OptionalLabelProps) {
    const copy: FormCopy = useSharedComponentCopy();
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
