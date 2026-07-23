import { FunnelPlusIcon } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import type { ServerSearchRangeFilter } from '@/components/types/server-search';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { SearchRangeValue } from './types';

function resolveTestId(base: string, prefix?: string): string {
    return prefix ? `${prefix}-${base}` : base;
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

    function handleOpenChange(nextOpen: boolean): void {
        if (nextOpen) {
            setFrom(value.from ?? '');
            setTo(value.to ?? '');
        }

        onOpenChange(nextOpen);
    }

    function renderTrigger(props: ComponentProps<typeof Button>) {
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
                        {value.from ?? '…'} – {value.to ?? '…'}
                    </span>
                )}
            </Button>
        );
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger render={(props) => renderTrigger(props)} />
            <PopoverContent className="w-64" align="start">
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
                </FieldGroup>
            </PopoverContent>
        </Popover>
    );
}
