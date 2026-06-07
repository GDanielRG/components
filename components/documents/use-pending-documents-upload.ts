import type { CancelToken, Progress } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type {
    DocumentBatchItemErrors,
    DocumentUploadBatch,
    NewDocumentData,
} from '@/components/documents/types';
import {
    generateTempId,
    getDocumentFileSizeError,
} from '@/components/documents/utils';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import type { RouteDefinition } from '@/types/wayfinder';
import type { DocumentsCopy } from '../../types/shared-component-copy';

type ValidationErrors = Record<string, string | string[]>;
type DocumentBatchItemErrorField = keyof DocumentBatchItemErrors;

const documentBatchFieldPattern =
    /^documents\.(\d+)(?:\.(name|description|file|id))?$/;

const toSimpleValidationErrors = (
    errors: ValidationErrors,
): Record<string, string> => {
    return Object.fromEntries(
        Object.entries(errors).map(([field, value]) => [
            field,
            Array.isArray(value) ? value[0] : value,
        ]),
    );
};

const mapNewDocument = (file: File): NewDocumentData => {
    return {
        tempId: generateTempId(),
        file,
        name: '',
        description: '',
    };
};

const buildCreatePayload = (
    documents: NewDocumentData[],
): {
    documents: Array<{
        file: File;
        name?: string;
        description?: string;
    }>;
} => ({
    documents: documents.map((document) => ({
        file: document.file,
        name: document.name?.trim() || undefined,
        description: document.description?.trim() || undefined,
    })),
});

const getBatchTotalBytes = (documents: NewDocumentData[]): number => {
    return documents.reduce((total, document) => total + document.file.size, 0);
};

const createFailedBatch = (
    batch: DocumentUploadBatch,
    error: string | null,
    itemErrors: Record<string, DocumentBatchItemErrors> = {},
    canRetry = true,
): DocumentUploadBatch => {
    return {
        ...batch,
        status: 'failed',
        progress: null,
        loadedBytes: 0,
        error,
        itemErrors,
        cancelToken: null,
        canRetry,
    };
};

interface UsePendingDocumentsUploadProps {
    maxDocumentKilobytes: number;
    storeAction: RouteDefinition<'post'>;
}

export function usePendingDocumentsUpload({
    maxDocumentKilobytes,
    storeAction,
}: UsePendingDocumentsUploadProps) {
    const copy: DocumentsCopy = useSharedComponentCopy();
    const [documentBatch, setDocumentBatch] =
        useState<DocumentUploadBatch | null>(null);
    const activeBatchIdRef = useRef<string | null>(null);
    const itemErrorsMessage = copy.documentsReviewErrors;
    const localSizeErrorMessage = copy.documentsBatchTooLargeGeneric;

    const updateBatchIfCurrent = (
        batchId: string,
        updater: (batch: DocumentUploadBatch) => DocumentUploadBatch | null,
    ) => {
        setDocumentBatch((currentBatch) => {
            if (!currentBatch || currentBatch.id !== batchId) {
                return currentBatch;
            }

            return updater(currentBatch);
        });
    };

    const clearBatch = (batchId?: string) => {
        setDocumentBatch((currentBatch) => {
            if (!currentBatch) {
                return null;
            }

            if (batchId && currentBatch.id !== batchId) {
                return currentBatch;
            }

            return null;
        });

        if (!batchId || activeBatchIdRef.current === batchId) {
            activeBatchIdRef.current = null;
        }
    };

    const updateBatchProgress = (
        batchId: string,
        progress: Progress | undefined,
    ) => {
        if (!progress) {
            return;
        }

        updateBatchIfCurrent(batchId, (currentBatch) => ({
            ...currentBatch,
            progress:
                progress.percentage ??
                progress.progress ??
                currentBatch.progress,
            loadedBytes: progress.loaded,
            totalBytes: progress.total ?? currentBatch.totalBytes,
        }));
    };

    const markBatchFailed = (
        batchId: string,
        error: string | null,
        itemErrors: Record<string, DocumentBatchItemErrors> = {},
        canRetry = true,
    ) => {
        updateBatchIfCurrent(batchId, (currentBatch) =>
            createFailedBatch(currentBatch, error, itemErrors, canRetry),
        );
    };

    const getLocalItemErrors = (
        batch: DocumentUploadBatch,
    ): Record<string, DocumentBatchItemErrors> => {
        return batch.items.reduce<Record<string, DocumentBatchItemErrors>>(
            (errors, item) => {
                const fileError = getDocumentFileSizeError(
                    item.file,
                    maxDocumentKilobytes,
                    copy.documentsValidationMaxSize,
                );

                if (!fileError) {
                    return errors;
                }

                errors[item.tempId] = {
                    file: fileError,
                };

                return errors;
            },
            {},
        );
    };

    const uploadDocumentBatch = (batch: DocumentUploadBatch) => {
        const localItemErrors = getLocalItemErrors(batch);

        if (Object.keys(localItemErrors).length > 0) {
            setDocumentBatch(
                createFailedBatch(
                    batch,
                    localSizeErrorMessage,
                    localItemErrors,
                    false,
                ),
            );
            activeBatchIdRef.current = null;

            return;
        }

        const payload = buildCreatePayload(batch.items);
        const transportErrorMessage = copy.documentsUploadFailed;

        activeBatchIdRef.current = batch.id;

        updateBatchIfCurrent(batch.id, (currentBatch) => ({
            ...currentBatch,
            status: 'uploading',
            progress: 0,
            loadedBytes: 0,
            error: null,
            itemErrors: {},
            cancelToken: null,
            canRetry: true,
        }));

        router.post(storeAction, payload, {
            preserveScroll: true,
            forceFormData: true,
            onCancelToken: (cancelToken: CancelToken) => {
                updateBatchIfCurrent(batch.id, (currentBatch) => ({
                    ...currentBatch,
                    cancelToken,
                }));
            },
            onProgress: (progress) => {
                updateBatchProgress(batch.id, progress);
            },
            onSuccess: () => {
                clearBatch(batch.id);
            },
            onError: (errors) => {
                const simpleErrors = toSimpleValidationErrors(
                    (errors as ValidationErrors) ?? {},
                );
                const nextItemErrors: Record<string, DocumentBatchItemErrors> =
                    {};
                let nextBatchError: string | null = null;

                Object.entries(simpleErrors).forEach(([field, message]) => {
                    const matches = field.match(documentBatchFieldPattern);

                    if (!matches) {
                        if (field === 'documents' && !nextBatchError) {
                            nextBatchError = message;
                        }

                        return;
                    }

                    const document = batch.items[Number(matches[1])];

                    if (!document) {
                        return;
                    }

                    const errorField = (matches[2] ??
                        'id') as DocumentBatchItemErrorField;

                    nextItemErrors[document.tempId] = {
                        ...nextItemErrors[document.tempId],
                        [errorField]: message,
                    };
                });

                markBatchFailed(
                    batch.id,
                    nextBatchError ??
                        (Object.keys(nextItemErrors).length > 0
                            ? itemErrorsMessage
                            : null),
                    nextItemErrors,
                );
            },
            onCancel: () => {
                clearBatch(batch.id);
            },
            onHttpException: () => {
                markBatchFailed(batch.id, transportErrorMessage);

                return false;
            },
            onNetworkError: () => {
                markBatchFailed(batch.id, transportErrorMessage);

                return false;
            },
            onFinish: () => {
                updateBatchIfCurrent(batch.id, (currentBatch) => ({
                    ...currentBatch,
                    cancelToken: null,
                }));

                if (activeBatchIdRef.current === batch.id) {
                    activeBatchIdRef.current = null;
                }
            },
        });
    };

    const handleFilesChanged = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        if (files.length === 0) {
            return;
        }

        const items = files.map((file) => mapNewDocument(file));
        const batch: DocumentUploadBatch = {
            id: generateTempId(),
            items,
            status: 'uploading',
            progress: 0,
            loadedBytes: 0,
            totalBytes: getBatchTotalBytes(items),
            error: null,
            itemErrors: {},
            cancelToken: null,
            canRetry: true,
        };

        setDocumentBatch(batch);
        uploadDocumentBatch(batch);
    };

    const retryDocumentBatch = () => {
        if (!documentBatch || documentBatch.status !== 'failed') {
            return;
        }

        uploadDocumentBatch(documentBatch);
    };

    const dismissDocumentBatch = () => {
        if (!documentBatch || documentBatch.status === 'uploading') {
            return;
        }

        clearBatch(documentBatch.id);
    };

    const cancelDocumentBatch = () => {
        if (!documentBatch || documentBatch.status !== 'uploading') {
            return;
        }

        documentBatch.cancelToken?.cancel();
        clearBatch(documentBatch.id);
    };

    return {
        documentBatch,
        handleFilesChanged,
        retryDocumentBatch,
        dismissDocumentBatch,
        cancelDocumentBatch,
    };
}
