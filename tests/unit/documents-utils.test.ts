import { describe, expect, it } from 'vitest';
import {
    formatDocumentKilobytes,
    generateTempId,
    getAcceptedDocumentMimes,
    getBasename,
    getDocumentDisplayName,
    getFileExtension,
    isDocumentFileTooLarge,
    isExistingDocument,
} from '../../components/documents/utils';

describe('path helpers', () => {
    it('getBasename returns the last path segment', () => {
        expect(getBasename('/a/b/c.pdf')).toBe('c.pdf');
        expect(getBasename('file.pdf')).toBe('file.pdf');
    });

    it('getFileExtension returns the dotted extension or empty', () => {
        expect(getFileExtension('file.pdf')).toBe('.pdf');
        expect(getFileExtension('a.b.c')).toBe('.c');
        expect(getFileExtension('noext')).toBe('');
        expect(getFileExtension('.hidden')).toBe(''); // leading dot is not an extension
    });
});

describe('getAcceptedDocumentMimes', () => {
    it('prefixes each mime with a dot', () => {
        expect(getAcceptedDocumentMimes(['pdf', 'jpg'])).toBe('.pdf,.jpg');
        expect(getAcceptedDocumentMimes([])).toBe('');
    });
});

describe('formatDocumentKilobytes', () => {
    it('formats whole megabytes as MB', () => {
        expect(formatDocumentKilobytes(1024)).toBe('1 MB');
        expect(formatDocumentKilobytes(2048)).toBe('2 MB');
    });

    it('formats other sizes as KB', () => {
        expect(formatDocumentKilobytes(500)).toBe('500 KB');
        expect(formatDocumentKilobytes(1536)).toBe('1536 KB');
    });
});

describe('isDocumentFileTooLarge', () => {
    const file = (size: number) => ({ size }) as File;

    it('compares byte size against the kilobyte cap', () => {
        expect(isDocumentFileTooLarge(file(2 * 1024 * 1024), 1024)).toBe(true);
        expect(isDocumentFileTooLarge(file(500), 1024)).toBe(false);
    });

    it('treats a non-positive cap as unlimited', () => {
        expect(isDocumentFileTooLarge(file(9_999_999), 0)).toBe(false);
    });
});

describe('isExistingDocument', () => {
    it('detects persisted documents by id', () => {
        expect(isExistingDocument({ id: 1 } as never)).toBe(true);
        expect(isExistingDocument({ tempId: 'x', file: {} } as never)).toBe(
            false,
        );
    });
});

describe('getDocumentDisplayName', () => {
    it('keeps a name that already has an extension', () => {
        expect(
            getDocumentDisplayName({
                name: 'Report.pdf',
                path: 'x.pdf',
            } as never),
        ).toBe('Report.pdf');
    });

    it('appends the source extension to a bare name', () => {
        expect(
            getDocumentDisplayName({
                name: 'Report',
                path: 'file.pdf',
            } as never),
        ).toBe('Report.pdf');
    });

    it('falls back to the stored file basename', () => {
        expect(
            getDocumentDisplayName({ path: '/docs/contract.pdf' } as never),
        ).toBe('contract.pdf');
    });
});

describe('generateTempId', () => {
    it('returns a timestamped id', () => {
        expect(generateTempId()).toMatch(/^\d+_[a-z0-9]+$/);
    });
});
