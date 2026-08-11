// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ArchiveConfirmationForm } from '@/components/archive-confirmation-form';

const { capturedFormProps, toastError } = vi.hoisted(() => ({
    capturedFormProps: {
        current: null as null | {
            onError: (errors: Record<string, string>) => void;
        },
    },
    toastError: vi.fn(),
}));

vi.mock('@inertiajs/react', () => ({
    Form: ({
        children,
        ...props
    }: {
        children: (state: {
            processing: boolean;
            submit: () => void;
        }) => ReactNode;
        onError: (errors: Record<string, string>) => void;
    }) => {
        capturedFormProps.current = props;

        return <>{children({ processing: false, submit: vi.fn() })}</>;
    },
}));

vi.mock('sonner', () => ({
    toast: { error: toastError },
}));

afterEach(() => {
    cleanup();
    capturedFormProps.current = null;
    vi.clearAllMocks();
});

describe('ArchiveConfirmationForm — validation errors', () => {
    it('surfaces the first error, closes the modal, and preserves the caller callback', () => {
        const onOpenChange = vi.fn();
        const onError = vi.fn();
        const errors = { archive: 'This record still has active dependants.' };

        render(
            <ArchiveConfirmationForm
                action={{ url: '/things/1', method: 'delete' }}
                open
                onOpenChange={onOpenChange}
                onError={onError}
                title="Archive thing"
                description="Archive this thing?"
            />,
        );

        capturedFormProps.current?.onError(errors);

        expect(toastError).toHaveBeenCalledWith(errors.archive);
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(onError).toHaveBeenCalledWith(errors);
    });
});
