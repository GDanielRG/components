import { MoreHorizontalIcon } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { ActionsDropdownMenu } from '@/components/actions-dropdown-menu';
import type { ActionsCopy } from '@/components/types/shared-component-copy';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

type RowActionsProps = {
    children: ReactNode;
    dataTestPrefix?: string;
    trigger?: ReactElement | ((open: boolean) => ReactElement);
    triggerLabel?: string;
};

export function RowActions({
    children,
    dataTestPrefix,
    trigger,
    triggerLabel,
}: RowActionsProps) {
    const copy: ActionsCopy = useSharedComponentCopy();
    const resolvedTriggerLabel = triggerLabel ?? copy.actionsLabel;

    return (
        <TableCell>
            <ActionsDropdownMenu
                align="end"
                trigger={
                    trigger ??
                    ((open) => (
                        <Button
                            variant={open ? 'secondary' : 'outline'}
                            size="icon"
                            data-test={
                                dataTestPrefix
                                    ? `${dataTestPrefix}-actions`
                                    : undefined
                            }
                        >
                            <MoreHorizontalIcon />
                            <span className="sr-only">
                                {resolvedTriggerLabel}
                            </span>
                        </Button>
                    ))
                }
            >
                {children}
            </ActionsDropdownMenu>
        </TableCell>
    );
}
