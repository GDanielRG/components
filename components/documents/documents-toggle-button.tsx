import { FilePlusIcon, FilesIcon } from 'lucide-react';
import type { DocumentsCopy } from '@/components/types/shared-component-copy';
import { ActiveTriggerIcon } from '@/components/ui/active-trigger-icon';
import { Button } from '@/components/ui/button';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';

interface DocumentsToggleButtonProps {
    onClick: () => void;
    size?: 'default' | 'sm';
    documentCount?: number;
    isActive?: boolean;
    emptyLabel?: string;
}

export function DocumentsToggleButton({
    onClick,
    size = 'default',
    documentCount = 0,
    isActive = false,
    emptyLabel,
}: DocumentsToggleButtonProps) {
    const copy: DocumentsCopy = useSharedComponentCopy();
    const hasDocuments = documentCount > 0;
    const Icon = hasDocuments || emptyLabel ? FilesIcon : FilePlusIcon;
    const label = hasDocuments
        ? copy.documentsCount(documentCount)
        : (emptyLabel ?? copy.documentsAddOne);

    return (
        <Button
            size={size}
            variant="outline"
            data-test="toggle-documents"
            aria-label={label}
            onClick={onClick}
            className={cn(isActive && 'group')}
        >
            <ActiveTriggerIcon icon={Icon} isActive={isActive} />
            {label}
        </Button>
    );
}
