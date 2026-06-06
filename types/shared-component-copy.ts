/**
 * Shared default copy consumed by the foundation components. The values are
 * app-owned (each repo's `@/hooks/use-shared-component-copy` provides them in
 * Spanish, English, or via i18n); the registry only ships this contract so the
 * components can read the keys type-safely without baking in a default locale.
 */
export interface SharedComponentCopy {
    actionsLabel: string;
    columnsLabel: string;
    dialogCancel: string;
    dialogDelete: string;
    hideColumnLabel: string;
    optionalLabel: string;
    saveLabel: string;
    sortAscendingLabel: string;
    sortDescendingLabel: string;
}
