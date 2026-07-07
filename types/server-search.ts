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
    /** Optional named icon for the trigger. Currently only 'archive'. */
    icon?: 'archive';
    /** Render the trigger without visible label text (label becomes aria-label). */
    hideLabel?: boolean;
    options: ServerSearchFilterOption[];
}
