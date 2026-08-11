// APP-OWNED CONTRACT STUB for the render gate. The real consumer returns a
// fully-typed, locale-specific SharedComponentCopy. The registry components only
// read copy slices from this hook. String entries render as their key, callable
// entries echo their key plus arguments, and the one record entry stays a record.
import type { SharedComponentCopy } from '@/components/types/shared-component-copy';

const functionKeys = new Set([
    'archiveBadgeTooltip',
    'commentsCount',
    'commentsTyping',
    'documentsBatchTooLarge',
    'documentsCount',
    'documentsDeleteNamedDescription',
    'documentsUploadProgress',
    'documentsUploadTotal',
    'documentsValidationMaxSize',
    'exportEmailNotice',
    'historyDetailShow',
    'searchSelectedCount',
]);

const handler: ProxyHandler<Record<string, unknown>> = {
    get: (_target, prop) => {
        if (prop === Symbol.toPrimitive || prop === 'toString') {
            return () => '';
        }

        const key = String(prop);

        if (key === 'historyFieldValueLabels') {
            return {};
        }

        if (functionKeys.has(key)) {
            return (...args: unknown[]) =>
                args.length ? `${key}:${args.join(',')}` : key;
        }

        return key;
    },
};

export const useSharedComponentCopy = (): SharedComponentCopy =>
    new Proxy({}, handler) as unknown as SharedComponentCopy;
