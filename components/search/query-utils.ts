import type { ServerSearchFilter } from '@/components/types/server-search';

export type SearchNavigationPrimitive = string | string[];
export type SearchNavigationData = {
    [key: string]: SearchNavigationPrimitive | SearchNavigationData;
};
export type SearchNavigationPatchValue =
    string | string[] | SearchNavigationPatch | null | undefined;
export interface SearchNavigationPatch {
    [key: string]: SearchNavigationPatchValue;
}

function isSearchNavigationData(
    value: SearchNavigationPrimitive | SearchNavigationData | undefined,
): value is SearchNavigationData {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneQueryData(data: SearchNavigationData): SearchNavigationData {
    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
            key,
            isSearchNavigationData(value)
                ? cloneQueryData(value)
                : Array.isArray(value)
                  ? [...value]
                  : value,
        ]),
    );
}

function normalizeArrayValues(values: string[]): string[] | null {
    const normalizedValues = [...new Set(values.filter(Boolean))];

    return normalizedValues.length > 0 ? normalizedValues : null;
}

function normalizePath(path: string | string[]): string[] {
    return Array.isArray(path) ? path : path.split('.').filter(Boolean);
}

function parseQueryKey(key: string): { path: string[]; isArray: boolean } {
    // PHP serializes nested URL arrays in two equivalent ways:
    //   - `filter[type][]=hob`     (empty brackets)
    //   - `filter[type][0]=hob`    (numeric index)
    // Both round-trip through PHP as an array. The frontend must treat them
    // the same so a re-render of a parsed URL doesn't silently drop array-ness
    // (which previously caused 422s the moment a second chip filter was added
    // on top of an existing indexed filter).
    const isExplicitArray = key.endsWith('[]');
    const normalizedKey = isExplicitArray ? key.slice(0, -2) : key;
    const rawSegments = normalizedKey
        .replace(/\]/g, '')
        .split('[')
        .flatMap((segment) => segment.split('.'));
    const hasNumericIndex = rawSegments.some((segment) =>
        /^\d+$/.test(segment),
    );
    const path = rawSegments.filter(
        (segment) => segment !== '' && !/^\d+$/.test(segment),
    );

    return { path, isArray: isExplicitArray || hasNumericIndex };
}

function appendQueryValue(
    data: SearchNavigationData,
    path: string[],
    value: string,
    isArray: boolean,
): void {
    if (value === '') {
        return;
    }

    const [segment, ...rest] = path;

    if (!segment) {
        return;
    }

    if (rest.length === 0) {
        const existingValue = data[segment];

        if (existingValue === undefined) {
            data[segment] = isArray ? [value] : value;

            return;
        }

        if (Array.isArray(existingValue)) {
            if (!existingValue.includes(value)) {
                existingValue.push(value);
            }

            return;
        }

        if (typeof existingValue === 'string') {
            if (existingValue !== value) {
                data[segment] = [existingValue, value];
            }

            return;
        }

        return;
    }

    const existingValue = data[segment];
    const nextData = isSearchNavigationData(existingValue) ? existingValue : {};

    data[segment] = nextData;
    appendQueryValue(nextData, rest, value, isArray);
}

function getNestedValue(
    data: SearchNavigationData,
    path: string[],
): SearchNavigationPrimitive | SearchNavigationData | undefined {
    let current: SearchNavigationPrimitive | SearchNavigationData | undefined =
        data;

    for (const segment of path) {
        if (!isSearchNavigationData(current)) {
            return undefined;
        }

        current = current[segment];
    }

    return current;
}

function deleteNestedValue(data: SearchNavigationData, path: string[]): void {
    const [segment, ...rest] = path;

    if (!segment) {
        return;
    }

    if (rest.length === 0) {
        delete data[segment];

        return;
    }

    const value = data[segment];

    if (!isSearchNavigationData(value)) {
        return;
    }

    deleteNestedValue(value, rest);

    if (Object.keys(value).length === 0) {
        delete data[segment];
    }
}

function applyPatchValue(
    data: SearchNavigationData,
    path: string[],
    value: SearchNavigationPatchValue,
): void {
    const [segment, ...rest] = path;

    if (!segment) {
        return;
    }

    if (rest.length > 0) {
        const nextValue = data[segment];
        const nextData = isSearchNavigationData(nextValue) ? nextValue : {};

        data[segment] = nextData;
        applyPatchValue(nextData, rest, value);

        if (Object.keys(nextData).length === 0) {
            delete data[segment];
        }

        return;
    }

    if (value === null || value === undefined) {
        delete data[segment];

        return;
    }

    if (Array.isArray(value)) {
        const normalizedValues = normalizeArrayValues(value);

        if (normalizedValues === null) {
            delete data[segment];

            return;
        }

        data[segment] = normalizedValues;

        return;
    }

    if (typeof value === 'object') {
        const nextValue = data[segment];
        const nextData = isSearchNavigationData(nextValue) ? nextValue : {};

        for (const [subKey, subValue] of Object.entries(value)) {
            applyPatchValue(nextData, [subKey], subValue);
        }

        if (Object.keys(nextData).length === 0) {
            delete data[segment];

            return;
        }

        data[segment] = nextData;

        return;
    }

    if (value === '') {
        delete data[segment];

        return;
    }

    data[segment] = value;
}

export function buildPathPatch(
    path: string | string[],
    value: SearchNavigationPatchValue,
): SearchNavigationPatch {
    const normalizedPath = normalizePath(path);

    if (normalizedPath.length === 0) {
        return {};
    }

    const [segment, ...rest] = normalizedPath;

    if (rest.length === 0) {
        return { [segment]: value };
    }

    return {
        [segment]: buildPathPatch(rest, value),
    };
}

export function parseCurrentQuery(currentSearch: string): SearchNavigationData {
    const data: SearchNavigationData = {};
    const params = new URLSearchParams(currentSearch);

    for (const [key, value] of params.entries()) {
        const { path, isArray } = parseQueryKey(key);

        appendQueryValue(data, path, value, isArray);
    }

    return data;
}

export function getQueryValue(
    data: SearchNavigationData,
    path: string | string[],
): string | null {
    const value = getNestedValue(data, normalizePath(path));

    if (Array.isArray(value)) {
        return value[0] ?? null;
    }

    return typeof value === 'string' ? value : null;
}

export function getQueryValues(
    data: SearchNavigationData,
    path: string | string[],
): string[] {
    const value = getNestedValue(data, normalizePath(path));

    if (Array.isArray(value)) {
        return value;
    }

    return typeof value === 'string' ? [value] : [];
}

/**
 * Apply a nested query patch to canonical query data.
 */
export function buildQueryDataFromCurrent(
    currentData: SearchNavigationData,
    patch: SearchNavigationPatch,
): SearchNavigationData {
    const data = cloneQueryData(currentData);

    for (const [key, value] of Object.entries(patch)) {
        applyPatchValue(data, [key], value);
    }

    deleteNestedValue(data, ['page']);

    return data;
}

export function splitPageUrl(pageUrl: string): {
    basePath: string;
    currentSearch: string;
} {
    const questionIndex = pageUrl.indexOf('?');

    return {
        basePath:
            questionIndex >= 0 ? pageUrl.slice(0, questionIndex) : pageUrl,
        currentSearch:
            questionIndex >= 0 ? pageUrl.slice(questionIndex + 1) : '',
    };
}

export function resolveCurrentSearch(pageUrl: string): string {
    const { currentSearch } = splitPageUrl(pageUrl);

    return currentSearch;
}

/**
 * The `filter[*]` values that clear a single filter. Both a filter's own
 * control and "clear all" build on this so clearing behaves identically
 * everywhere.
 */
export function clearedFilterValues(
    filter: ServerSearchFilter,
): SearchNavigationPatch {
    return { [filter.key]: null };
}

export interface SearchClearControl {
    key: string;
    scope?: 'filter' | 'query';
}

export function buildClearAllPatch(
    filters: ServerSearchFilter[],
    controls: SearchClearControl[] = [],
): SearchNavigationPatch {
    const topLevelReset: SearchNavigationPatch = {};
    const filterReset: SearchNavigationPatch = {
        search: null,
        ...filters.reduce<SearchNavigationPatch>(
            (patch, filter) => ({ ...patch, ...clearedFilterValues(filter) }),
            {},
        ),
    };

    for (const control of controls) {
        if ((control.scope ?? 'filter') === 'query') {
            topLevelReset[control.key] = null;
        } else {
            filterReset[control.key] = null;
        }
    }

    return { ...topLevelReset, filter: filterReset };
}
