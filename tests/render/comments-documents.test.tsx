// @vitest-environment jsdom
//
// Render-level regression gate for the W2 shadcn rebuild of the comments and
// documents surfaces. This mounts the REAL rebuilt components (CommentList,
// DocumentsPanelItem, DocumentItem) and the REAL chat-display primitive
// (Attachment) — only the stock shadcn primitives and the two consumer-owned
// contracts are stubbed (see tests/render/stubs + vitest.config.ts). It proves:
//   1. the behavioural data-test ids survive the rebuild;
//   2. the can_be_managed edit/delete gating renders when allowed and is omitted
//      when not;
//   3. a document row's `state` surfaces as data-state for uploading vs error.
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommentTypingIndicator } from '@/components/activity/comment-typing-indicator';
import { CommentForm } from '@/components/comments/comment-form';
import { CommentList } from '@/components/comments/comment-list';
import type { Comment } from '@/components/comments/types';
import { DocumentItem } from '@/components/documents/document-item';
import { DocumentsPanelItem } from '@/components/documents/documents-panel-item';
import type {
    DocumentData,
    ExistingDocumentData,
} from '@/components/documents/types';
import { Attachment } from '@/components/ui/attachment';

afterEach(cleanup);

const route = (verb: string) => (id: number) => ({
    url: `/x/${id}`,
    method: verb,
});
const updateCommentForm = route('put') as never;
const destroyCommentForm = route('delete') as never;

function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 1,
        content: 'A first comment',
        can_be_managed: true,
        formatted_created_at: 'Jan 1, 2026 10:00',
        formatted_created_at_diff: '2 days ago',
        author: { name: 'Ada Lovelace' },
        ...overrides,
    };
}

function makeExistingDocument(
    overrides: Partial<ExistingDocumentData> = {},
): ExistingDocumentData {
    return {
        id: 7,
        name: 'Contract',
        description: null,
        path: 'contract.pdf',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
        formatted_created_at: 'Jan 1, 2026',
        formatted_created_at_diff: '2 days ago',
        formatted_updated_at: 'Jan 2, 2026',
        formatted_updated_at_diff: 'yesterday',
        can_be_deleted: true,
        ...overrides,
    };
}

describe('CommentList — rebuilt comments surface', () => {
    it('renders a manageable comment with the actions trigger and edit/delete items', () => {
        render(
            <CommentList
                comments={[makeComment()]}
                updateFormAction={updateCommentForm as never}
                onEdit={() => {}}
                onCancelEdit={() => {}}
                destroyFormAction={destroyCommentForm}
            />,
        );

        // Author + content render.
        expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
        expect(screen.getByText('A first comment')).toBeInTheDocument();

        // Gating ON → actions trigger + edit + delete items present.
        expect(screen.getByTestId('comment-actions')).toBeInTheDocument();
        expect(screen.getByTestId('edit-comment')).toBeInTheDocument();
        expect(screen.getByTestId('delete-comment')).toBeInTheDocument();
    });

    it('omits the actions trigger and edit/delete items when the comment is not manageable', () => {
        render(
            <CommentList
                comments={[
                    makeComment({
                        id: 2,
                        can_be_managed: false,
                        content: 'Locked comment',
                    }),
                ]}
                updateFormAction={updateCommentForm as never}
                onEdit={() => {}}
                onCancelEdit={() => {}}
                destroyFormAction={destroyCommentForm}
            />,
        );

        expect(screen.getByText('Locked comment')).toBeInTheDocument();
        // Gating OFF → no actions affordances at all.
        expect(screen.queryByTestId('comment-actions')).toBeNull();
        expect(screen.queryByTestId('edit-comment')).toBeNull();
        expect(screen.queryByTestId('delete-comment')).toBeNull();
    });

    it('suppresses row actions while editing and renders the inline edit form', () => {
        render(
            <CommentList
                comments={[makeComment({ id: 3 })]}
                updateFormAction={updateCommentForm as never}
                editingCommentId={3}
                onEdit={() => {}}
                onCancelEdit={() => {}}
                destroyFormAction={destroyCommentForm}
            />,
        );

        expect(screen.queryByTestId('comment-actions')).toBeNull();
        expect(screen.queryByTestId('edit-comment')).toBeNull();
        expect(screen.queryByTestId('delete-comment')).toBeNull();
        expect(
            screen.getAllByTestId('cancel-edit-comment').length,
        ).toBeGreaterThanOrEqual(1);
        expect(screen.getByTestId('submit-comment')).toBeInTheDocument();
    });

    it('marks current-user comments as end-aligned for bubble rendering', () => {
        render(
            <CommentList
                comments={[
                    makeComment({
                        id: 4,
                        content: 'My own note',
                        is_current_user: true,
                    }),
                ]}
            />,
        );

        const message = document.querySelector('[data-slot="message"]');
        expect(message).toHaveAttribute('data-align', 'end');
        expect(screen.getByText('My own note')).toBeInTheDocument();
    });
});

describe('DocumentsPanelItem — rebuilt document row', () => {
    it('renders the per-row actions trigger when deletable and reflects the done state by default', () => {
        const doc = makeExistingDocument();
        render(
            <DocumentsPanelItem
                document={doc}
                updateDocumentAction={route('put') as never}
                showDocumentAction={route('get') as never}
                onDelete={() => {}}
            />,
        );

        const actions = screen.getByTestId(`document-item-actions-${doc.id}`);
        expect(actions).toBeInTheDocument();

        // The row composes the real Attachment primitive; with no error and no
        // in-flight upload it sits in the `done` state.
        const attachment = document.querySelector('[data-slot="attachment"]');
        expect(attachment).not.toBeNull();
        expect(attachment).toHaveAttribute('data-state', 'done');

        // The display name surfaces.
        expect(screen.getByText('Contract.pdf')).toBeInTheDocument();
    });

    it('still renders the row (and its actions trigger) when not deletable', () => {
        const doc = makeExistingDocument({ id: 9, can_be_deleted: false });
        render(
            <DocumentsPanelItem
                document={doc}
                updateDocumentAction={route('put') as never}
                showDocumentAction={route('get') as never}
                // no onDelete → the destructive item is gated out, but the row
                // and its other actions remain.
            />,
        );

        expect(
            screen.getByTestId(`document-item-actions-${doc.id}`),
        ).toBeInTheDocument();
    });
});

describe('DocumentItem — rebuilt form-section row state mapping', () => {
    const baseDoc: DocumentData = {
        tempId: 't1',
        file: new File(['x'], 'invoice.pdf', { type: 'application/pdf' }),
    };

    it('maps a field error to the error state', () => {
        render(
            <DocumentItem
                document={baseDoc}
                onUpdate={() => {}}
                onDelete={() => {}}
                nameError="Name is required"
            />,
        );

        const attachment = document.querySelector('[data-slot="attachment"]');
        expect(attachment).toHaveAttribute('data-state', 'error');
    });

    it('maps no errors to the idle state', () => {
        render(
            <DocumentItem
                document={baseDoc}
                onUpdate={() => {}}
                onDelete={() => {}}
            />,
        );

        const attachment = document.querySelector('[data-slot="attachment"]');
        expect(attachment).toHaveAttribute('data-state', 'idle');
    });
});

describe('Attachment — uploading vs error state contract the rows rely on', () => {
    it('surfaces the uploading state as data-state', () => {
        render(<Attachment state="uploading">uploading row</Attachment>);
        const attachment = document.querySelector('[data-slot="attachment"]');
        expect(attachment).toHaveAttribute('data-state', 'uploading');
    });

    it('surfaces the error state as data-state', () => {
        render(<Attachment state="error">error row</Attachment>);
        const attachment = document.querySelector('[data-slot="attachment"]');
        expect(attachment).toHaveAttribute('data-state', 'error');
    });
});

describe('CommentForm — typing hook callbacks', () => {
    const storeForm = route('post') as never;

    it('notifies focus, content change, and blur without controlling the input', () => {
        const onContentChange = vi.fn();
        const onContentFocus = vi.fn();
        const onContentBlur = vi.fn();
        render(
            <CommentForm
                formAction={storeForm}
                mode="create"
                onContentChange={onContentChange}
                onContentFocus={onContentFocus}
                onContentBlur={onContentBlur}
            />,
        );

        const textarea = document.querySelector(
            'textarea[name="content"]',
        ) as HTMLTextAreaElement;
        expect(textarea).not.toBeNull();

        fireEvent.focus(textarea);
        fireEvent.change(textarea, { target: { value: 'escribiendo' } });
        fireEvent.blur(textarea);

        expect(onContentFocus).toHaveBeenCalledTimes(1);
        expect(onContentChange).toHaveBeenCalledWith('escribiendo');
        expect(onContentBlur).toHaveBeenCalledTimes(1);
        // Uncontrolled: the DOM value tracks user input, not a React state echo.
        expect(textarea.value).toBe('escribiendo');
    });

    it('does not throw when typing callbacks are omitted', () => {
        render(<CommentForm formAction={storeForm} mode="create" />);

        const textarea = document.querySelector(
            'textarea[name="content"]',
        ) as HTMLTextAreaElement;

        expect(() => {
            fireEvent.focus(textarea);
            fireEvent.change(textarea, { target: { value: 'hola' } });
            fireEvent.blur(textarea);
        }).not.toThrow();
    });
});

describe('CommentTypingIndicator — ephemeral typing affordance', () => {
    it('renders no DOM for an empty user list', () => {
        const { container } = render(<CommentTypingIndicator users={[]} />);

        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByTestId('comment-typing-indicator')).toBeNull();
    });

    it('renders grouped avatars and a shimmering localized line for typers', () => {
        render(
            <CommentTypingIndicator
                users={[
                    { id: 1, name: 'Ana Lopez' },
                    { id: 2, name: 'Beto Ruiz' },
                ]}
            />,
        );

        expect(
            screen.getByTestId('comment-typing-indicator'),
        ).toBeInTheDocument();

        // Initials fall back into the avatar group (no avatar URL provided).
        expect(screen.getByText('AL')).toBeInTheDocument();
        expect(screen.getByText('BR')).toBeInTheDocument();

        // The text line shimmers and is fed the names (the test copy proxy echoes
        // the key + args), never email or draft content.
        const markerContent = document.querySelector(
            '[data-slot="marker-content"]',
        );
        expect(markerContent).toHaveClass('shimmer');
        expect(markerContent).toHaveTextContent(
            'commentsTyping:Ana Lopez,Beto Ruiz',
        );
    });

    it('stays mounted through its leave transition, keeping the last roster, then unmounts', () => {
        vi.useFakeTimers();

        try {
            const { rerender } = render(
                <CommentTypingIndicator
                    users={[{ id: 1, name: 'Ana Lopez' }]}
                />,
            );

            expect(
                screen.getByTestId('comment-typing-indicator'),
            ).toHaveAttribute('data-state', 'open');

            // Roster empties: the row must not vanish — it flips to `closed` and
            // keeps showing the last typer while it animates out.
            rerender(<CommentTypingIndicator users={[]} />);

            const closing = screen.getByTestId('comment-typing-indicator');
            expect(closing).toHaveAttribute('data-state', 'closed');
            expect(closing).toHaveTextContent('commentsTyping:Ana Lopez');

            // After the transition window it unmounts, leaving an empty container
            // (the parent list item is `empty:hidden`, so no gap remains).
            act(() => {
                vi.advanceTimersByTime(700);
            });

            expect(screen.queryByTestId('comment-typing-indicator')).toBeNull();
        } finally {
            vi.useRealTimers();
        }
    });

    it('caps avatars at three and surfaces overflow as a count', () => {
        render(
            <CommentTypingIndicator
                users={[
                    { id: 1, name: 'Ana Uno' },
                    { id: 2, name: 'Beto Dos' },
                    { id: 3, name: 'Caro Tres' },
                    { id: 4, name: 'Dani Cuatro' },
                    { id: 5, name: 'Eva Cinco' },
                ]}
            />,
        );

        expect(document.querySelectorAll('[data-slot="avatar"]').length).toBe(
            3,
        );
        expect(
            document.querySelector('[data-slot="avatar-group-count"]'),
        ).toHaveTextContent('+2');
    });
});
