// APP-OWNED CONTRACT STUB for the render gate. The real consumer returns a
// fully-typed, locale-specific SharedComponentCopy. The registry components only
// read copy slices from this hook. For the render gate we return a Proxy whose
// every property resolves to a value that is BOTH usable as a string (it renders
// as the key name, so labels are assertable) AND callable as a copy function
// (e.g. `copy.documentsUploadProgress(loaded, total)`), since some copy entries
// are functions of runtime values.
import type { SharedComponentCopy } from '@/components/types/shared-component-copy';

function makeCopyValue(key: string) {
    // A callable string: `String(value)` and JSX text render the key; calling it
    // (function-style copy) returns the key joined with its arguments.
    const fn = (...args: unknown[]) =>
        args.length ? `${key}:${args.join(',')}` : key;
    fn.toString = () => key;
    return fn;
}

const handler: ProxyHandler<Record<string, unknown>> = {
    get: (_target, prop) => {
        if (prop === Symbol.toPrimitive || prop === 'toString') {
            return () => '';
        }
        return makeCopyValue(String(prop));
    },
};

export const useSharedComponentCopy = (): SharedComponentCopy =>
    new Proxy({}, handler) as unknown as SharedComponentCopy;
