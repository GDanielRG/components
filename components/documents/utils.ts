import type {
    DocumentData,
    ExistingDocumentData,
    Document,
} from '@/components/documents/types';

type DisplayableDocument = DocumentData | Pick<Document, 'name' | 'path'>;

export const isExistingDocument = (
    doc: DocumentData,
): doc is ExistingDocumentData => 'id' in doc;

export const generateTempId = (): string =>
    `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

export const getBasename = (path: string): string => {
    return path.split('/').pop() || path;
};

export const getFileExtension = (filename: string): string => {
    const lastDot = filename.lastIndexOf('.');

    return lastDot > 0 ? filename.slice(lastDot) : '';
};

export const getDocumentDisplayName = (
    document: DisplayableDocument,
): string => {
    const fileName = 'file' in document ? document.file?.name : undefined;
    const extensionSource = fileName
        ? fileName
        : isStoredDocument(document)
          ? document.path
          : '';
    const extension = getFileExtension(extensionSource);

    if (document.name) {
        if (getFileExtension(document.name)) {
            return document.name;
        }

        return document.name + extension;
    }

    if (fileName) {
        return fileName;
    }

    return isStoredDocument(document) ? getBasename(document.path) : '';
};

const isStoredDocument = (
    document: DisplayableDocument,
): document is ExistingDocumentData | Pick<Document, 'name' | 'path'> => {
    return 'path' in document;
};

export const getAcceptedDocumentMimes = (
    allowedDocumentMimes: string[],
): string => {
    return allowedDocumentMimes.map((mime) => `.${mime}`).join(',');
};

export const formatDocumentKilobytes = (maxKilobytes: number): string => {
    if (maxKilobytes % 1024 === 0) {
        return `${maxKilobytes / 1024} MB`;
    }

    return `${maxKilobytes} KB`;
};

export const formatBytes = (bytes: number): string => {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const kilobytes = bytes / 1024;

    if (kilobytes < 1024) {
        return `${kilobytes.toFixed(kilobytes >= 100 ? 0 : 1)} KB`;
    }

    const megabytes = kilobytes / 1024;

    return `${megabytes.toFixed(megabytes >= 100 ? 0 : 1)} MB`;
};

export const isDocumentFileTooLarge = (
    file: File,
    maxDocumentKilobytes: number,
): boolean => {
    if (maxDocumentKilobytes <= 0) {
        return false;
    }

    return file.size > maxDocumentKilobytes * 1024;
};

export const getDocumentFileSizeError = (
    file: File,
    maxDocumentKilobytes: number,
    formatMaxSize: (size: string) => string,
): string | null => {
    if (!isDocumentFileTooLarge(file, maxDocumentKilobytes)) {
        return null;
    }

    return formatMaxSize(formatDocumentKilobytes(maxDocumentKilobytes));
};
