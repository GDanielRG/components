// The server owns labels and localized timestamps; clients receive display-ready history.

export type EditHistoryCauser = {
    id: number;
    name: string;
    initials: string;
    action: string;
    can_be_viewed?: boolean;
};

export type EditHistoryChangeDetail = {
    label: string;
    from: unknown;
    from_label?: unknown;
    to: unknown;
    to_label?: unknown;
};

export type EditHistoryChange = {
    field: string;
    field_label?: string;
    locale: string | null;
    from: unknown;
    from_label?: unknown;
    to: unknown;
    to_label?: unknown;
    summary?: string;
    details?: EditHistoryChangeDetail[];
};

export type EditHistoryEntry = {
    id: number;
    causer: EditHistoryCauser | null;
    formatted_at: string;
    changes: EditHistoryChange[];
};
