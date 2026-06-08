// APP-OWNED CONTRACT STUB — do not let the registry overwrite this.
// The activity bundle composes an app-owned right-sidebar shell, kept app-owned for
// intentional per-theme divergence (e.g. card radius). The registry never ships it.
// The smoke test asserts this file is untouched by `shadcn add`.
import type { ReactNode } from 'react';

// Minimal shell matching the contract the activity bundle composes against:
// <AppRightSidebar open onOpenChange>{children}</AppRightSidebar> and a close
// button taking onClick. Real siblings render a Base UI dialog here.
export function AppRightSidebar({
    open,
    onOpenChange,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children?: ReactNode;
}) {
    void onOpenChange;
    return open ? <>{children}</> : null;
}

export function AppRightSidebarCloseButton({
    onClick,
}: {
    onClick: () => void;
}) {
    return <button type="button" onClick={onClick} />;
}
