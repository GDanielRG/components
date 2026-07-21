// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RangeFilter } from '@/components/search/range-filter';
import type { ServerSearchRangeFilter } from '@/components/types/server-search';

afterEach(cleanup);

const priceFilter: ServerSearchRangeFilter = {
    key: 'price',
    label: 'Price',
    type: 'range',
    fromKey: 'price_min',
    toKey: 'price_max',
    fromLabel: 'Minimum price',
    toLabel: 'Maximum price',
    inputType: 'number',
    applyLabel: 'Apply',
    clearLabel: 'Clear',
};

describe('RangeFilter', () => {
    it('commits both bounds together', () => {
        const onValueChange = vi.fn();

        render(
            <RangeFilter
                filter={priceFilter}
                value={{ from: null, to: null }}
                open
                onOpenChange={() => {}}
                onValueChange={onValueChange}
            />,
        );

        fireEvent.change(screen.getByTestId('filter-price-from'), {
            target: { value: '1000' },
        });
        fireEvent.change(screen.getByTestId('filter-price-to'), {
            target: { value: '5000' },
        });
        fireEvent.click(screen.getByTestId('filter-price-apply'));

        expect(onValueChange).toHaveBeenCalledWith({
            from: '1000',
            to: '5000',
        });
    });

    it('summarizes and clears an active range', () => {
        const onValueChange = vi.fn();

        render(
            <RangeFilter
                filter={priceFilter}
                value={{ from: '1000', to: null }}
                open
                onOpenChange={() => {}}
                onValueChange={onValueChange}
            />,
        );

        expect(screen.getByTestId('filter-price-trigger')).toHaveTextContent(
            '1000 – …',
        );
        fireEvent.click(screen.getByTestId('filter-price-clear'));

        expect(onValueChange).toHaveBeenCalledWith({
            from: null,
            to: null,
        });
    });
});
