import { SaveIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { LoadingButton } from '@/components/loading-button';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';
import type { FormCopy } from '../types/shared-component-copy';

type SaveButtonProps = Omit<
    ComponentProps<typeof LoadingButton>,
    'children' | 'icon'
> & {
    label?: string;
    children?: ComponentProps<typeof LoadingButton>['children'];
};

export function SaveButton({
    label,
    children,
    className,
    ...props
}: SaveButtonProps) {
    const copy: FormCopy = useSharedComponentCopy();

    return (
        <LoadingButton
            type="submit"
            icon={SaveIcon}
            data-test="save-button"
            className={cn('max-sm:w-full', className)}
            {...props}
        >
            {children ?? label ?? copy.saveLabel}
        </LoadingButton>
    );
}
