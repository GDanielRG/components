// @vitest-environment jsdom
//
// Render-level regression gate for the graduated edit-history component. Mounts
// the REAL EditHistoryPopover; only the stock shadcn primitives and the consumer
// copy hook are stubbed (see tests/render/stubs + vitest.config.ts). It proves:
//   1. an empty history renders nothing;
//   2. a scalar change renders a locale-badged from→to diff and a *_label wins
//      over the raw value;
//   3. the causer link seam: a viewable causer becomes an <a> only when an
//      `employeeHref` is supplied, and stays plain text otherwise;
//   4. a structured change renders its server `summary` + expandable per-leaf
//      details (the analisis superset folded into the registry component);
//   5. NO client date formatting — a raw ISO date passes through untouched
//      (server-formatted-value contract).
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EditHistoryPopover } from '@/components/edit-history';
import type { EditHistoryEntry } from '@/components/types/edit-history-entry';

afterEach(cleanup);

function makeEntry(
    overrides: Partial<EditHistoryEntry> = {},
): EditHistoryEntry {
    return {
        id: 1,
        causer: {
            id: 42,
            name: 'Ada Lovelace',
            initials: 'AL',
            action: 'updated',
        },
        formatted_at: '3 de enero, 10:00 a. m.',
        changes: [
            {
                field: 'name',
                locale: null,
                from: 'Old',
                to: 'New',
            },
        ],
        ...overrides,
    };
}

describe('EditHistoryPopover — graduated registry component', () => {
    it('renders nothing for an empty history', () => {
        const { container } = render(<EditHistoryPopover history={[]} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the timeline with the server-formatted timestamp and a from→to diff', () => {
        render(<EditHistoryPopover history={[makeEntry()]} />);

        // The causer renders by first name.
        expect(screen.getByText('Ada')).toBeInTheDocument();
        // The timestamp is rendered verbatim — no client formatting.
        expect(screen.getByText('3 de enero, 10:00 a. m.')).toBeInTheDocument();
        expect(screen.getByText('Old')).toBeInTheDocument();
        expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('prefers a *_label twin over the raw value', () => {
        render(
            <EditHistoryPopover
                history={[
                    makeEntry({
                        changes: [
                            {
                                field: 'status',
                                locale: null,
                                from: 'draft',
                                from_label: 'Borrador',
                                to: 'published',
                                to_label: 'Publicado',
                            },
                        ],
                    }),
                ]}
            />,
        );

        expect(screen.getByText('Borrador')).toBeInTheDocument();
        expect(screen.getByText('Publicado')).toBeInTheDocument();
        expect(screen.queryByText('draft')).toBeNull();
    });

    it('renders a viewable causer as a link only when employeeHref is supplied', () => {
        const { rerender } = render(
            <EditHistoryPopover history={[makeEntry()]} />,
        );
        // No seam → plain text, no anchor.
        expect(screen.getByText('Ada')).toBeInTheDocument();
        expect(document.querySelector('a')).toBeNull();

        rerender(
            <EditHistoryPopover
                history={[makeEntry()]}
                employeeHref={(id) => `/employees/${id}`}
            />,
        );
        const link = document.querySelector('a');
        expect(link).not.toBeNull();
        expect(link).toHaveAttribute('href', '/employees/42');
    });

    it('keeps a non-viewable causer as plain text even with employeeHref', () => {
        render(
            <EditHistoryPopover
                history={[
                    makeEntry({
                        causer: {
                            id: 7,
                            name: 'Grace Hopper',
                            initials: 'GH',
                            action: 'updated',
                            can_be_viewed: false,
                        },
                    }),
                ]}
                employeeHref={(id) => `/employees/${id}`}
            />,
        );

        expect(screen.getByText('Grace')).toBeInTheDocument();
        expect(document.querySelector('a')).toBeNull();
    });

    it('renders a structured change summary and expands per-leaf detail', () => {
        render(
            <EditHistoryPopover
                history={[
                    makeEntry({
                        changes: [
                            {
                                field: 'rows',
                                field_label: 'Filas',
                                locale: null,
                                from: null,
                                to: null,
                                summary: '2 filas modificadas',
                                details: [
                                    {
                                        label: 'Fila 1',
                                        from: 'a',
                                        to: 'b',
                                    },
                                ],
                            },
                        ],
                    }),
                ]}
            />,
        );

        expect(screen.getByText('2 filas modificadas')).toBeInTheDocument();
        // The field label prefixes the summary.
        expect(screen.getByText('Filas:')).toBeInTheDocument();
        // The collapsible trigger shows the count-driven "show" label (the copy
        // stub echoes `key:args`), proving `historyDetailShow(details.length)`.
        expect(screen.getByText('historyDetailShow:1')).toBeInTheDocument();

        // Detail is rendered inline by the stub; its leaf label + values surface.
        expect(screen.getByText('Fila 1:')).toBeInTheDocument();
        expect(screen.getByText('a')).toBeInTheDocument();
        expect(screen.getByText('b')).toBeInTheDocument();
    });

    it('does not client-format an ISO date value (server-formatted contract)', () => {
        render(
            <EditHistoryPopover
                history={[
                    makeEntry({
                        changes: [
                            {
                                field: 'due_on',
                                locale: null,
                                from: null,
                                to: '2026-01-15',
                            },
                        ],
                    }),
                ]}
            />,
        );

        // The raw ISO string passes through verbatim — no Intl.DateTimeFormat.
        expect(screen.getByText('2026-01-15')).toBeInTheDocument();
    });
});
