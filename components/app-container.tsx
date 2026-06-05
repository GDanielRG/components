import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends PropsWithChildren {
    className?: string;
}

export default function Container({
    className = '',
    children,
}: ContainerProps) {
    const combinedClassName = cn('px-4', className);

    return <div className={combinedClassName}>{children}</div>;
}
