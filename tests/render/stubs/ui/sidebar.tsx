import type { HTMLAttributes } from 'react';

export function SidebarHeader(props: HTMLAttributes<HTMLDivElement>) {
    return <header {...props} />;
}

export function SidebarContent(props: HTMLAttributes<HTMLDivElement>) {
    return <div {...props} />;
}

export function SidebarFooter(props: HTMLAttributes<HTMLDivElement>) {
    return <footer {...props} />;
}
