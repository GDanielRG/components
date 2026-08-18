import type { ReactNode } from 'react';

export function AppRightSidebar({
    open,
    onOpenChange,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}) {
    return (
        <aside data-test="app-right-sidebar" data-open={open}>
            {children}
            <button
                type="button"
                data-test="app-right-sidebar-dismiss"
                onClick={() => onOpenChange(false)}
            >
                dismiss
            </button>
        </aside>
    );
}
