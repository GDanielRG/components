import { ClipboardListIcon } from 'lucide-react';
import { useCommentsDocumentsSidebar } from '@/components/activity';

const route = (method: string) => (id: number) => ({
    url: `/fixture/${id}`,
    method,
});

/** Type-only smoke consumer for the optional app-owned section contract. */
export function AdditionalActivitySectionContract() {
    const sidebar = useCommentsDocumentsSidebar({
        comments: [],
        documents: [],
        readOnly: true,
        allowedDocumentMimes: [],
        maxDocumentKilobytes: 1024,
        storeCommentForm: { url: '/comments', method: 'post' } as never,
        storeDocumentAction: { url: '/documents', method: 'post' } as never,
        updateDocumentAction: route('put') as never,
        destroyDocumentAction: route('delete') as never,
        showDocumentAction: route('get') as never,
        updateCommentForm: route('put') as never,
        destroyCommentForm: route('delete') as never,
        additionalSections: [
            {
                id: 'audit',
                label: 'Audit trail',
                icon: ClipboardListIcon,
                content: <div>Audit trail</div>,
            },
        ],
    });

    sidebar.openSection('audit');
    // @ts-expect-error Only built-in or explicitly declared section ids open.
    sidebar.openSection('timeline');

    const activeSection: 'comments' | 'documents' | 'audit' | null =
        sidebar.activeSectionId;
    const activePanel: 'comments' | 'documents' | null = sidebar.activePanel;

    return (
        <div
            data-active-section={activeSection}
            data-active-panel={activePanel}
        >
            {sidebar.rightSidebar}
        </div>
    );
}
