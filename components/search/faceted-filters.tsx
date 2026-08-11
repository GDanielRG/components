import {
    ArchiveIcon,
    FunnelPlusIcon,
    FunnelXIcon,
    SlidersHorizontalIcon,
    StarIcon,
} from 'lucide-react';
import type { ComponentProps, ReactElement } from 'react';
import type {
    ServerSearchChoiceFilter,
    ServerSearchFilterOption,
} from '@/components/types/server-search';
import type { SearchCopy } from '@/components/types/shared-component-copy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxSeparator,
    ComboboxTrigger,
} from '@/components/ui/combobox';
import { Separator } from '@/components/ui/separator';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';

interface FacetedFiltersProps {
    filters: ServerSearchChoiceFilter[];
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

// A named icon stays visible regardless of selection state; the default
// FunnelPlus icon only shows while the filter is empty.
const namedTriggerIcons = {
    archive: ArchiveIcon,
    featured: StarIcon,
    sort: SlidersHorizontalIcon,
} as const;

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

    return (
        <div className={cn('flex flex-wrap items-center gap-3', className)}>
            {filters.map((filter) => {
                const isOpen = openFilterKey === filter.key;
                const selectedValues = filterValues[filter.key] ?? [];
                // An empty value is the catalogue's "any" placeholder: absence
                // of the filter already expresses it, so it is never selectable.
                const options = filter.options.filter(
                    (option) => option.value !== '',
                );
                const selectedOptions = options.filter((option) =>
                    selectedValues.includes(option.value),
                );

                function renderTrigger(
                    props: ComponentProps<typeof Button>,
                    open: boolean,
                ): ReactElement {
                    const NamedTriggerIcon = filter.icon
                        ? namedTriggerIcons[filter.icon]
                        : undefined;
                    const TriggerIcon = NamedTriggerIcon ?? FunnelPlusIcon;
                    const showTriggerIcon =
                        Boolean(NamedTriggerIcon) ||
                        selectedValues.length === 0;

                    return (
                        <Button
                            {...props}
                            data-test={resolveTestId(
                                `filter-${filter.key}-trigger`,
                                testIdPrefix,
                            )}
                            aria-label={
                                filter.hideLabel ? filter.label : undefined
                            }
                            variant={open ? 'secondary' : 'outline'}
                            className={cn(
                                'max-w-full justify-start',
                                selectedValues.length === 0 && 'border-dashed',
                            )}
                        >
                            {showTriggerIcon && <TriggerIcon />}
                            {!filter.hideLabel && (
                                <span className="shrink-0">{filter.label}</span>
                            )}
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
                    <Combobox
                        key={filter.key}
                        items={options}
                        multiple
                        value={selectedOptions}
                        onValueChange={(
                            nextOptions: ServerSearchFilterOption[],
                        ) =>
                            onFilterValueChange(
                                filter.key,
                                nextOptions.map((option) => option.value),
                            )
                        }
                        open={isOpen}
                        onOpenChange={(open) =>
                            onFilterOpenChange(filter.key, open)
                        }
                    >
                        <ComboboxTrigger
                            render={(props) => renderTrigger(props, isOpen)}
                        />
                        <ComboboxContent align="start">
                            <ComboboxInput
                                showTrigger={false}
                                aria-label={filter.label}
                                placeholder={filter.label}
                            />
                            <ComboboxEmpty>
                                {copy.searchNoResults}
                            </ComboboxEmpty>
                            <ComboboxList>
                                {(option: ServerSearchFilterOption) => (
                                    <ComboboxItem
                                        key={option.value}
                                        value={option}
                                        data-test={resolveTestId(
                                            `filter-${filter.key}-option-${option.value}`,
                                            testIdPrefix,
                                        )}
                                    >
                                        {option.label}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                            {selectedValues.length > 0 && (
                                <>
                                    <ComboboxSeparator />
                                    <div className="p-1">
                                        <Button
                                            data-test={resolveTestId(
                                                `filter-${filter.key}-clear`,
                                                testIdPrefix,
                                            )}
                                            className="w-full hover:bg-destructive/20 hover:text-destructive dark:hover:bg-destructive/30"
                                            variant="ghost"
                                            onClick={() =>
                                                onFilterValueChange(
                                                    filter.key,
                                                    [],
                                                )
                                            }
                                        >
                                            <FunnelXIcon />
                                            {copy.searchClearFilter}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </ComboboxContent>
                    </Combobox>
                );
            })}
        </div>
    );
}
