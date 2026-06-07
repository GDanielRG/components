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

export interface ActionsCopy {
    actionsLabel: string;
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
    searchClearFilter: string;
    searchClearFilters: string;
    searchClearSearch: string;
    searchClearing: string;
    searchNoResults: string;
    searchPlaceholder: string;
    searchSelectedCount: (count: number) => string;
}

export interface SharedComponentCopy
    extends
        DialogCopy,
        FormCopy,
        ActionsCopy,
        TableCopy,
        CommentsCopy,
        ActivityCopy,
        DocumentsCopy,
        ExportCopy,
        SearchCopy {}
