// APP-OWNED CONTRACT STUB — do not let the registry overwrite this.
// The real consumer returns a fully-typed SharedComponentCopy object (locale/domain
// specific). The registry components only ever call this hook and read copy slices
// from it; the registry never ships it. The smoke test asserts this file is untouched
// by `shadcn add`.
import type { SharedComponentCopy } from '@/components/types/shared-component-copy';

export const useSharedComponentCopy = (): SharedComponentCopy =>
    new Proxy({} as SharedComponentCopy, { get: () => '' });
