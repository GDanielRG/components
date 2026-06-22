import { FunnelPlusIcon, FunnelXIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import type { ServerSearchFilter } from '@/components/types/server-search';
import type { SearchCopy } from '@/components/types/shared-component-copy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';

function resolveTestId(base: string, prefix?: string): string {
    return prefix ? `${prefix}-${base}` : base;
}

type SelectFilterProps = {
    filter: ServerSearchFilter;
    value: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onValueChange: (value: string | null) => void;
    testIdPrefix?: string;
    /**
     * Whether the value can be cleared back to "none". Required view controls
     * (e.g. grouping / period) that always carry a default pass `false` so the
     * popover omits the clear action and the trigger never reads as empty.
     */
    clearable?: boolean;
};

/**
 * Single-value filter rendered as a Popover-with-form: the trigger mirrors the
 * faceted-filter chip and the popup holds a radio list. Picking an option
 * commits immediately; the clear action resets it (unless `clearable` is false).
 */
export function SelectFilter({
    filter,
    value,
    open,
    onOpenChange,
    onValueChange,
    testIdPrefix,
    clearable = true,
}: SelectFilterProps) {
    const copy: SearchCopy = useSharedComponentCopy();
    const selectedOption =
        filter.options.find((option) => option.value === value) ?? null;

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
                    !selectedOption && 'border-dashed',
                )}
            >
                {!selectedOption && <FunnelPlusIcon />}
                <span className="shrink-0">{filter.label}</span>
                {selectedOption && (
                    <>
                        <Separator
                            orientation="vertical"
                            className="h-full w-px"
                        />
                        <Badge variant="secondary" className="max-w-64 min-w-0">
                            <span className="truncate">
                                {selectedOption.label}
                            </span>
                        </Badge>
                    </>
                )}
            </Button>
        );
    }

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger render={(props) => renderTrigger(props)} />
            <PopoverContent className="w-60" align="start">
                <FieldGroup className="gap-3">
                    <RadioGroup
                        value={value}
                        onValueChange={(next) =>
                            onValueChange(
                                typeof next === 'string' ? next : null,
                            )
                        }
                    >
                        {filter.options.map((option) => {
                            const optionId = `${filter.key}-${option.value}`;

                            return (
                                <Field
                                    key={option.value}
                                    orientation="horizontal"
                                >
                                    <RadioGroupItem
                                        id={optionId}
                                        value={option.value}
                                        data-test={resolveTestId(
                                            `filter-${filter.key}-option-${option.value}`,
                                            testIdPrefix,
                                        )}
                                    />
                                    <FieldLabel htmlFor={optionId}>
                                        {option.label}
                                    </FieldLabel>
                                </Field>
                            );
                        })}
                    </RadioGroup>
                    {clearable && selectedOption && (
                        <Button
                            data-test={resolveTestId(
                                `filter-${filter.key}-clear`,
                                testIdPrefix,
                            )}
                            variant="ghost"
                            className="w-full hover:bg-destructive/20 hover:text-destructive dark:hover:bg-destructive/30"
                            onClick={() => onValueChange(null)}
                        >
                            <FunnelXIcon />
                            {copy.searchClearFilter}
                        </Button>
                    )}
                </FieldGroup>
            </PopoverContent>
        </Popover>
    );
}
