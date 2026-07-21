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
    /** Defaults to the nested `filter[*]` query scope. */
    scope?: ServerSearchFilterScope;
    /** Optional named icon for the trigger. */
    icon?: ServerSearchFilterIcon;
    /** Render the trigger without visible label text (label becomes aria-label). */
    hideLabel?: boolean;
}

export interface ServerSearchChoiceFilter extends ServerSearchFilterBase {
    /** Defaults to 'multiselect' when omitted (backward compatible). */
    type?: 'multiselect' | 'select';
    options: ServerSearchFilterOption[];
    /** Effective value while the URL omits this control. */
    defaultValue?: string;
}

export interface ServerSearchRangeFilter extends ServerSearchFilterBase {
    type: 'range';
    fromKey: string;
    toKey: string;
    fromLabel: string;
    toLabel: string;
    inputType: 'date' | 'number';
    applyLabel: string;
    clearLabel: string;
}

// prettier-ignore
export type ServerSearchFilter =
    | ServerSearchChoiceFilter
    | ServerSearchRangeFilter;
