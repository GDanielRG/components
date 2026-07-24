import type * as React from 'react';

type SliderProps = Omit<React.ComponentProps<'div'>, 'onChange'> & {
    min?: number;
    max?: number;
    step?: number;
    value?: number[];
    onValueChange?: (value: number[]) => void;
};

export function Slider({
    min = 0,
    max = 100,
    step = 1,
    value = [min, max],
    onValueChange,
    ...props
}: SliderProps) {
    return (
        <div {...props}>
            {value.map((current, index) => (
                <input
                    key={index}
                    type="range"
                    aria-labelledby={props['aria-labelledby']}
                    min={min}
                    max={max}
                    step={step}
                    value={current}
                    onChange={(event) => {
                        const next = [...value];
                        next[index] = event.currentTarget.valueAsNumber;
                        onValueChange?.(next);
                    }}
                />
            ))}
        </div>
    );
}
