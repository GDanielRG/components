import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function FormActions({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            data-slot="form-actions"
            className={cn('col-span-full flex justify-end', className)}
            {...props}
        />
    );
}
