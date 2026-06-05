import { useCallback, useState } from 'react';

export interface ColumnDef<Key extends string = string> {
    key: Key;
    label: string;
}

export interface ColumnVisibilityController<Key extends string> {
    columns: readonly ColumnDef<Key>[];
    visibility: Record<Key, boolean>;
    visibleCount: number;
    isVisible: (key: Key) => boolean;
    canHide: (key: Key) => boolean;
    setVisible: (key: Key, visible: boolean) => void;
    hide: (key: Key) => void;
    show: (key: Key) => void;
    toggle: (key: Key) => void;
    headerProps: (key: Key) => { canHide: boolean; onHide: () => void };
}

type ColumnKey<Columns extends readonly ColumnDef<string>[]> =
    Columns[number]['key'];

type VisibilityState<Columns extends readonly ColumnDef<string>[]> = Record<
    ColumnKey<Columns>,
    boolean
>;

interface UseColumnVisibilityOptions<
    Columns extends readonly ColumnDef<string>[],
> {
    defaults?: Partial<VisibilityState<Columns>>;
}

export function defineColumns<
    const Columns extends readonly ColumnDef<string>[],
>(columns: Columns): Columns {
    return columns;
}

export function useColumnVisibility<
    const Columns extends readonly ColumnDef<string>[],
>(
    columns: Columns,
    options: UseColumnVisibilityOptions<Columns> = {},
): ColumnVisibilityController<ColumnKey<Columns>> {
    type Key = ColumnKey<Columns>;

    const [visibility, setVisibility] = useState<Record<Key, boolean>>(() => {
        const initialVisibility = {} as Record<Key, boolean>;

        for (const column of columns) {
            const columnKey = column.key as Key;

            initialVisibility[columnKey] =
                options.defaults?.[columnKey] ?? true;
        }

        return initialVisibility;
    });

    const getVisibleCount = useCallback(
        (value: Record<Key, boolean>): number => {
            return columns.filter(
                (column) => value[column.key as Key] !== false,
            ).length;
        },
        [columns],
    );

    const visibleCount = getVisibleCount(visibility);

    const isVisible = useCallback(
        (key: Key): boolean => {
            return visibility[key] !== false;
        },
        [visibility],
    );

    const canHide = useCallback(
        (key: Key): boolean => {
            return !isVisible(key) || visibleCount > 1;
        },
        [isVisible, visibleCount],
    );

    const setColumnVisible = useCallback(
        (key: Key, visible: boolean): void => {
            setVisibility((currentVisibility) => {
                const isColumnVisible = currentVisibility[key] !== false;

                if (isColumnVisible && !visible) {
                    const currentVisibleCount =
                        getVisibleCount(currentVisibility);

                    if (currentVisibleCount <= 1) {
                        return currentVisibility;
                    }
                }

                if ((currentVisibility[key] !== false) === visible) {
                    return currentVisibility;
                }

                return {
                    ...currentVisibility,
                    [key]: visible,
                };
            });
        },
        [getVisibleCount],
    );

    const hide = useCallback(
        (key: Key): void => {
            setColumnVisible(key, false);
        },
        [setColumnVisible],
    );

    const show = useCallback(
        (key: Key): void => {
            setColumnVisible(key, true);
        },
        [setColumnVisible],
    );

    const toggle = useCallback(
        (key: Key): void => {
            setVisibility((currentVisibility) => {
                const nextVisible = currentVisibility[key] === false;

                if (!nextVisible) {
                    const currentVisibleCount =
                        getVisibleCount(currentVisibility);

                    if (currentVisibleCount <= 1) {
                        return currentVisibility;
                    }
                }

                return {
                    ...currentVisibility,
                    [key]: nextVisible,
                };
            });
        },
        [getVisibleCount],
    );

    const headerProps = useCallback(
        (key: Key): { canHide: boolean; onHide: () => void } => {
            return {
                canHide: canHide(key),
                onHide: () => hide(key),
            };
        },
        [canHide, hide],
    );

    return {
        columns,
        visibility,
        visibleCount,
        isVisible,
        canHide,
        setVisible: setColumnVisible,
        hide,
        show,
        toggle,
        headerProps,
    };
}
