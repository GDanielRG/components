import { MoreHorizontalIcon } from 'lucide-react';
import { useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function ActionsDropdownMenu({
    children,
    trigger,
    triggerLabel = 'Acciones',
    align = 'start',
    contentClassName,
}: {
    children: ReactNode;
    trigger?: ReactElement | ((open: boolean) => ReactElement);
    triggerLabel?: string;
    align?: 'start' | 'center' | 'end';
    contentClassName?: string;
}) {
    const [open, setOpen] = useState(false);

    const triggerElement =
        typeof trigger === 'function'
            ? trigger(open)
            : (trigger ?? (
                  <Button
                      variant={open ? 'secondary' : 'outline'}
                      size="icon-lg"
                      data-test="actions-menu-trigger"
                  >
                      <MoreHorizontalIcon />
                      <span className="sr-only">{triggerLabel}</span>
                  </Button>
              ));

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger render={triggerElement} />
            <DropdownMenuContent
                align={align}
                className={cn('w-fit', contentClassName)}
            >
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
