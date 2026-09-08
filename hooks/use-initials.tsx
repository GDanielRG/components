import { useCallback } from 'react';

export type GetInitialsFn = (fullName: string) => string;

export function useInitials(): GetInitialsFn {
    return useCallback((fullName: string): string => {
        const names = fullName
            .normalize('NFC')
            .trim()
            .split(/\s+/u)
            .filter(Boolean);

        if (names.length === 0) {
            return '';
        }

        if (names.length === 1) {
            return Array.from(names[0])[0].toUpperCase();
        }

        const firstInitial = Array.from(names[0])[0];
        const lastInitial = Array.from(names[names.length - 1])[0];

        return `${firstInitial}${lastInitial}`.toUpperCase();
    }, []);
}
