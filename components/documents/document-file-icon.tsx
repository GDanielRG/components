import {
    FileIcon,
    FileImageIcon,
    FileSlidersIcon,
    FileSpreadsheetIcon,
    FileTextIcon,
} from 'lucide-react';

const FILE_ICON_MAP = {
    pdf: FileTextIcon,
    txt: FileTextIcon,
    doc: FileTextIcon,
    docx: FileTextIcon,
    odt: FileTextIcon,
    csv: FileSpreadsheetIcon,
    xls: FileSpreadsheetIcon,
    xlsx: FileSpreadsheetIcon,
    ods: FileSpreadsheetIcon,
    ppt: FileSlidersIcon,
    pptx: FileSlidersIcon,
    jpg: FileImageIcon,
    jpeg: FileImageIcon,
    png: FileImageIcon,
    gif: FileImageIcon,
    bmp: FileImageIcon,
    svg: FileImageIcon,
    webp: FileImageIcon,
} as const;

interface DocumentFileIconProps {
    fileName: string;
    className?: string;
}

export function DocumentFileIcon({
    fileName,
    className,
}: DocumentFileIconProps) {
    const ext = fileName
        .split('.')
        .pop()
        ?.toLowerCase() as keyof typeof FILE_ICON_MAP;
    const IconComponent = FILE_ICON_MAP[ext] || FileIcon;

    return <IconComponent className={className} />;
}
