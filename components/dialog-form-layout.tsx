import { XIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';
import type { DialogCopy } from '../types/shared-component-copy';

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
            <CardHeader className="shrink-0 border-b px-6 py-5">
                <CardTitle>{title}</CardTitle>
                {description ? (
                    <CardDescription className="leading-snug">
                        {description}
                    </CardDescription>
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

            <CardContent className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                {children}
            </CardContent>

            {footer ? (
                <CardFooter className="shrink-0 border-t bg-muted/50 px-6 py-4">
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
