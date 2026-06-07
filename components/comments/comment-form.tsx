import { Form } from '@inertiajs/react';
import { ArrowUpIcon, LoaderCircle, SaveIcon } from 'lucide-react';
import { LoadingButton } from '@/components/loading-button';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupTextarea,
} from '@/components/ui/input-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import type { RouteDefinition } from '@/types/wayfinder';
import type {
    CommentsCopy,
    DialogCopy,
    FormCopy,
} from '../../types/shared-component-copy';

interface CommentFormProps {
    formAction: RouteDefinition<'post' | 'put' | 'patch'>;
    mode: 'create' | 'edit';
    initialValue?: string;
    onCancel?: () => void;
    autoFocus?: boolean;
}

export function CommentForm({
    formAction,
    mode,
    initialValue = '',
    onCancel,
    autoFocus = false,
}: CommentFormProps) {
    const copy: CommentsCopy & DialogCopy & FormCopy = useSharedComponentCopy();
    const isEditing = mode === 'edit';
    const showCancelableCreate = !isEditing && Boolean(onCancel);

    return (
        <Form
            key={`${mode}-${formAction.url}`}
            action={formAction}
            options={{ preserveScroll: true }}
            resetOnSuccess
            onSuccess={() => {
                onCancel?.();
            }}
        >
            {({ errors, processing, resetAndClearErrors, isDirty }) => {
                return (
                    <>
                        <InputGroup
                            className={
                                isEditing
                                    ? 'rounded-lg border-0 bg-transparent p-1.5 pb-0 shadow-none lg:border-0'
                                    : 'rounded-xl border-0 bg-background! p-2 pb-0 shadow-sm lg:border-0'
                            }
                        >
                            <InputGroupTextarea
                                name="content"
                                placeholder={
                                    isEditing
                                        ? copy.commentsPlaceholderEdit
                                        : copy.commentsPlaceholderCreate
                                }
                                defaultValue={initialValue ?? ''}
                                required
                                autoFocus={autoFocus}
                                aria-invalid={!!errors.content}
                            />

                            <InputGroupAddon
                                align="block-end"
                                className={
                                    isEditing || showCancelableCreate
                                        ? 'justify-between'
                                        : 'justify-end'
                                }
                            >
                                {isEditing && (
                                    <>
                                        <InputGroupButton
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                resetAndClearErrors();
                                                onCancel?.();
                                            }}
                                            disabled={processing}
                                            data-test="cancel-edit-comment"
                                        >
                                            {copy.dialogCancel}
                                        </InputGroupButton>

                                        <LoadingButton
                                            type="submit"
                                            className="ml-auto"
                                            processing={processing}
                                            icon={SaveIcon}
                                            disabled={!isDirty}
                                            data-test="submit-comment"
                                        >
                                            {copy.saveLabel}
                                        </LoadingButton>
                                    </>
                                )}
                                {showCancelableCreate && (
                                    <>
                                        <InputGroupButton
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                resetAndClearErrors();
                                                onCancel?.();
                                            }}
                                            disabled={processing}
                                            data-test="cancel-create-comment"
                                        >
                                            {copy.dialogCancel}
                                        </InputGroupButton>

                                        <LoadingButton
                                            type="submit"
                                            className="ml-auto"
                                            processing={processing}
                                            icon={ArrowUpIcon}
                                            disabled={!isDirty}
                                            data-test="submit-comment"
                                        >
                                            {copy.commentsSubmit}
                                        </LoadingButton>
                                    </>
                                )}
                                {!isEditing && !showCancelableCreate && (
                                    <Tooltip>
                                        <TooltipTrigger
                                            render={
                                                <InputGroupButton
                                                    type="submit"
                                                    data-test="submit-comment"
                                                    className="ml-auto size-9 rounded-full"
                                                    variant="default"
                                                    size="icon-sm"
                                                    disabled={
                                                        processing || !isDirty
                                                    }
                                                />
                                            }
                                        >
                                            {processing ? (
                                                <LoaderCircle className="animate-spin" />
                                            ) : (
                                                <ArrowUpIcon className="size-5" />
                                            )}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {isDirty
                                                ? copy.commentsSend
                                                : copy.commentsSendHint}
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </InputGroupAddon>
                        </InputGroup>

                        {errors.content && (
                            <p className="mt-1 px-2 text-xs text-destructive">
                                {errors.content}
                            </p>
                        )}
                    </>
                );
            }}
        </Form>
    );
}
