// Test double for the consumer-owned `ui/dialog.tsx`. Unlike the generic
// forwarding hosts in `../primitives`, this one wraps the REAL Base UI Dialog
// primitives and keeps the fleet's export surface: the behaviour under test —
// Base UI deriving the popup's `aria-labelledby` / `aria-describedby` from
// `Dialog.Title` / `Dialog.Description`, and their default `h2` / `p` elements —
// lives in Base UI, so a forwarding stub would prove nothing. Styling is
// dropped; only structure and semantics matter to the render gate.
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
