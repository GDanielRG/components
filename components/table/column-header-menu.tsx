import {
    ArrowDown10Icon,
    ArrowDownZAIcon,
    ArrowUp01Icon,
    ArrowUpAZIcon,
    CheckIcon,
    ChevronsUpDownIcon,
    EyeClosedIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SortOrder = 'asc' | 'desc';
type SortType = 'text' | 'numeric';

export default function ColumnHeaderMenu({
    title,
    onHide,
    canHide = true,
    sortKey,
    sortType = 'text',
    currentSort,
    currentOrder,
    onSort,
    ascendingLabel = 'Ascendente',
    descendingLabel = 'Descendente',
    hideColumnLabel = 'Ocultar columna',
}: {
    title: string;
    onHide: () => void;
    canHide?: boolean;
    sortKey?: string;
    sortType?: SortType;
    currentSort?: string | null;
    currentOrder?: SortOrder | null;
    onSort?: (key: string, order: SortOrder) => void;
    ascendingLabel?: string;
    descendingLabel?: string;
    hideColumnLabel?: string;
}) {
    const [open, setOpen] = useState(false);

    const isSortable = sortKey !== undefined && onSort !== undefined;
    const isActiveAsc =
        isSortable && currentSort === sortKey && currentOrder === 'asc';
    const isActiveDesc =
        isSortable && currentSort === sortKey && currentOrder === 'desc';
    const isActiveSorted = isActiveAsc || isActiveDesc;

    const AscIcon = sortType === 'numeric' ? ArrowUp01Icon : ArrowUpAZIcon;
    const DescIcon = sortType === 'numeric' ? ArrowDown10Icon : ArrowDownZAIcon;
    const HeaderIcon = isActiveAsc
        ? AscIcon
        : isActiveDesc
          ? DescIcon
          : ChevronsUpDownIcon;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant={open || isActiveSorted ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-2"
                    />
                }
            >
                <span>{title}</span>
                <HeaderIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
                {isSortable && (
                    <>
                        <DropdownMenuItem
                            onClick={() => onSort(sortKey, 'asc')}
                        >
                            <AscIcon />
                            {ascendingLabel}
                            {isActiveAsc && <CheckIcon className="ml-auto" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onSort(sortKey, 'desc')}
                        >
                            <DescIcon />
                            {descendingLabel}
                            {isActiveDesc && <CheckIcon className="ml-auto" />}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}
                <DropdownMenuItem
                    variant="destructive"
                    disabled={!canHide}
                    onClick={onHide}
                >
                    <EyeClosedIcon />
                    {hideColumnLabel}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
