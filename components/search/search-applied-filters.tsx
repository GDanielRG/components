import { Link } from '@inertiajs/react';
import { FunnelXIcon, LoaderCircle, SearchIcon } from 'lucide-react';
import { ActionsDropdownMenu } from '@/components/actions-dropdown-menu';
import { Filters } from '@/components/search/filters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';
import type { SearchCopy } from '../../types/shared-component-copy';
import { buildPathPatch, clearedFilterValues } from './query-utils';
import type { SearchNavigationPatch } from './query-utils';
import type {
    SearchAppliedFiltersState,
    SearchFilterPopoverState,
} from './types';

type SearchAppliedFiltersProps = {
    appliedFilters: SearchAppliedFiltersState;
    popoverState?: SearchFilterPopoverState;
    className?: string;
    filtersClassName?: string;
    testIdPrefix?: string;
};

function resolveTestId(base: string, prefix?: string): string {
    return prefix ? `${prefix}-${base}` : base;
}

export function SearchAppliedFilters(props: SearchAppliedFiltersProps) {
    const copy: SearchCopy = useSharedComponentCopy();
    const {
        appliedFilters,
        popoverState,
        className,
        filtersClassName,
        testIdPrefix,
    } = props;
    const { filters, filterValues, selectValues, navigation, searchValue } =
        appliedFilters;

    const hasActiveFacetedFilters = filters.some(
        (filter) => (filterValues[filter.key] ?? []).length > 0,
    );
    const hasSearch = !!searchValue.trim();

    if (!hasActiveFacetedFilters && !hasSearch) {
        return null;
    }

    const clearSearchRoute = navigation.buildRoute(
        buildPathPatch(['filter', 'search'], null),
    );
    const clearAllRoute = navigation.buildRoute({
        filter: {
            search: null,
            ...filters.reduce<SearchNavigationPatch>(
                (values, filter) => ({
                    ...values,
                    ...clearedFilterValues(filter),
                }),
                {},
            ),
        },
    });

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            {hasSearch && (
                <ActionsDropdownMenu
                    contentClassName="w-fit"
                    trigger={(open) => (
                        <Button
                            data-test={resolveTestId(
                                'clear-search-trigger',
                                testIdPrefix,
                            )}
                            variant={open ? 'secondary' : 'outline'}
                            className="max-w-full justify-start"
                        >
                            <SearchIcon />
                            <Separator
                                orientation="vertical"
                                className="h-full w-px"
                            />
                            <Badge
                                variant="secondary"
                                className="max-w-64 rounded-sm px-1 font-normal"
                            >
                                <span className="truncate">{searchValue}</span>
                            </Badge>
                        </Button>
                    )}
                >
                    <DropdownMenuItem
                        data-test={resolveTestId(
                            'clear-search-action',
                            testIdPrefix,
                        )}
                        variant="destructive"
                        render={
                            <Link
                                href={clearSearchRoute}
                                replace
                                preserveState
                                preserveScroll
                            />
                        }
                    >
                        <SearchIcon className="group-data-[loading]/dropdown-menu-item:hidden" />
                        <LoaderCircle className="hidden animate-spin group-data-[loading]/dropdown-menu-item:block" />
                        <span className="group-data-[loading]/dropdown-menu-item:hidden">
                            {copy.searchClearSearch}
                        </span>
                        <span className="hidden group-data-[loading]/dropdown-menu-item:inline">
                            {copy.searchClearing}
                        </span>
                    </DropdownMenuItem>
                </ActionsDropdownMenu>
            )}

            <Filters
                filters={filters}
                filterValues={filterValues}
                selectValues={selectValues}
                navigation={navigation}
                mode="active"
                className={filtersClassName}
                testIdPrefix={testIdPrefix}
                popoverState={popoverState}
            />

            <ActionsDropdownMenu
                trigger={(open) => (
                    <Button
                        data-test={resolveTestId(
                            'clear-filters-trigger',
                            testIdPrefix,
                        )}
                        variant={open ? 'secondary' : 'destructive'}
                        size="icon"
                    >
                        <FunnelXIcon />
                    </Button>
                )}
            >
                <DropdownMenuItem
                    data-test={resolveTestId(
                        'clear-filters-action',
                        testIdPrefix,
                    )}
                    variant="destructive"
                    render={
                        <Link
                            href={clearAllRoute}
                            replace
                            preserveState
                            preserveScroll
                            onClick={() => popoverState?.setOpenFilterKey(null)}
                        />
                    }
                >
                    <FunnelXIcon className="group-data-[loading]/dropdown-menu-item:hidden" />
                    <LoaderCircle className="hidden animate-spin group-data-[loading]/dropdown-menu-item:block" />
                    <span className="group-data-[loading]/dropdown-menu-item:hidden">
                        {copy.searchClearFilters}
                    </span>
                    <span className="hidden group-data-[loading]/dropdown-menu-item:inline">
                        {copy.searchClearing}
                    </span>
                </DropdownMenuItem>
            </ActionsDropdownMenu>
        </div>
    );
}
