import { usePage } from '@inertiajs/react';
import { FunnelPlusIcon, SearchIcon } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode, SubmitEventHandler } from 'react';
import { ExportDialog } from '@/components/export-dialog';
import { Filters } from '@/components/search/filters';
import {
    buildClearAllPatch,
    getQueryValue,
    getQueryValues,
    parseCurrentQuery,
    resolveCurrentSearch,
} from '@/components/search/query-utils';
import type { SearchClearControl } from '@/components/search/query-utils';
import { SearchAppliedFiltersDisclosure } from '@/components/search/search-applied-filters';
import type {
    SearchAppliedFiltersState,
    SearchFilterPopoverState,
} from '@/components/search/types';
import { useSearchNavigation } from '@/components/search/use-search-navigation';
import type { SearchNavigationController } from '@/components/search/use-search-navigation';
import type { ServerSearchFilter } from '@/components/types/server-search';
import type { SearchCopy } from '@/components/types/shared-component-copy';
import type { RouteFn, RouteMutationFn } from '@/components/types/wayfinder';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';

export interface UseSearchReturn extends SearchNavigationController {
    routeFn: RouteFn;
    filters: ServerSearchFilter[];
    initialSearch: string;
    filterValues: Record<string, string[]>;
    selectValues: Record<string, string | null>;
    hasActiveFilters: boolean;
    appliedFilters: SearchAppliedFiltersState;
    filterPopoverState: SearchFilterPopoverState;
}

export interface UseSearchOptions {
    viewControls?: SearchClearControl[];
}

export function useSearch(
    routeFn: RouteFn,
    filters: ServerSearchFilter[] = [],
    options: UseSearchOptions = {},
): UseSearchReturn {
    const { url } = usePage();

    const queryString = resolveCurrentSearch(url);
    const currentQuery = parseCurrentQuery(queryString);

    const filterValues: Record<string, string[]> = {};
    const selectValues: Record<string, string | null> = {};

    for (const filter of filters) {
        // Multiselect and select both populate filterValues (a scalar parses
        // to a 1-element array).
        const values = getQueryValues(currentQuery, ['filter', filter.key]);

        filterValues[filter.key] = values;

        if (filter.type === 'select') {
            selectValues[filter.key] = values[0] ?? null;
        }
    }

    const initialSearch =
        getQueryValue(currentQuery, ['filter', 'search']) ?? '';
    const hasActiveFilterValues = Object.values(filterValues).some(
        (values) => values.length > 0,
    );
    const navigation = useSearchNavigation(routeFn);
    const [activeFilterPopoverKey, setActiveFilterPopoverKey] = useState<
        string | null
    >(null);
    const filterPopoverState: SearchFilterPopoverState = {
        openFilterKey: activeFilterPopoverKey,
        setOpenFilterKey: setActiveFilterPopoverKey,
    };

    return {
        ...navigation,
        routeFn,
        filters,
        initialSearch,
        filterValues,
        selectValues,
        hasActiveFilters: hasActiveFilterValues || initialSearch.length > 0,
        appliedFilters: {
            filters,
            filterValues,
            selectValues,
            navigation,
            searchValue: initialSearch,
            clearAllPatch: buildClearAllPatch(filters, options.viewControls),
        },
        filterPopoverState,
    };
}

export function SearchControls({
    search,
    placeholder,
    className,
}: {
    search: UseSearchReturn;
    placeholder?: string;
    className?: string;
}) {
    const copy: SearchCopy = useSharedComponentCopy();
    const [filtersAreDisclosed, setFiltersAreDisclosed] = useState(false);
    const hasInactiveFilters = search.filters.some(
        (filter) => (search.filterValues[filter.key] ?? []).length === 0,
    );
    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const submittedSearch = formData.get('search');

        search.visit({
            filter: {
                search:
                    typeof submittedSearch === 'string'
                        ? submittedSearch
                        : null,
            },
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn('flex flex-wrap items-center gap-3', className)}
        >
            <ButtonGroup className="w-full sm:w-min sm:min-w-xs">
                <Input
                    key={search.initialSearch}
                    type="search"
                    name="search"
                    placeholder={placeholder ?? copy.searchPlaceholder}
                    defaultValue={search.initialSearch}
                    data-test="search-input"
                />
                <Button
                    data-test="search-button"
                    type="submit"
                    variant="outline"
                >
                    <SearchIcon />
                </Button>
            </ButtonGroup>

            {hasInactiveFilters && !filtersAreDisclosed && (
                <Button
                    data-test="search-filters-disclosure-trigger"
                    type="button"
                    variant="outline"
                    onClick={() => setFiltersAreDisclosed(true)}
                >
                    <FunnelPlusIcon data-icon="inline-start" />
                    {copy.searchFiltersTrigger}
                </Button>
            )}

            {filtersAreDisclosed && (
                <Filters
                    filters={search.filters}
                    filterValues={search.filterValues}
                    selectValues={search.selectValues}
                    navigation={search}
                    mode="inactive"
                    popoverState={search.filterPopoverState}
                />
            )}
        </form>
    );
}

export function SearchResults({
    search,
    resultsMessage,
    exportAction,
    exportTitle,
    toolbar,
    testIdPrefix,
    children,
}: {
    search: UseSearchReturn;
    resultsMessage: string;
    exportAction?: RouteMutationFn;
    exportTitle?: string;
    toolbar?: ReactNode;
    testIdPrefix?: string;
    children?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <p className="line-clamp-2 min-w-0 flex-1 text-xs leading-none text-muted-foreground">
                    {resultsMessage}
                </p>
                {(toolbar || exportAction) && (
                    <ButtonGroup className="shrink-0">
                        {exportAction && (
                            <ExportDialog
                                exportAction={exportAction}
                                search={search}
                                title={exportTitle}
                            />
                        )}
                        {toolbar}
                    </ButtonGroup>
                )}
            </div>
            {children ?? (
                <SearchAppliedFiltersDisclosure
                    appliedFilters={search.appliedFilters}
                    popoverState={search.filterPopoverState}
                    testIdPrefix={testIdPrefix}
                />
            )}
        </div>
    );
}
