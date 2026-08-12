import { shouldIntercept } from '@inertiajs/core';
import {
    FunnelIcon,
    FunnelXIcon,
    LoaderCircle,
    SearchIcon,
} from 'lucide-react';
import { useState } from 'react';
import type { MouseEvent } from 'react';
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
    const [isClearing, setIsClearing] = useState(false);
    const clearAllRoute = appliedFilters.navigation.buildRoute(
        appliedFilters.clearAllPatch,
    );

    function clearAll(event: MouseEvent<Element>): void {
        popoverState?.setOpenFilterKey(null);

        if (!shouldIntercept(event)) {
            return;
        }

        event.preventDefault();
        setIsClearing(true);
        appliedFilters.navigation.visit(appliedFilters.clearAllPatch, {
            onFinish: () => setIsClearing(false),
        });
    }

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
                    aria-label={copy.searchClearFilters}
                >
                    <FunnelXIcon />
                </Button>
            )}
        >
            <DropdownMenuItem
                data-test={resolveTestId('clear-filters-action', testIdPrefix)}
                variant="destructive"
                render={<a href={clearAllRoute.url} />}
                onClick={clearAll}
            >
                {isClearing ? (
                    <>
                        <LoaderCircle className="animate-spin" />
                        <span>{copy.searchClearing}</span>
                    </>
                ) : (
                    <>
                        <FunnelXIcon />
                        <span>{copy.searchClearFilters}</span>
                    </>
                )}
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
    const {
        filters,
        filterValues,
        selectValues,
        rangeValues,
        navigation,
        searchValue,
    } = appliedFilters;

    const appliedFilterCount = getAppliedFilterCount(appliedFilters);
    const hasSearch = !!searchValue.trim();
    const [isClearingSearch, setIsClearingSearch] = useState(false);

    if (appliedFilterCount === 0) {
        return null;
    }

    const clearSearchPatch = buildPathPatch(['filter', 'search'], null);
    const clearSearchRoute = navigation.buildRoute(clearSearchPatch);

    function clearSearch(event: MouseEvent<Element>): void {
        if (!shouldIntercept(event)) {
            return;
        }

        event.preventDefault();
        setIsClearingSearch(true);
        navigation.visit(clearSearchPatch, {
            onFinish: () => setIsClearingSearch(false),
        });
    }

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
                        render={<a href={clearSearchRoute.url} />}
                        onClick={clearSearch}
                    >
                        {isClearingSearch ? (
                            <>
                                <LoaderCircle className="animate-spin" />
                                <span>{copy.searchClearing}</span>
                            </>
                        ) : (
                            <>
                                <SearchIcon />
                                <span>{copy.searchClearSearch}</span>
                            </>
                        )}
                    </DropdownMenuItem>
                </ActionsDropdownMenu>
            )}

            <Filters
                filters={filters}
                filterValues={filterValues}
                selectValues={selectValues}
                rangeValues={rangeValues}
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
        (popoverState?.openFilterKey ?? null) !== null
    ) {
        return (
            <div className="transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none starting:-translate-y-1 starting:opacity-0">
                <SearchAppliedFilters
                    appliedFilters={appliedFilters}
                    popoverState={popoverState}
                    className={className}
                    filtersClassName={filtersClassName}
                    testIdPrefix={testIdPrefix}
                />
            </div>
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
