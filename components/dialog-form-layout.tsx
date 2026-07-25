import { XIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DialogCopy } from '@/components/types/shared-component-copy';
import { Button } from '@/components/ui/button';
import {
    CardAction,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
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
            {/* Card parts are composed without a Card root, so declare the
                --card-spacing var the refreshed card.tsx expects; without it
                the [.border-b]/[.border-t] padding computes to zero. The
                dialog-description row rule mirrors card.tsx's own
                has-data-[slot=card-description] rule, which stops matching now
                that the description is the Base UI DialogDescription. */}
            <CardHeader className="shrink-0 border-b px-6 py-5 [--card-spacing:--spacing(6)] has-data-[slot=dialog-description]:grid-rows-[auto_auto]">
                {/* Base UI derives the popup's aria-labelledby/aria-describedby
                    from these two, and their default h2/p elements keep the
                    heading semantics a CardTitle div loses. The classes
                    reproduce CardTitle/CardDescription exactly: leading-normal
                    and tracking-normal cancel DialogTitle's leading-none and
                    the app.css h2 base tracking-tight. */}
                <DialogTitle className="font-heading text-base leading-normal font-medium tracking-normal">
                    {title}
                </DialogTitle>
                {description ? (
                    <DialogDescription className="text-sm leading-snug text-muted-foreground">
                        {description}
                    </DialogDescription>
                ) : null}
                <CardAction className="flex items-center gap-1 pt-0.5">
                    {headerAction}
                    <DialogClose
                        render={
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="bg-muted shadow-none"
                            />
                        }
                    >
                        <XIcon />
                        <span className="sr-only">{copy.dialogClose}</span>
                    </DialogClose>
                </CardAction>
            </CardHeader>

            <CardContent className="min-h-0 flex-1 overflow-y-auto px-6 py-4 [--card-spacing:--spacing(6)]">
                {children}
            </CardContent>

            {footer ? (
                <CardFooter className="shrink-0 border-t bg-muted/50 px-6 py-4 [--card-spacing:--spacing(6)]">
                    <DialogFooter className="w-full">
                        {showCancelAction && (
                            <DialogClose
                                render={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                    />
                                }
                            >
                                {copy.dialogCancel}
                            </DialogClose>
                        )}

                        {footer}
                    </DialogFooter>
                </CardFooter>
            ) : null}
        </>
    );
}
