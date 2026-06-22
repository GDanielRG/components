import { ArchiveIcon } from 'lucide-react';
import type { ArchiveCopy } from '@/components/types/shared-component-copy';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

type ArchivedStatusBadgeProps = {
    formattedArchivedAt?: string | null;
    dataTest?: string;
    className?: string;
};

export function ArchivedStatusBadge({
    formattedArchivedAt,
    dataTest,
    className,
}: ArchivedStatusBadgeProps) {
    const copy: ArchiveCopy = useSharedComponentCopy();
    const badge = (
        <Badge variant="destructive" className={className} data-test={dataTest}>
            <ArchiveIcon />
            {copy.archiveBadgeLabel}
        </Badge>
    );

    if (!formattedArchivedAt) {
        return badge;
    }

    return (
        <Tooltip>
            <TooltipTrigger render={badge} />
            <TooltipContent>
                {copy.archiveBadgeTooltip(formattedArchivedAt)}
            </TooltipContent>
        </Tooltip>
    );
}
