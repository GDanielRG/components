import type { CancelToken } from '@inertiajs/core';

// Narrow structural contract for a persisted document. The consumer's richer
// domain `Document` (an Eloquent resource) is assignable to this.
export interface Document {
    id: number;
    name: string | null;
    description: string | null;
    path: string;
    created_at: string | null;
    updated_at: string | null;
    deleted_at?: string | null;
    formatted_created_at?: string | null;
    formatted_created_at_diff?: string | null;
    formatted_updated_at?: string | null;
    formatted_updated_at_diff?: string | null;
    can_be_updated?: boolean;
    can_be_deleted?: boolean;
}

type ExistingDocumentModelFields =
    | 'id'
    | 'name'
    | 'description'
    | 'path'
    | 'created_at'
    | 'updated_at'
    | 'formatted_created_at'
    | 'formatted_created_at_diff'
    | 'formatted_updated_at'
    | 'formatted_updated_at_diff';

type NonNullableDocumentFields =
    | 'created_at'
    | 'formatted_created_at'
    | 'formatted_created_at_diff';

type WithNonNullableFields<T, K extends keyof T> = Omit<T, K> & {
    [P in K]-?: NonNullable<T[P]>;
};

export interface NewDocumentData {
    tempId: string;
    file: File;
    name?: string;
    description?: string;
}

export type ExistingDocumentData = WithNonNullableFields<
    Pick<Document, ExistingDocumentModelFields>,
    NonNullableDocumentFields
> & {
    can_be_deleted?: boolean;
    file?: File;
};

export type DocumentData = NewDocumentData | ExistingDocumentData;

export interface DocumentBatchItemErrors {
    name?: string;
    description?: string;
    file?: string;
    id?: string;
}

export type DocumentBatchStatus = 'uploading' | 'failed';

export interface DocumentUploadBatch {
    id: string;
    items: NewDocumentData[];
    status: DocumentBatchStatus;
    progress: number | null;
    loadedBytes: number;
    totalBytes: number;
    error: string | null;
    itemErrors: Record<string, DocumentBatchItemErrors>;
    cancelToken: CancelToken | null;
    canRetry: boolean;
}
