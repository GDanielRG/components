import { Columns3CogIcon, EyeClosedIcon, EyeIcon } from 'lucide-react';
import { useState } from 'react';
import type { ColumnVisibilityController } from '@/components/table/use-column-visibility';
import type { TableCopy } from '@/components/types/shared-component-copy';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

export function ColumnVisibilityMenu<Key extends string>({
    controller,
    triggerDataTest,
    itemDataTestPrefix,
    triggerLabel,
}: {
    controller: ColumnVisibilityController<Key>;
    triggerDataTest?: string;
    itemDataTestPrefix?: string;
    triggerLabel?: string;
}) {
    const [open, setOpen] = useState(false);
    const copy: TableCopy = useSharedComponentCopy();
    const resolvedTriggerLabel = triggerLabel ?? copy.columnsLabel;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
                render={
                    <Button
                        data-test={triggerDataTest}
                        variant={open ? 'secondary' : 'outline'}
                        size="icon"
                    />
                }
            >
                <Columns3CogIcon />
                <span className="sr-only">{resolvedTriggerLabel}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-fit">
                <DropdownMenuGroup>
                    {controller.columns.map((column) => {
                        const isVisible = controller.isVisible(column.key);
                        const canHide = controller.canHide(column.key);

                        return (
                            <DropdownMenuCheckboxItem
                                key={column.key}
                                data-test={
                                    itemDataTestPrefix
                                        ? `${itemDataTestPrefix}-${column.key}`
                                        : undefined
                                }
                                disabled={!canHide}
                                className={
                                    isVisible
                                        ? '[&_[data-slot=dropdown-menu-checkbox-item-indicator]]:hidden'
                                        : 'text-destructive [&_[data-slot=dropdown-menu-checkbox-item-indicator]]:hidden'
                                }
                                checked={isVisible}
                                onCheckedChange={(checked) => {
                                    controller.setVisible(
                                        column.key,
                                        !!checked,
                                    );
                                }}
                            >
                                {isVisible ? <EyeIcon /> : <EyeClosedIcon />}
                                {column.label}
                            </DropdownMenuCheckboxItem>
                        );
                    })}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
