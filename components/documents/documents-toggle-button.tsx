import { FilePlusIcon, FilesIcon } from 'lucide-react';
import { ActiveTriggerIcon } from '@/components/ui/active-trigger-icon';
import { Button } from '@/components/ui/button';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import { cn } from '@/lib/utils';
import type { DocumentsCopy } from '../../types/shared-component-copy';

interface DocumentsToggleButtonProps {
    onClick: () => void;
    size?: 'default' | 'sm';
    documentCount?: number;
    isActive?: boolean;
}

export function DocumentsToggleButton({
    onClick,
    size = 'default',
    documentCount = 0,
    isActive = false,
}: DocumentsToggleButtonProps) {
    const copy: DocumentsCopy = useSharedComponentCopy();
    const hasDocuments = documentCount > 0;
    const Icon = hasDocuments ? FilesIcon : FilePlusIcon;
    const label = hasDocuments
        ? copy.documentsCount(documentCount)
        : copy.documentsAddOne;

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
