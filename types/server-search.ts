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
    /**
     * Effective value while the URL omits this control. Server catalogues may
     * serialize an absent default as `null`.
     */
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
    /**
     * How the range is edited. Omitted (default) keeps the paired from/to
     * inputs. `'slider'` renders a two-thumb range slider and requires numeric
     * `min` and `max`. Date ranges (`inputType: 'date'`) render a calendar
     * range picker regardless of this field.
     */
    control?: 'slider';
    /** Optional prefix for slider value labels (e.g. `'$'`). */
    valuePrefix?: string;
    applyLabel: string;
    clearLabel: string;
}

// prettier-ignore
export type ServerSearchFilter =
    | ServerSearchChoiceFilter
    | ServerSearchRangeFilter;
