import type * as React from 'react';

type CalendarProps = {
    className?: string;
    children?: React.ReactNode;
    mode?: 'single' | 'range';
    numberOfMonths?: number;
    selected?: unknown;
    onSelect?: (value: unknown) => void;
    'data-test'?: string;
};

export function Calendar(props: CalendarProps) {
    return (
        <div className={props.className} data-test={props['data-test']}>
            {props.children}
        </div>
    );
}
