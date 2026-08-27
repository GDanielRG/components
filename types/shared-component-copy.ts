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
    historyDetailHide: string;
    historyDetailShow: (count: number) => string;
    historyEmptyValue: string;
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
    /** Receives display names only; never email addresses or draft content. */
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
