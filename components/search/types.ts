import type { ServerSearchFilter } from '@/types';
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
}
