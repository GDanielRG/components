import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Container({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            data-slot="app-container"
            className={cn('px-4', className)}
            {...props}
        />
    );
}
