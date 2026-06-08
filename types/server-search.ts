export interface ServerSearchFilterOption {
    label: string;
    value: string;
    icon?: string;
}

export type ServerSearchFilterType = 'multiselect' | 'select';

export interface ServerSearchFilter {
    key: string;
    label: string;
    /** Defaults to 'multiselect' when omitted (backward compatible). */
    type?: ServerSearchFilterType;
    options: ServerSearchFilterOption[];
}
