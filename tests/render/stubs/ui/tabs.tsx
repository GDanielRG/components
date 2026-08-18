import {
    createContext,
    useContext,
    type ButtonHTMLAttributes,
    type HTMLAttributes,
    type ReactNode,
} from 'react';

const TabsContext = createContext<{
    value?: string;
    onValueChange?: (value: string) => void;
}>({});

export function Tabs({
    value,
    onValueChange,
    children,
}: {
    value?: string;
    onValueChange?: (value: string) => void;
    children: ReactNode;
}) {
    return (
        <TabsContext value={{ value, onValueChange }}>
            <div data-slot="tabs">{children}</div>
        </TabsContext>
    );
}

export function TabsList(props: HTMLAttributes<HTMLDivElement>) {
    return <div role="tablist" {...props} />;
}

export function TabsTrigger({
    value,
    onClick,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
    const tabs = useContext(TabsContext);

    return (
        <button
            type="button"
            role="tab"
            aria-selected={tabs.value === value}
            onClick={(event) => {
                onClick?.(event);
                tabs.onValueChange?.(value);
            }}
            {...props}
        />
    );
}
