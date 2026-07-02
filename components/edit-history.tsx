import { Link } from '@inertiajs/react';
import { ChevronDownIcon, HistoryIcon } from 'lucide-react';
import { useState } from 'react';
import type { EditHistoryEntry } from '@/components/types/edit-history-entry';
import type { HistoryCopy } from '@/components/types/shared-component-copy';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

/**
 * History is a discoverable feature: a small icon button placed inside an
 * edit form (or any context where a model is being inspected). Clicking it
 * opens a popover with the model's edit timeline.
 *
 * Per-locale changes render with a small locale badge so a single edit that
 * touches multiple languages shows as one change row per locale. Structured
 * fields (repeaters/matrices) render a server summary with expandable per-leaf
 * detail. Timestamps and enum/date values arrive server-formatted — this
 * component does no client date formatting.
 *
 * The causer link is a seam: pass `employeeHref` to turn viewable causer names
 * into `<Link>`s (registry files never import app-generated Wayfinder routes).
 * Omit it and every causer renders as plain text.
 */
type EmployeeHref = (causerId: number) => string;

type EditHistoryPopoverProps = {
    history: EditHistoryEntry[];
    dataTestPrefix?: string;
    employeeHref?: EmployeeHref;
};

export function EditHistoryPopover({
    history,
    dataTestPrefix,
    employeeHref,
}: EditHistoryPopoverProps) {
    const copy: HistoryCopy = useSharedComponentCopy();

    if (history.length === 0) {
        return null;
    }

    return (
        <Popover>
            <Tooltip>
                <PopoverTrigger
                    render={
                        <TooltipTrigger
                            render={
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={copy.historyAriaLabel}
                                    data-test={
                                        dataTestPrefix
                                            ? `${dataTestPrefix}-history-trigger`
                                            : undefined
                                    }
                                />
                            }
                        >
                            <HistoryIcon />
                        </TooltipTrigger>
                    }
                />
                <TooltipContent>{copy.historyTooltip}</TooltipContent>
            </Tooltip>
            <PopoverContent align="end" className="w-80 p-3">
                <div className="flex flex-col gap-3">
                    <div className="border-b pb-2">
                        <h2 className="text-sm font-semibold">
                            {copy.historyTitle}
                        </h2>
                    </div>
                    {history.map((entry) => (
                        <EditHistoryItem
                            key={entry.id}
                            entry={entry}
                            employeeHref={employeeHref}
                        />
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

function EditHistoryItem({
    entry,
    employeeHref,
}: {
    entry: EditHistoryEntry;
    employeeHref?: EmployeeHref;
}) {
    const copy: HistoryCopy = useSharedComponentCopy();
    const firstName = entry.causer?.name.split(' ')[0] ?? copy.historySystem;

    return (
        <div className="flex items-start gap-2">
            <Avatar className="size-7 shrink-0">
                <AvatarFallback className="text-[10px]">
                    {entry.causer?.initials ?? '?'}
                </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2 text-xs">
                    <EditHistoryCauserName
                        causer={entry.causer}
                        firstName={firstName}
                        employeeHref={employeeHref}
                    />
                    <span className="text-[10px] text-muted-foreground">
                        {entry.formatted_at}
                    </span>
                </div>
                {entry.changes.length > 0 && (
                    <div className="flex flex-col gap-0.5 text-xs leading-relaxed">
                        {entry.changes.map((change, index) => (
                            <EditHistoryChangeLine
                                key={`${change.field}-${change.locale ?? 'none'}-${index}`}
                                change={change}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function EditHistoryCauserName({
    causer,
    firstName,
    employeeHref,
}: {
    causer: EditHistoryEntry['causer'];
    firstName: string;
    employeeHref?: EmployeeHref;
}) {
    const copy: HistoryCopy = useSharedComponentCopy();

    if (!causer) {
        return (
            <strong className="text-muted-foreground">
                {copy.historySystem}
            </strong>
        );
    }

    if (causer.can_be_viewed !== false && employeeHref) {
        return (
            <Link
                href={employeeHref(causer.id)}
                prefetch
                className="font-semibold hover:underline"
            >
                {firstName}
            </Link>
        );
    }

    return <strong>{firstName}</strong>;
}

function EditHistoryChangeLine({
    change,
}: {
    change: EditHistoryEntry['changes'][number];
}) {
    const copy: HistoryCopy = useSharedComponentCopy();
    const formatOptions = {
        booleanFalse: copy.historyBooleanFalse,
        booleanTrue: copy.historyBooleanTrue,
        empty: copy.historyEmptyValue,
        fieldValueLabels: copy.historyFieldValueLabels,
    };

    // Structured fields (repeaters/matrices) carry a server-rendered summary
    // plus optional expandable per-leaf detail, so they never render a raw
    // object. A scalar change has no `summary` and renders as a from→to diff.
    if (change.summary !== undefined) {
        return (
            <EditHistoryStructuredChange
                change={change}
                formatOptions={formatOptions}
            />
        );
    }

    return (
        <p className="flex flex-wrap items-baseline gap-1">
            {change.locale ? (
                <Badge
                    variant="secondary"
                    className="h-4 px-1 font-mono text-[9px] tracking-wide uppercase"
                >
                    {change.locale}
                </Badge>
            ) : null}
            {change.field_label ? (
                <span className="font-medium text-foreground">
                    {change.field_label}:
                </span>
            ) : null}
            <em className="text-muted-foreground line-through decoration-muted-foreground/50">
                {formatEditHistoryValue(
                    change.field,
                    fromValue(change),
                    formatOptions,
                )}
            </em>{' '}
            <em>
                {formatEditHistoryValue(
                    change.field,
                    toValue(change),
                    formatOptions,
                )}
            </em>
        </p>
    );
}

function EditHistoryStructuredChange({
    change,
    formatOptions,
}: {
    change: EditHistoryEntry['changes'][number];
    formatOptions: FormatEditHistoryValueOptions;
}) {
    const copy: HistoryCopy = useSharedComponentCopy();
    const [open, setOpen] = useState(false);
    const details = change.details ?? [];

    return (
        <div className="flex flex-col gap-1">
            <p className="flex flex-wrap items-baseline gap-1">
                {change.field_label ? (
                    <span className="font-medium text-foreground">
                        {change.field_label}:
                    </span>
                ) : null}
                <span className="text-muted-foreground">{change.summary}</span>
            </p>
            {details.length > 0 ? (
                <Collapsible open={open} onOpenChange={setOpen}>
                    <CollapsibleTrigger
                        render={
                            <button
                                type="button"
                                className="flex w-fit items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                            />
                        }
                    >
                        <ChevronDownIcon
                            className={`size-3 transition-transform ${open ? 'rotate-180' : ''}`}
                        />
                        {open
                            ? copy.historyDetailHide
                            : copy.historyDetailShow(details.length)}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-1 flex flex-col gap-0.5 border-l pl-2">
                        {details.map((detail, index) => (
                            <EditHistoryDetailLine
                                key={`${detail.label}-${index}`}
                                detail={detail}
                                formatOptions={formatOptions}
                            />
                        ))}
                    </CollapsibleContent>
                </Collapsible>
            ) : null}
        </div>
    );
}

function EditHistoryDetailLine({
    detail,
    formatOptions,
}: {
    detail: NonNullable<EditHistoryEntry['changes'][number]['details']>[number];
    formatOptions: FormatEditHistoryValueOptions;
}) {
    return (
        <p className="flex flex-wrap items-baseline gap-1 text-[11px]">
            <span className="font-medium">{detail.label}:</span>
            <em className="text-muted-foreground line-through decoration-muted-foreground/50">
                {formatEditHistoryValue(
                    '',
                    detail.from_label ?? detail.from,
                    formatOptions,
                )}
            </em>{' '}
            <em>
                {formatEditHistoryValue(
                    '',
                    detail.to_label ?? detail.to,
                    formatOptions,
                )}
            </em>
        </p>
    );
}

function fromValue(change: EditHistoryEntry['changes'][number]): unknown {
    return change.from_label ?? change.from;
}

function toValue(change: EditHistoryEntry['changes'][number]): unknown {
    return change.to_label ?? change.to;
}

type FormatEditHistoryValueOptions = {
    booleanFalse: string;
    booleanTrue: string;
    empty: string;
    fieldValueLabels: Record<string, Record<string, string>>;
};

function formatEditHistoryValue(
    field: string,
    value: unknown,
    options: FormatEditHistoryValueOptions,
): string {
    if (value === null || value === undefined) {
        return options.empty;
    }

    if (Array.isArray(value)) {
        return value.length === 0 ? options.empty : value.join(', ');
    }

    if (typeof value === 'boolean') {
        const label = options.fieldValueLabels[field]?.[String(value)];

        if (label) {
            return label;
        }

        return value ? options.booleanTrue : options.booleanFalse;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    if (typeof value === 'string') {
        const label = options.fieldValueLabels[field]?.[value];

        if (label) {
            return label;
        }

        return value;
    }

    return JSON.stringify(value);
}
