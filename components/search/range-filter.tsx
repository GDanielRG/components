import { format, isValid, parseISO } from 'date-fns';
import { FunnelPlusIcon } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import type { ServerSearchRangeFilter } from '@/components/types/server-search';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { SearchRangeValue } from './types';

function resolveTestId(base: string, prefix?: string): string {
    return prefix ? `${prefix}-${base}` : base;
}

function parseDate(value: string): Date | undefined {
    if (!value) {
        return undefined;
    }

    const parsed = parseISO(value);

    return isValid(parsed) ? parsed : undefined;
}

export function RangeFilter({
    filter,
    value,
    open,
    onOpenChange,
    onValueChange,
    testIdPrefix,
}: {
    filter: ServerSearchRangeFilter;
    value: SearchRangeValue;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onValueChange: (value: SearchRangeValue) => void;
    testIdPrefix?: string;
}) {
    const [from, setFrom] = useState(value.from ?? '');
    const [to, setTo] = useState(value.to ?? '');
    const active = value.from !== null || value.to !== null;

    const isSlider = filter.control === 'slider';
    const isDate = filter.inputType === 'date';
    const prefix = filter.valuePrefix ?? '';
    const sliderMin = Number(filter.min ?? 0);
    const sliderMax = Number(filter.max ?? 100);
    const sliderStep = Number(filter.step ?? 1);
    const sliderLabelId = `${filter.key}-slider-label`;

    function handleOpenChange(nextOpen: boolean): void {
        if (nextOpen) {
            setFrom(value.from ?? '');
            setTo(value.to ?? '');
        }

        onOpenChange(nextOpen);
    }

    function renderTrigger(props: ComponentProps<typeof Button>) {
        const displayFrom =
            value.from !== null ? `${prefix}${value.from}` : '…';
        const displayTo = value.to !== null ? `${prefix}${value.to}` : '…';

        return (
            <Button
                {...props}
                data-test={resolveTestId(
                    `filter-${filter.key}-trigger`,
                    testIdPrefix,
                )}
                variant={open ? 'secondary' : 'outline'}
                className={cn(
                    'max-w-full justify-start',
                    !active && 'border-dashed',
                )}
            >
                {!active && <FunnelPlusIcon />}
                <span className="shrink-0">{filter.label}</span>
                {active && (
                    <span className="truncate text-muted-foreground">
                        {displayFrom} – {displayTo}
                    </span>
                )}
            </Button>
        );
    }

    function renderBody() {
        if (isSlider) {
            const currentFrom = from !== '' ? Number(from) : sliderMin;
            const currentTo = to !== '' ? Number(to) : sliderMax;

            return (
                <div className="flex flex-col gap-4 pt-1">
                    <span id={sliderLabelId} className="sr-only">
                        {filter.label}
                    </span>
                    <div className="flex items-center justify-between text-sm font-medium">
                        <span
                            data-test={resolveTestId(
                                `filter-${filter.key}-from-value`,
                                testIdPrefix,
                            )}
                        >
                            {prefix}
                            {currentFrom}
                        </span>
                        <span
                            data-test={resolveTestId(
                                `filter-${filter.key}-to-value`,
                                testIdPrefix,
                            )}
                        >
                            {prefix}
                            {currentTo}
                        </span>
                    </div>
                    <Slider
                        min={sliderMin}
                        max={sliderMax}
                        step={sliderStep}
                        value={[currentFrom, currentTo]}
                        aria-labelledby={sliderLabelId}
                        thumbLabels={[filter.fromLabel, filter.toLabel]}
                        thumbTestIds={[
                            resolveTestId(
                                `filter-${filter.key}-from-thumb`,
                                testIdPrefix,
                            ),
                            resolveTestId(
                                `filter-${filter.key}-to-thumb`,
                                testIdPrefix,
                            ),
                        ]}
                        onValueChange={(next) => {
                            const values = Array.isArray(next)
                                ? next
                                : [next, next];

                            setFrom(String(values[0]));
                            setTo(String(values[1]));
                        }}
                        data-test={resolveTestId(
                            `filter-${filter.key}-slider`,
                            testIdPrefix,
                        )}
                    />
                </div>
            );
        }

        if (isDate) {
            return (
                <Calendar
                    mode="range"
                    numberOfMonths={1}
                    selected={{
                        from: parseDate(from),
                        to: parseDate(to),
                    }}
                    onSelect={(range) => {
                        setFrom(
                            range?.from ? format(range.from, 'yyyy-MM-dd') : '',
                        );
                        setTo(range?.to ? format(range.to, 'yyyy-MM-dd') : '');
                    }}
                    data-test={resolveTestId(
                        `filter-${filter.key}-calendar`,
                        testIdPrefix,
                    )}
                />
            );
        }

        return (
            <FieldGroup className="gap-3">
                <Field>
                    <FieldLabel htmlFor={`${filter.key}-from`}>
                        {filter.fromLabel}
                    </FieldLabel>
                    <Input
                        id={`${filter.key}-from`}
                        type={filter.inputType}
                        inputMode={filter.inputMode}
                        step={filter.step}
                        min={
                            filter.min ??
                            (filter.inputType === 'number' ? 0 : undefined)
                        }
                        max={filter.max}
                        value={from}
                        onChange={(event) => setFrom(event.target.value)}
                        data-test={resolveTestId(
                            `filter-${filter.key}-from`,
                            testIdPrefix,
                        )}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${filter.key}-to`}>
                        {filter.toLabel}
                    </FieldLabel>
                    <Input
                        id={`${filter.key}-to`}
                        type={filter.inputType}
                        inputMode={filter.inputMode}
                        step={filter.step}
                        min={
                            filter.min ??
                            (filter.inputType === 'number' ? 0 : undefined)
                        }
                        max={filter.max}
                        value={to}
                        onChange={(event) => setTo(event.target.value)}
                        data-test={resolveTestId(
                            `filter-${filter.key}-to`,
                            testIdPrefix,
                        )}
                    />
                </Field>
            </FieldGroup>
        );
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger render={(props) => renderTrigger(props)} />
            <PopoverContent
                className={cn(isDate ? 'w-auto' : 'w-64')}
                align="start"
            >
                <div className="flex flex-col gap-3">
                    {renderBody()}
                    <div className="flex items-center justify-between gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setFrom('');
                                setTo('');
                                onValueChange({ from: null, to: null });
                            }}
                            disabled={!active && !from && !to}
                            data-test={resolveTestId(
                                `filter-${filter.key}-clear`,
                                testIdPrefix,
                            )}
                        >
                            {filter.clearLabel}
                        </Button>
                        <Button
                            type="button"
                            onClick={() =>
                                onValueChange({
                                    from: from || null,
                                    to: to || null,
                                })
                            }
                            data-test={resolveTestId(
                                `filter-${filter.key}-apply`,
                                testIdPrefix,
                            )}
                        >
                            {filter.applyLabel}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
