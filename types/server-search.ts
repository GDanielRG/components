export interface ServerSearchFilterOption {
    label: string;
    value: string;
    icon?: string;
}

export type ServerSearchFilterType = 'multiselect' | 'select' | 'range';

export type ServerSearchFilterScope = 'filter' | 'query';
export type ServerSearchFilterIcon = 'archive' | 'featured' | 'sort';

interface ServerSearchFilterBase {
    key: string;
    label: string;
    /** Omitted means the nested `filter[*]` scope. */
    scope?: ServerSearchFilterScope;
    icon?: ServerSearchFilterIcon;
    hideLabel?: boolean;
}

export interface ServerSearchChoiceFilter extends ServerSearchFilterBase {
    /** Omitted means `multiselect`. */
    type?: 'multiselect' | 'select';
    options: ServerSearchFilterOption[];
    /** Effective value while the URL omits this control. */
    defaultValue?: string | null;
}

export interface ServerSearchRangeFilter extends ServerSearchFilterBase {
    type: 'range';
    fromKey: string;
    toKey: string;
    fromLabel: string;
    toLabel: string;
    inputType: 'date' | 'number';
    inputMode?: 'decimal' | 'numeric';
    step?: string | number;
    min?: string | number;
    max?: string | number;
    /** Omitted uses paired inputs; `slider` requires numeric min and max. */
    control?: 'slider';
    valuePrefix?: string;
    applyLabel: string;
    clearLabel: string;
}

// prettier-ignore
export type ServerSearchFilter =
    | ServerSearchChoiceFilter
    | ServerSearchRangeFilter;
