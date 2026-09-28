// Real Base UI semantics let the registry's layout tests observe the accessible
// name and description supplied by its title and optional description.
import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
    return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
    return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
    return <DialogPrimitive.Portal {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
    return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ ...props }: DialogPrimitive.Backdrop.Props) {
    return <DialogPrimitive.Backdrop data-slot="dialog-overlay" {...props} />;
}

function DialogContent({ children, ...props }: DialogPrimitive.Popup.Props) {
    return (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Popup data-slot="dialog-content" {...props}>
                {children}
            </DialogPrimitive.Popup>
        </DialogPortal>
    );
}

function DialogHeader({ ...props }: React.ComponentProps<'div'>) {
    return <div data-slot="dialog-header" {...props} />;
}

function DialogFooter({ ...props }: React.ComponentProps<'div'>) {
    return <div data-slot="dialog-footer" {...props} />;
}

function DialogTitle({ ...props }: DialogPrimitive.Title.Props) {
    return <DialogPrimitive.Title data-slot="dialog-title" {...props} />;
}

function DialogDescription({ ...props }: DialogPrimitive.Description.Props) {
    return (
        <DialogPrimitive.Description
            data-slot="dialog-description"
            {...props}
        />
    );
}

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};
