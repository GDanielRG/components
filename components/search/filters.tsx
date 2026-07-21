import { useState } from 'react';
import { FacetedFilters } from '@/components/search/faceted-filters';
import { RangeFilter } from '@/components/search/range-filter';
import { SelectFilter } from '@/components/search/select-filter';
import type {
    SearchFilterPopoverState,
    SearchRangeValue,
} from '@/components/search/types';
import type {
    ServerSearchChoiceFilter,
    ServerSearchFilter,
    ServerSearchRangeFilter,
} from '@/components/types/server-search';
import { cn } from '@/lib/utils';
import { buildPathPatch } from './query-utils';
import type { SearchNavigationController } from './use-search-navigation';

interface FiltersProps {
    filters: ServerSearchFilter[];
    filterValues: Record<string, string[]>;
    selectValues?: Record<string, string | null>;
    rangeValues?: Record<string, SearchRangeValue>;
    navigation: SearchNavigationController;
    className?: string;
    mode?: 'all' | 'active' | 'inactive';
    testIdPrefix?: string;
    popoverState?: SearchFilterPopoverState;
}

export function Filters(props: FiltersProps) {
    const {
        filters,
        filterValues,
        selectValues = {},
        rangeValues = {},
        navigation,
        className,
        mode = 'all',
        testIdPrefix,
        popoverState,
    } = props;
    const [internalOpenFilterKey, setInternalOpenFilterKey] = useState<
        string | null
    >(null);
    const openFilterKey = popoverState?.openFilterKey ?? internalOpenFilterKey;
    const setOpenFilterKey =
        popoverState?.setOpenFilterKey ?? setInternalOpenFilterKey;

    const scopedFilters = filters.filter((filter) => {
        const active = (filterValues[filter.key] ?? []).length > 0;

        if (mode === 'active') {
            return active;
        }

        if (mode === 'inactive') {
            return !active;
        }

        return true;
    });

    if (scopedFilters.length === 0) {
        return null;
    }

    const multiselectFilters = scopedFilters.filter(
        (filter): filter is ServerSearchChoiceFilter =>
            (filter.type ?? 'multiselect') === 'multiselect',
    );
    const selectFilters = scopedFilters.filter(
        (filter): filter is ServerSearchChoiceFilter =>
            filter.type === 'select',
    );
    const rangeFilters = scopedFilters.filter(
        (filter): filter is ServerSearchRangeFilter => filter.type === 'range',
    );

    function handleFilterValueChange(
        filterKey: string,
        nextSelectedValues: string[],
    ): void {
        setOpenFilterKey(nextSelectedValues.length > 0 ? filterKey : null);
        navigation.visit(
            buildPathPatch(
                ['filter', filterKey],
                nextSelectedValues.length > 0 ? nextSelectedValues : null,
            ),
        );
    }

    function filterPath(filter: ServerSearchFilter): string[] {
        return filter.scope === 'query' ? [filter.key] : ['filter', filter.key];
    }

    function handleSelectChange(
        filter: ServerSearchChoiceFilter,
        value: string | null,
    ): void {
        setOpenFilterKey(null);
        navigation.visit(
            buildPathPatch(
                filterPath(filter),
                value && value !== filter.defaultValue ? value : null,
            ),
        );
    }

    function handleRangeChange(
        filter: ServerSearchRangeFilter,
        value: SearchRangeValue,
    ): void {
        setOpenFilterKey(null);
        navigation.visit({
            filter: {
                [filter.fromKey]: value.from,
                [filter.toKey]: value.to,
            },
        });
    }

    function handleFilterOpenChange(filterKey: string, open: boolean): void {
        const nextOpenFilterKey = open
            ? filterKey
            : openFilterKey === filterKey
              ? null
              : openFilterKey;

        setOpenFilterKey(nextOpenFilterKey);
    }

    // Multiselect-only (most index pages): preserve the historical markup.
    if (selectFilters.length === 0 && rangeFilters.length === 0) {
        return (
            <FacetedFilters
                filters={multiselectFilters}
                filterValues={filterValues}
                openFilterKey={openFilterKey}
                onFilterOpenChange={handleFilterOpenChange}
                onFilterValueChange={handleFilterValueChange}
                className={className}
                testIdPrefix={testIdPrefix}
            />
        );
    }

    return (
        <div className={cn('flex flex-wrap items-center gap-3', className)}>
            {multiselectFilters.length > 0 && (
                <FacetedFilters
                    filters={multiselectFilters}
                    filterValues={filterValues}
                    openFilterKey={openFilterKey}
                    onFilterOpenChange={handleFilterOpenChange}
                    onFilterValueChange={handleFilterValueChange}
                    testIdPrefix={testIdPrefix}
                />
            )}
            {selectFilters.map((filter) => (
                <SelectFilter
                    key={filter.key}
                    filter={filter}
                    value={selectValues[filter.key] ?? null}
                    open={openFilterKey === filter.key}
                    onOpenChange={(open) =>
                        handleFilterOpenChange(filter.key, open)
                    }
                    onValueChange={(value) => handleSelectChange(filter, value)}
                    testIdPrefix={testIdPrefix}
                    clearable={filter.defaultValue === undefined}
                />
            ))}
            {rangeFilters.map((filter) => (
                <RangeFilter
                    key={filter.key}
                    filter={filter}
                    value={rangeValues[filter.key] ?? { from: null, to: null }}
                    open={openFilterKey === filter.key}
                    onOpenChange={(open) =>
                        handleFilterOpenChange(filter.key, open)
                    }
                    onValueChange={(value) => handleRangeChange(filter, value)}
                    testIdPrefix={testIdPrefix}
                />
            ))}
        </div>
    );
}
