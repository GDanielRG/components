// @vitest-environment jsdom
//
// Render-level regression gate for the archive-badge trigger affordance added to
// the single-select filter (plan 023 WS3). It mounts the REAL SelectFilter with
// the stubbed stock primitives (button/popover/badge/field/radio-group/separator)
// and proves the icon/label contract driven by the new `icon` and `hideLabel`
// fields on `ServerSearchFilter`:
//   1. an `icon: 'archive'` filter renders the archive icon (never FunnelPlus);
//   2. `hideLabel: true` drops the visible label text but preserves it as the
//      trigger's aria-label (accessibility must not regress);
//   3. the archive icon stays visible once an option is selected, alongside the
//      selected-option Badge;
//   4. a plain select filter keeps the FunnelPlus icon + visible label.
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SelectFilter } from '@/components/search/select-filter';
import type { ServerSearchFilter } from '@/components/types/server-search';

afterEach(cleanup);

const archivedFilter: ServerSearchFilter = {
    key: 'resource_status',
    label: 'Archivados',
    type: 'select',
    icon: 'archive',
    hideLabel: true,
    options: [
        { label: 'Solo archivados', value: 'archived' },
        { label: 'Todos', value: 'all' },
    ],
};

const plainSelectFilter: ServerSearchFilter = {
    key: 'estado',
    label: 'Estado',
    type: 'select',
    options: [
        { label: 'Activo', value: 'active' },
        { label: 'Inactivo', value: 'inactive' },
    ],
};

function renderSelectFilter(
    filter: ServerSearchFilter,
    value: string | null = null,
) {
    return render(
        <SelectFilter
            filter={filter}
            value={value}
            open={false}
            onOpenChange={() => {}}
            onValueChange={() => {}}
        />,
    );
}

describe('SelectFilter — archive-badge trigger (plan 023 WS3)', () => {
    it('renders the archive icon and no visible label, keeping the label as aria-label', () => {
        renderSelectFilter(archivedFilter);

        const trigger = screen.getByTestId('filter-resource_status-trigger');
        expect(trigger).toHaveAttribute('aria-label', 'Archivados');
        // The label is icon-only: no visible "Archivados" text node anywhere.
        expect(screen.queryByText('Archivados')).toBeNull();
        // Archive icon present; the FunnelPlus fallback is not used.
        expect(trigger.querySelector('svg.lucide-archive')).not.toBeNull();
        expect(trigger.querySelector('svg.lucide-funnel-plus')).toBeNull();
    });

    it('keeps the archive icon visible once an option is selected and shows the option badge', () => {
        renderSelectFilter(archivedFilter, 'archived');

        const trigger = screen.getByTestId('filter-resource_status-trigger');
        // Icon stays regardless of selection state for a named-icon filter.
        expect(trigger.querySelector('svg.lucide-archive')).not.toBeNull();
        expect(trigger).toHaveAttribute('aria-label', 'Archivados');
        // The selected option surfaces as the secondary Badge inside the trigger.
        expect(
            within(trigger).getByText('Solo archivados'),
        ).toBeInTheDocument();
    });

    it('leaves a plain select filter with the FunnelPlus icon and a visible label', () => {
        renderSelectFilter(plainSelectFilter);

        const trigger = screen.getByTestId('filter-estado-trigger');
        expect(trigger).not.toHaveAttribute('aria-label');
        expect(within(trigger).getByText('Estado')).toBeInTheDocument();
        expect(trigger.querySelector('svg.lucide-funnel-plus')).not.toBeNull();
        expect(trigger.querySelector('svg.lucide-archive')).toBeNull();
    });
});
