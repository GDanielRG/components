import {
    CheckIcon,
    FunnelPlusIcon,
    FunnelXIcon,
    SearchIcon,
} from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import type { ServerSearchFilter } from '@/components/types/server-search';
import type { SearchCopy } from '@/components/types/shared-component-copy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';

interface FacetedFiltersProps {
    filters: ServerSearchFilter[];
    filterValues: Record<string, string[]>;
    openFilterKey: string | null;
    onFilterOpenChange: (filterKey: string, open: boolean) => void;
    onFilterValueChange: (filterKey: string, values: string[]) => void;
    className?: string;
    testIdPrefix?: string;
}

function resolveTestId(base: string, prefix?: string): string {
    return prefix ? `${prefix}-${base}` : base;
}

export function FacetedFilters({
    filters,
    filterValues,
    openFilterKey,
    onFilterOpenChange,
    onFilterValueChange,
    className,
    testIdPrefix,
}: FacetedFiltersProps) {
    const copy: SearchCopy = useSharedComponentCopy();
    const [filterQueries, setFilterQueries] = useState<Record<string, string>>(
        {},
    );

    return (
        <div className={cn('flex flex-wrap items-center gap-3', className)}>
            {filters.map((filter) => {
                const isOpen = openFilterKey === filter.key;
                const selectedValues = filterValues[filter.key] ?? [];
                const selectedOptions = filter.options.filter((option) =>
                    selectedValues.includes(option.value),
                );
                const filterQuery = filterQueries[filter.key] ?? '';
                const normalizedFilterQuery = filterQuery
                    .trim()
                    .toLocaleLowerCase();
                const visibleOptions = filter.options.filter((option) => {
                    if (!option.value) {
                        return false;
                    }

                    if (normalizedFilterQuery === '') {
                        return true;
                    }

                    return option.label
                        .toLocaleLowerCase()
                        .includes(normalizedFilterQuery);
                });

                function toggleOption(optionValue: string): void {
                    const nextValues = selectedValues.includes(optionValue)
                        ? selectedValues.filter(
                              (value) => value !== optionValue,
                          )
                        : [...selectedValues, optionValue];

                    onFilterValueChange(filter.key, nextValues);
                }

                function resetFilter(): void {
                    onFilterValueChange(filter.key, []);
                }

                function renderTrigger(
                    props: ComponentProps<typeof Button>,
                    open: boolean,
                ): React.JSX.Element {
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
                                selectedValues.length === 0 && 'border-dashed',
                            )}
                        >
                            {selectedValues.length === 0 && <FunnelPlusIcon />}
                            <span className="shrink-0">{filter.label}</span>
                            {selectedValues.length > 0 && (
                                <>
                                    <Separator
                                        orientation="vertical"
                                        className="h-full w-px"
                                    />
                                    <Badge
                                        variant="secondary"
                                        className="sm:hidden"
                                    >
                                        {selectedValues.length}
                                    </Badge>
                                    <div className="hidden min-w-0 gap-1 sm:flex">
                                        {selectedValues.length > 1 ? (
                                            <Badge variant="secondary">
                                                {copy.searchSelectedCount(
                                                    selectedValues.length,
                                                )}
                                            </Badge>
                                        ) : (
                                            selectedOptions.map((option) => (
                                                <Badge
                                                    variant="secondary"
                                                    key={option.value}
                                                    className="max-w-64 min-w-0"
                                                >
                                                    <span className="truncate">
                                                        {option.label}
                                                    </span>
                                                </Badge>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </Button>
                    );
                }

                return (
                    <Popover
                        key={filter.key}
                        open={isOpen}
                        onOpenChange={(open) =>
                            onFilterOpenChange(filter.key, open)
                        }
                    >
                        <PopoverTrigger
                            render={(props) => renderTrigger(props, isOpen)}
                        />
                        <PopoverContent className="w-fit p-0" align="start">
                            <div className="flex size-full flex-col overflow-hidden rounded-4xl bg-popover p-1 text-popover-foreground">
                                <div className="p-1 pb-0">
                                    <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-input/50 px-3">
                                        <input
                                            aria-label={filter.label}
                                            className="w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder={filter.label}
                                            value={filterQuery}
                                            onChange={(event) =>
                                                setFilterQueries((queries) => ({
                                                    ...queries,
                                                    [filter.key]:
                                                        event.target.value,
                                                }))
                                            }
                                        />
                                        <SearchIcon className="size-4 shrink-0 opacity-50" />
                                    </div>
                                </div>
                                <div className="no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none">
                                    {visibleOptions.length === 0 ? (
                                        <div className="py-6 text-center text-sm">
                                            {copy.searchNoResults}
                                        </div>
                                    ) : (
                                        <div className="overflow-hidden p-1.5 text-foreground">
                                            {visibleOptions.map((option) => {
                                                const isSelected =
                                                    selectedValues.includes(
                                                        option.value,
                                                    );

                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        data-test={resolveTestId(
                                                            `filter-${filter.key}-option-${option.value || 'all'}`,
                                                            testIdPrefix,
                                                        )}
                                                        className="relative flex w-full cursor-default items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-medium outline-hidden select-none hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                                                        onClick={() =>
                                                            toggleOption(
                                                                option.value,
                                                            )
                                                        }
                                                    >
                                                        <span
                                                            aria-hidden="true"
                                                            className={cn(
                                                                'flex size-4 items-center justify-center rounded border bg-background',
                                                                isSelected
                                                                    ? 'border-muted bg-muted text-primary'
                                                                    : 'border-primary text-transparent',
                                                            )}
                                                        >
                                                            <CheckIcon className="size-3.5" />
                                                        </span>
                                                        <span className="flex-1">
                                                            {option.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                {selectedValues.length > 0 && (
                                    <>
                                        <div className="my-1.5 h-px bg-border/50" />

                                        <div className="p-1">
                                            <Button
                                                data-test={resolveTestId(
                                                    `filter-${filter.key}-clear`,
                                                    testIdPrefix,
                                                )}
                                                className="w-full hover:bg-destructive/20 hover:text-destructive dark:hover:bg-destructive/30"
                                                variant="ghost"
                                                onClick={resetFilter}
                                            >
                                                <FunnelXIcon />
                                                {copy.searchClearFilter}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                );
            })}
        </div>
    );
}
