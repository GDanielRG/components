import { Link } from '@inertiajs/react';
import {
    FunnelIcon,
    FunnelXIcon,
    LoaderCircle,
    SearchIcon,
} from 'lucide-react';
import { useState } from 'react';
import { ActionsDropdownMenu } from '@/components/actions-dropdown-menu';
import { Filters } from '@/components/search/filters';
import type {
    SearchAppliedFiltersState,
    SearchFilterPopoverState,
} from '@/components/search/types';
import type { SearchCopy } from '@/components/types/shared-component-copy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';
import { buildPathPatch } from './query-utils';

export type SearchAppliedFiltersProps = {
    appliedFilters: SearchAppliedFiltersState;
    popoverState?: SearchFilterPopoverState;
    className?: string;
    filtersClassName?: string;
    testIdPrefix?: string;
};

const APPLIED_FILTERS_DISCLOSURE_THRESHOLD = 3;

function resolveTestId(base: string, prefix?: string): string {
    return prefix ? `${prefix}-${base}` : base;
}

function getAppliedFilterCount({
    filters,
    filterValues,
    searchValue,
}: SearchAppliedFiltersState): number {
    return (
        filters.filter((filter) => (filterValues[filter.key] ?? []).length > 0)
            .length + (searchValue.trim() ? 1 : 0)
    );
}

function SearchClearFiltersAction({
    appliedFilters,
    popoverState,
    testIdPrefix,
}: Pick<
    SearchAppliedFiltersProps,
    'appliedFilters' | 'popoverState' | 'testIdPrefix'
>) {
    const copy: SearchCopy = useSharedComponentCopy();
    const clearAllRoute = appliedFilters.navigation.buildRoute(
        appliedFilters.clearAllPatch,
    );

    return (
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
                data-test={resolveTestId('clear-filters-action', testIdPrefix)}
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
    );
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

    const appliedFilterCount = getAppliedFilterCount(appliedFilters);
    const hasSearch = !!searchValue.trim();

    if (appliedFilterCount === 0) {
        return null;
    }

    const clearSearchRoute = navigation.buildRoute(
        buildPathPatch(['filter', 'search'], null),
    );
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

            <SearchClearFiltersAction
                appliedFilters={appliedFilters}
                popoverState={popoverState}
                testIdPrefix={testIdPrefix}
            />
        </div>
    );
}

export function SearchAppliedFiltersDisclosure({
    appliedFilters,
    popoverState,
    className,
    filtersClassName,
    testIdPrefix,
}: SearchAppliedFiltersProps) {
    const copy: SearchCopy = useSharedComponentCopy();
    const [isRevealed, setIsRevealed] = useState(false);
    const appliedFilterCount = getAppliedFilterCount(appliedFilters);

    if (appliedFilterCount === 0) {
        return null;
    }

    if (
        appliedFilterCount < APPLIED_FILTERS_DISCLOSURE_THRESHOLD ||
        isRevealed ||
        popoverState?.openFilterKey !== null
    ) {
        return (
            <SearchAppliedFilters
                appliedFilters={appliedFilters}
                popoverState={popoverState}
                className={className}
                filtersClassName={filtersClassName}
                testIdPrefix={testIdPrefix}
            />
        );
    }

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            <Button
                data-test={resolveTestId(
                    'applied-filters-disclosure-trigger',
                    testIdPrefix,
                )}
                type="button"
                variant="outline"
                onClick={() => setIsRevealed(true)}
            >
                <FunnelIcon data-icon="inline-start" />
                {copy.searchAppliedFiltersTrigger}
                <Badge variant="secondary">{appliedFilterCount}</Badge>
            </Button>
            <SearchClearFiltersAction
                appliedFilters={appliedFilters}
                popoverState={popoverState}
                testIdPrefix={testIdPrefix}
            />
        </div>
    );
}
