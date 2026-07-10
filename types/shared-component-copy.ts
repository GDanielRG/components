/**
 * Shared default copy consumed by the foundation components. The values are
 * app-owned (each repo's `@/hooks/use-shared-component-copy` provides them in
 * Spanish, English, or via i18n); the registry only ships these contracts so the
 * components can read the keys type-safely without baking in a default locale.
 *
 * The contract is split into small slices so a component depends only on the
 * keys it actually uses — a dialog needs `DialogCopy`, not the whole surface.
 * `SharedComponentCopy` composes every slice for an app that installs the full
 * foundation; a consumer that installs only one area can type its hook against
 * just that area's slice(s).
 */

export interface DialogCopy {
    dialogCancel: string;
    dialogClose: string;
    dialogDelete: string;
}

export interface FormCopy {
    optionalLabel: string;
    saveLabel: string;
}

export interface PaginationCopy {
    paginationNextLabel: string;
    paginationPreviousLabel: string;
}

export interface ActionsCopy {
    actionsLabel: string;
}

export interface ArchiveCopy {
    archiveBadgeLabel: string;
    archiveBadgeTooltip: (formattedArchivedAt: string) => string;
    archiveConfirmLabel: string;
}

export interface HistoryCopy {
    historyAriaLabel: string;
    historyBooleanFalse: string;
    historyBooleanTrue: string;
    /** Label shown while a structured field's per-leaf detail is expanded. */
    historyDetailHide: string;
    /** Trigger label to expand a structured field's per-leaf detail. */
    historyDetailShow: (count: number) => string;
    historyEmptyValue: string;
    /**
     * Per-field value overrides, keyed by field then raw value (e.g. enum or
     * boolean), so a change row can show a human label instead of the raw value.
     * Domain-specific entries live in the app-owned copy hook; empty is fine.
     */
    historyFieldValueLabels: Record<string, Record<string, string>>;
    historySystem: string;
    historyTitle: string;
    historyTooltip: string;
}

export interface TableCopy {
    columnsLabel: string;
    hideColumnLabel: string;
    sortAscendingLabel: string;
    sortDescendingLabel: string;
}

export interface CommentsCopy {
    commentsActions: string;
    commentsCancelEdit: string;
    commentsCount: (count: number) => string;
    commentsDeleteDescription: string;
    commentsDeleteTitle: string;
    commentsEdit: string;
    commentsPlaceholderCreate: string;
    commentsPlaceholderEdit: string;
    commentsSend: string;
    commentsSendHint: string;
    commentsSubmit: string;
}

export interface ActivityCopy {
    activityAddComment: string;
    activityCommentsTab: string;
    activityDocumentsTab: string;
    activityScrollToLatest: string;
    activityToggleSidebar: string;
    /**
     * Ephemeral "someone is typing" line for the comments panel. Receives the
     * display names of the users currently typing (already filtered to exclude
     * the current user); returns one concise localized line. Never receives
     * email or draft content.
     */
    commentsTyping: (names: string[]) => string;
}

export interface DocumentsCopy {
    documentsActions: string;
    documentsAdd: string;
    documentsAddDescription: string;
    documentsAddMetadata: string;
    documentsAddOne: string;
    documentsBatchTooLarge: (size: string) => string;
    documentsBatchTooLargeGeneric: string;
    documentsCancelBatch: string;
    documentsClearMetadata: string;
    documentsCloseUploadError: string;
    documentsCount: (count: number) => string;
    documentsDeleteDescription: string;
    documentsDeleteNamedDescription: (name: string) => string;
    documentsDeleteTitle: string;
    documentsDescriptionPlaceholder: string;
    documentsDiscardChanges: string;
    documentsDownload: string;
    documentsDownloadFile: string;
    documentsEditMetadata: string;
    documentsFallbackName: string;
    documentsFileError: string;
    documentsNamePlaceholder: string;
    documentsReplaceFile: string;
    documentsRetry: string;
    documentsReviewErrors: string;
    documentsTitle: string;
    documentsUploadError: string;
    documentsUploadFailed: string;
    documentsUploadProgress: (loaded: string, total: string) => string;
    documentsUploadTotal: (size: string) => string;
    documentsUploading: string;
    documentsValidationMaxSize: (size: string) => string;
    documentsViewList: string;
}

export interface ExportCopy {
    exportTitle: string;
    exportTrigger: string;
    exportSubmit: string;
    exportEmailNotice: (hasFilters: boolean) => string;
}

export interface SearchCopy {
    searchAppliedFiltersTrigger: string;
    searchClearFilter: string;
    searchClearFilters: string;
    searchClearSearch: string;
    searchClearing: string;
    searchFiltersTrigger: string;
    searchNoResults: string;
    searchPlaceholder: string;
    searchSelectedCount: (count: number) => string;
    searchSubmit: string;
}

export interface SharedComponentCopy
    extends
        DialogCopy,
        FormCopy,
        PaginationCopy,
        ActionsCopy,
        ArchiveCopy,
        HistoryCopy,
        TableCopy,
        CommentsCopy,
        ActivityCopy,
        DocumentsCopy,
        ExportCopy,
        SearchCopy {}
