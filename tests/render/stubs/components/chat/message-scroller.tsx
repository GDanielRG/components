import type { HTMLAttributes } from 'react';

export function MessageScrollerProvider({
    children,
}: HTMLAttributes<HTMLDivElement> & {
    autoScroll?: boolean;
    defaultScrollPosition?: 'start' | 'end';
}) {
    return <div>{children}</div>;
}

export function MessageScroller(props: HTMLAttributes<HTMLDivElement>) {
    return <div {...props} />;
}

export function MessageScrollerViewport(props: HTMLAttributes<HTMLDivElement>) {
    return <div {...props} />;
}

export function MessageScrollerContent(props: HTMLAttributes<HTMLDivElement>) {
    return <div {...props} />;
}

export function MessageScrollerItem({
    messageId,
    ...props
}: HTMLAttributes<HTMLDivElement> & { messageId: string }) {
    return <div data-message-id={messageId} {...props} />;
}

export function MessageScrollerButton(
    props: HTMLAttributes<HTMLButtonElement>,
) {
    return <button type="button" {...props} />;
}
