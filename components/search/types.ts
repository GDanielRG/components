import type { ServerSearchFilter } from '@/components/types/server-search';
import type { SearchNavigationPatch } from './query-utils';
import type { SearchNavigationController } from './use-search-navigation';

export interface SearchFilterPopoverState {
    openFilterKey: string | null;
    setOpenFilterKey: (filterKey: string | null) => void;
}

export interface SearchAppliedFiltersState {
    filters: ServerSearchFilter[];
    filterValues: Record<string, string[]>;
    selectValues: Record<string, string | null>;
    navigation: SearchNavigationController;
    searchValue: string;
    clearAllPatch: SearchNavigationPatch;
}
