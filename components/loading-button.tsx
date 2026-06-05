import type { LucideIcon } from 'lucide-react';
import { LoaderCircleIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type LoadingButtonProps = ComponentProps<typeof Button> & {
    processing?: boolean;
    icon?: LucideIcon;
    children: ReactNode;
};

export default function LoadingButton({
    processing = false,
    disabled,
    icon: Icon,
    children,
    ...props
}: LoadingButtonProps) {
    const showInlineIcon = children !== null && children !== undefined;

    return (
        <Button disabled={disabled || processing} {...props}>
            {processing ? (
                <LoaderCircleIcon
                    className="animate-spin"
                    data-icon={showInlineIcon ? 'inline-start' : undefined}
                />
            ) : (
                Icon && (
                    <Icon
                        data-icon={showInlineIcon ? 'inline-start' : undefined}
                    />
                )
            )}
            {children}
        </Button>
    );
}
