import { useState } from 'react';
import { FacetedFilters } from '@/components/search/faceted-filters';
import { SelectFilter } from '@/components/search/select-filter';
import { cn } from '@/lib/utils';
import type { ServerSearchFilter } from '@/types';
import { buildPathPatch } from './query-utils';
import type { SearchFilterPopoverState } from './types';
import type { SearchNavigationController } from './use-search-navigation';

interface FiltersProps {
    filters: ServerSearchFilter[];
    filterValues: Record<string, string[]>;
    selectValues?: Record<string, string | null>;
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
        (filter) => (filter.type ?? 'multiselect') === 'multiselect',
    );
    const selectFilters = scopedFilters.filter(
        (filter) => filter.type === 'select',
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

    function handleSelectChange(filterKey: string, value: string | null): void {
        setOpenFilterKey(null);
        navigation.visit(
            buildPathPatch(['filter', filterKey], value ? value : null),
        );
    }

    function handleFilterOpenChange(filterKey: string, open: boolean): void {
        const nextOpenFilterKey = open
            ? filterKey
            : openFilterKey === filterKey
              ? null
              : openFilterKey;

        setOpenFilterKey(nextOpenFilterKey);
    }

    // Multiselect-only (every index page): render FacetedFilters directly so the
    // markup is byte-identical to before the select-filter addition.
    if (selectFilters.length === 0) {
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
                    onValueChange={(value) =>
                        handleSelectChange(filter.key, value)
                    }
                    testIdPrefix={testIdPrefix}
                />
            ))}
        </div>
    );
}
