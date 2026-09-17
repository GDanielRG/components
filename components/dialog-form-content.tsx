import type { ComponentProps } from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type DialogFormContentProps = Omit<
    ComponentProps<typeof DialogContent>,
    'className' | 'showCloseButton'
> & { className?: string };

export function DialogFormContent({
    className,
    ...props
}: DialogFormContentProps) {
    return (
        <DialogContent
            {...props}
            showCloseButton={false}
            // oxlint-disable-next-line shadcn/require-static-classes -- Consumers choose width; this composition owns the viewport and section padding.
            className={cn(
                'flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0',
                className,
            )}
        />
    );
}
