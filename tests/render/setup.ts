// Shared vitest setup. Runs for every test file; everything here is guarded so
// the node-environment unit tests are unaffected and only the jsdom render gate
// gets the DOM shims.
import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/dom';

// Consuming apps mark elements with `data-test` (not the testing-library
// default `data-testid`), so `getByTestId` / `queryByTestId` query the real ids.
configure({ testIdAttribute: 'data-test' });

// `use-sidebar-sheet` calls `window.matchMedia` at module-evaluation time. jsdom
// does not implement it, so polyfill a non-matching media query before any
// component module loads.
if (typeof window !== 'undefined' && !window.matchMedia) {
    window.matchMedia = (query: string) =>
        ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        }) as unknown as MediaQueryList;
}
