import { XIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DialogCopy } from '@/components/types/shared-component-copy';
import { Button } from '@/components/ui/button';
import {
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

interface DialogFormLayoutProps {
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    showCancelAction?: boolean;
    /**
     * Optional element rendered in the header next to the close button.
     * Use for discoverable secondary actions like history / activity.
     */
    headerAction?: ReactNode;
}

export function DialogFormLayout({
    title,
    description,
    children,
    footer,
    showCancelAction = true,
    headerAction,
}: DialogFormLayoutProps) {
    const copy: DialogCopy = useSharedComponentCopy();

    return (
        <>
            <div className="grid shrink-0 auto-rows-min grid-cols-[1fr_auto] items-start gap-1.5 border-b px-6 pt-5 pb-6">
                {/* Base UI derives the popup's aria-labelledby/aria-describedby
                    from these two, and their default h2/p elements keep the
                    heading semantics a plain div loses. The classes reproduce
                    the card title/description scale: leading-normal and
                    tracking-normal cancel DialogTitle's leading-none and the
                    app.css h2 base tracking-tight. */}
                <DialogTitle className="font-heading text-base leading-normal font-medium tracking-normal">
                    {title}
                </DialogTitle>
                {description ? (
                    <DialogDescription className="text-sm leading-snug text-muted-foreground">
                        {description}
                    </DialogDescription>
                ) : null}
                <div className="col-start-2 row-span-2 row-start-1 flex items-center gap-1 self-start justify-self-end pt-0.5">
                    {headerAction}
                    <DialogClose
                        render={
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="bg-muted"
                            />
                        }
                    >
                        <XIcon />
                        <span className="sr-only">{copy.dialogClose}</span>
                    </DialogClose>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                {children}
            </div>

            {footer ? (
                <div className="flex shrink-0 items-center rounded-b-4xl border-t bg-muted/50 px-6 pt-6 pb-4">
                    <DialogFooter className="w-full">
                        {showCancelAction && (
                            <DialogClose
                                render={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                        data-test="dialog-cancel"
                                    />
                                }
                            >
                                {copy.dialogCancel}
                            </DialogClose>
                        )}

                        {footer}
                    </DialogFooter>
                </div>
            ) : null}
        </>
    );
}
