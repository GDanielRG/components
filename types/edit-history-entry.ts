// Edit-history contract shared by the registry `EditHistoryPopover`.
//
// The server emits a labeled, pre-formatted timeline: every timestamp arrives as
// `formatted_at` (no client date formatting — see the fleet datetime canon), and
// enum-like values may carry a `*_label` twin. Structured fields (repeaters /
// matrices) additionally emit a `summary` headline plus expandable `details`;
// scalar fields omit both and render as a from→to diff.

export type EditHistoryCauser = {
    id: number;
    name: string;
    initials: string;
    action: string;
    /**
     * Whether the current viewer may open the causer's detail page. When false
     * (or when no `employeeHref` seam is provided) the name renders as plain
     * text instead of a link.
     */
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
    /**
     * Human field name. Present when the producer labels its fields (e.g.
     * field-sheet histories with many fields per row); absent for single-field
     * model histories, which render unchanged.
     */
    field_label?: string;
    locale: string | null;
    from: unknown;
    from_label?: unknown;
    to: unknown;
    to_label?: unknown;
    /**
     * Pre-rendered headline for a structured field (repeater/matrix). Its
     * presence is the signal to render the summary + expandable `details`
     * instead of a scalar from→to diff.
     */
    summary?: string;
    /** Expandable per-leaf changes for a structured field. */
    details?: EditHistoryChangeDetail[];
};

export type EditHistoryEntry = {
    id: number;
    causer: EditHistoryCauser | null;
    formatted_at: string;
    changes: EditHistoryChange[];
};
