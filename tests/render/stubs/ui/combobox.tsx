import * as React from 'react';

type Option = { value: string };

type ComboboxState = {
    items: Option[];
    selected: Option[];
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: (option: Option) => void;
};

const ComboboxContext = React.createContext<ComboboxState | null>(null);

function useCombobox(): ComboboxState {
    const context = React.useContext(ComboboxContext);

    if (context === null) {
        throw new Error('Combobox parts must be rendered inside Combobox.');
    }

    return context;
}

export function Combobox({
    items,
    value,
    open,
    onOpenChange,
    onValueChange,
    children,
}: {
    items: Option[];
    value: Option[];
    multiple?: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onValueChange: (value: Option[]) => void;
    children: React.ReactNode;
}) {
    return (
        <ComboboxContext.Provider
            value={{
                items,
                selected: value,
                open,
                setOpen: onOpenChange,
                toggle: (option) =>
                    onValueChange(
                        value.some(
                            (selected) => selected.value === option.value,
                        )
                            ? value.filter(
                                  (selected) => selected.value !== option.value,
                              )
                            : [...value, option],
                    ),
            }}
        >
            {children}
        </ComboboxContext.Provider>
    );
}

export function ComboboxTrigger({
    render,
}: {
    render: (props: React.ComponentProps<'button'>) => React.ReactNode;
}) {
    const { open, setOpen } = useCombobox();

    return <>{render({ type: 'button', onClick: () => setOpen(!open) })}</>;
}

export function ComboboxContent({ children }: { children: React.ReactNode }) {
    return useCombobox().open ? <div>{children}</div> : null;
}

export function ComboboxInput({
    showTrigger: _showTrigger,
    ...props
}: React.ComponentProps<'input'> & { showTrigger?: boolean }) {
    return <input {...props} />;
}

export function ComboboxEmpty({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}

export function ComboboxList({
    children,
}: {
    children: (option: Option) => React.ReactNode;
}) {
    return <div>{useCombobox().items.map(children)}</div>;
}

export function ComboboxItem({
    value,
    children,
    ...props
}: React.ComponentProps<'button'> & {
    value: Option;
}) {
    const { selected, toggle } = useCombobox();

    return (
        <button
            type="button"
            aria-pressed={selected.some(
                (option) => option.value === value.value,
            )}
            onClick={() => toggle(value)}
            {...props}
        >
            {children}
        </button>
    );
}

export function ComboboxSeparator() {
    return <hr />;
}
