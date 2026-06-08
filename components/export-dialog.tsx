import { Form } from '@inertiajs/react';
import {
    CloudDownloadIcon,
    FileSpreadsheetIcon,
    LoaderCircle,
    SendHorizonalIcon,
} from 'lucide-react';
import { useState } from 'react';
import type { UseSearchReturn } from '@/components/search/search';
import { SearchAppliedFilters } from '@/components/search/search-applied-filters';
import type {
    DialogCopy,
    ExportCopy,
} from '@/components/types/shared-component-copy';
import type { RouteMutationFn } from '@/components/types/wayfinder';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

export function ExportDialog({
    exportAction,
    search,
    title,
    showTrigger = true,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: {
    exportAction: RouteMutationFn;
    search?: UseSearchReturn;
    title?: string;
    showTrigger?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const copy: DialogCopy & ExportCopy = useSharedComponentCopy();
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen ?? internalOpen;
    const setOpen = controlledOnOpenChange ?? setInternalOpen;
    const dialogTitle = title ?? copy.exportTitle;
    const appliedFilters = search?.appliedFilters;
    const searchFilters = appliedFilters?.filters ?? [];
    const filterValues = appliedFilters?.filterValues ?? {};
    const searchValue = appliedFilters?.searchValue;
    const hasAppliedFilters =
        searchFilters.some(
            (filter) => (filterValues[filter.key] ?? []).length > 0,
        ) || !!searchValue?.trim();

    function handleOpenChange(nextOpen: boolean): void {
        setOpen(nextOpen);
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            {showTrigger && (
                <AlertDialogTrigger render={<Button variant="outline" />}>
                    <CloudDownloadIcon />
                    {copy.exportTrigger}
                </AlertDialogTrigger>
            )}
            <AlertDialogContent size="sm" data-test="export-dialog">
                <Form
                    action={exportAction()}
                    options={{ preserveScroll: true }}
                    transform={() => {
                        const data: {
                            filter?: Record<string, string | string[]>;
                        } = {};
                        const filter: Record<string, string | string[]> = {};

                        if (searchValue) {
                            filter.search = searchValue;
                        }

                        for (const [key, values] of Object.entries(
                            filterValues,
                        )) {
                            if (values.length > 0) {
                                filter[key] = values;
                            }
                        }

                        if (Object.keys(filter).length > 0) {
                            data.filter = filter;
                        }

                        return data;
                    }}
                    onSuccess={() => handleOpenChange(false)}
                    disableWhileProcessing
                    showProgress={false}
                    className="flex flex-col gap-6"
                >
                    {({ processing }) => (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogMedia>
                                    <FileSpreadsheetIcon />
                                </AlertDialogMedia>
                                <AlertDialogTitle>
                                    {dialogTitle}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {copy.exportEmailNotice(hasAppliedFilters)}
                                </AlertDialogDescription>
                                {search && hasAppliedFilters && (
                                    <div className="mt-3 flex justify-center">
                                        <SearchAppliedFilters
                                            appliedFilters={
                                                search.appliedFilters
                                            }
                                            className="w-fit justify-center"
                                            filtersClassName="w-fit justify-center"
                                            testIdPrefix="export"
                                        />
                                    </div>
                                )}
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={processing}>
                                    {copy.dialogCancel}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <LoaderCircle className="animate-spin" />
                                    ) : (
                                        <SendHorizonalIcon />
                                    )}
                                    {copy.exportSubmit}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </>
                    )}
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
