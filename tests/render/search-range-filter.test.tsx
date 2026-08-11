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
    inputMode: 'decimal',
    step: '0.01',
    min: '0',
    max: '99999999.99',
    applyLabel: 'Apply',
    clearLabel: 'Clear',
};

const sliderFilter: ServerSearchRangeFilter = {
    ...priceFilter,
    control: 'slider',
    step: 50,
    min: 0,
    max: 5000,
    valuePrefix: '$',
};

const dateFilter: ServerSearchRangeFilter = {
    key: 'dates',
    label: 'Sailing dates',
    type: 'range',
    fromKey: 'start_date',
    toKey: 'end_date',
    fromLabel: 'Departure after',
    toLabel: 'Return before',
    inputType: 'date',
    applyLabel: 'Apply',
    clearLabel: 'Clear',
};

describe('RangeFilter', () => {
    it('applies the server-owned numeric input contract to both bounds', () => {
        render(
            <RangeFilter
                filter={priceFilter}
                value={{ from: null, to: null }}
                open
                onOpenChange={() => {}}
                onValueChange={() => {}}
            />,
        );

        for (const testId of ['filter-price-from', 'filter-price-to']) {
            expect(screen.getByTestId(testId)).toHaveAttribute(
                'inputmode',
                'decimal',
            );
            expect(screen.getByTestId(testId)).toHaveAttribute('step', '0.01');
            expect(screen.getByTestId(testId)).toHaveAttribute('min', '0');
            expect(screen.getByTestId(testId)).toHaveAttribute(
                'max',
                '99999999.99',
            );
        }
    });

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

    it('renders a labelled two-thumb slider and prefixes displayed values', () => {
        render(
            <RangeFilter
                filter={sliderFilter}
                value={{ from: '1000', to: '5000' }}
                open
                onOpenChange={() => {}}
                onValueChange={() => {}}
            />,
        );

        expect(screen.getByTestId('filter-price-trigger')).toHaveTextContent(
            '$1000 – $5000',
        );
        expect(screen.getByTestId('filter-price-from-value')).toHaveTextContent(
            '$1000',
        );
        expect(screen.getByTestId('filter-price-to-value')).toHaveTextContent(
            '$5000',
        );

        const thumbs = [
            screen.getByTestId('filter-price-from-thumb'),
            screen.getByTestId('filter-price-to-thumb'),
        ];

        const inputs = thumbs.map((thumb) =>
            thumb.querySelector('input[type="range"]'),
        );

        expect(inputs[0]).toHaveAttribute('aria-label', 'Minimum price');
        expect(inputs[1]).toHaveAttribute('aria-label', 'Maximum price');
        for (const input of inputs) {
            expect(input).toHaveAttribute('min', '0');
            expect(input).toHaveAttribute('max', '5000');
            expect(input).toHaveAttribute('step', '50');
        }
    });

    it('renders date ranges as a calendar instead of paired inputs', () => {
        render(
            <RangeFilter
                filter={dateFilter}
                value={{ from: '2026-07-20', to: '2026-07-24' }}
                open
                onOpenChange={() => {}}
                onValueChange={() => {}}
            />,
        );

        expect(screen.getByTestId('filter-dates-calendar')).toBeVisible();
        expect(
            screen.queryByTestId('filter-dates-from'),
        ).not.toBeInTheDocument();
        expect(screen.queryByTestId('filter-dates-to')).not.toBeInTheDocument();
    });
});
