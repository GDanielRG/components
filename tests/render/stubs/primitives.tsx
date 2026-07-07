// Test doubles for the STOCK shadcn primitives that the rebuilt comments /
// documents files import. These primitives are not vendored in this registry
// source repo (they install into a consumer via `shadcn add`), so the render
// gate stubs them with the smallest faithful forwarding host: it forwards
// children, className, data-* attributes (notably data-test / data-state), and
// honours the Base UI `render` prop so triggers like
// `<DropdownMenuTrigger render={<Button data-test=… />}>` still surface their
// data-test id in the DOM. The behaviour under test (gating, state→data-state)
// lives in the rebuilt files and the REAL display primitives, not here.
import * as React from 'react';

// Props the registry primitives pass that must not leak onto the DOM as invalid
// attributes (React would warn). Everything else (data-*, aria-*, className,
// onClick, href, target, rel, id, type, value, placeholder, rows, disabled,
// children) is forwarded verbatim.
const NON_DOM_PROPS = new Set([
    'variant',
    'size',
    'render',
    'asChild',
    'align',
    'side',
    'sideOffset',
    'open',
    'onOpenChange',
    'openOnHover',
    'defaultOpen',
    'disableDateTooltip',
    'contentClassName',
    'triggerLabel',
    'delayDuration',
    'clearable',
    'onValueChange',
]);

function splitProps(props: Record<string, unknown>) {
    const dom: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
        if (NON_DOM_PROPS.has(key)) continue;
        dom[key] = value;
    }
    return dom;
}

// A forwarding host. When given a Base UI `render` element, it clones that
// element and merges the host's forwardable props onto it (the real Base UI
// behaviour the trigger components rely on), so the rendered element keeps its
// own data-test id. Otherwise it renders the requested tag.
type HostProps = Record<string, unknown> & {
    render?:
        | React.ReactElement
        | ((props: Record<string, unknown>) => React.ReactNode);
    children?: React.ReactNode;
};

function makeHost(tag: keyof React.JSX.IntrinsicElements, slot: string) {
    const Host = React.forwardRef<unknown, HostProps>((props, ref) => {
        const { render, children, ...rest } = props;
        const dom = splitProps(rest);

        // Base UI also accepts a function `render` (e.g.
        // `<PopoverTrigger render={(props) => <Button {...props} />} />`).
        // Invoke it with the forwardable props so the produced trigger surfaces
        // its own data-test id / aria-label in the DOM.
        if (typeof render === 'function') {
            return <>{render({ 'data-slot': slot, ...dom })}</>;
        }

        if (React.isValidElement(render)) {
            const child = render as React.ReactElement<Record<string, unknown>>;
            return React.cloneElement(child, {
                'data-slot': slot,
                ...dom,
                ...child.props,
                children: child.props.children ?? children,
            });
        }

        return React.createElement(
            tag,
            { 'data-slot': slot, ref, ...dom },
            children,
        );
    });
    Host.displayName = `Stub(${slot})`;
    return Host;
}

// Generic exports reused across the per-module stub files.
export const Button = makeHost('button', 'button');
export const Span = makeHost('span', 'span');
export const Div = makeHost('div', 'div');

// Avatar
export const Avatar = makeHost('span', 'avatar');
export const AvatarImage = makeHost('img', 'avatar-image');
export const AvatarFallback = makeHost('span', 'avatar-fallback');
export const AvatarGroup = makeHost('div', 'avatar-group');
export const AvatarGroupCount = makeHost('div', 'avatar-group-count');

// Badge
export const Badge = makeHost('span', 'badge');

// Card
export const Card = makeHost('div', 'card');
export const CardHeader = makeHost('div', 'card-header');
export const CardTitle = makeHost('div', 'card-title');
export const CardDescription = makeHost('div', 'card-description');
export const CardContent = makeHost('div', 'card-content');
export const CardFooter = makeHost('div', 'card-footer');
export const CardAction = makeHost('div', 'card-action');

// Input / Textarea
export const Input = makeHost('input', 'input');
export const Textarea = makeHost('textarea', 'textarea');

// Field
export const Field = makeHost('div', 'field');
export const FieldGroup = makeHost('div', 'field-group');
export const FieldError = makeHost('div', 'field-error');
export const FieldLabel = makeHost('label', 'field-label');
export const FieldDescription = makeHost('div', 'field-description');

// Radio group (select-filter)
export const RadioGroup = makeHost('div', 'radio-group');
export const RadioGroupItem = makeHost('button', 'radio-group-item');

// Separator (filter triggers)
export const Separator = makeHost('div', 'separator');

// Progress
export const Progress = makeHost('div', 'progress');

// Collapsible (optional-add-button)
export const Collapsible = makeHost('div', 'collapsible');
export const CollapsibleTrigger = makeHost('button', 'collapsible-trigger');
export const CollapsibleContent = makeHost('div', 'collapsible-content');

// Input group (comment-form — not mounted, but must resolve)
export const InputGroup = makeHost('div', 'input-group');
export const InputGroupTextarea = makeHost('textarea', 'input-group-textarea');
export const InputGroupAddon = makeHost('div', 'input-group-addon');
export const InputGroupButton = makeHost('button', 'input-group-button');

// Popover — content renders inline so popover contents are queryable.
export const Popover = makeHost('div', 'popover');
export const PopoverTrigger = makeHost('button', 'popover-trigger');
export const PopoverContent = makeHost('div', 'popover-content');
export const PopoverPositioner = makeHost('div', 'popover-positioner');

// Tooltip — content renders inline.
export const Tooltip = makeHost('span', 'tooltip');
export const TooltipTrigger = makeHost('span', 'tooltip-trigger');
export const TooltipContent = makeHost('span', 'tooltip-content');
export const TooltipProvider = makeHost('span', 'tooltip-provider');

// Dropdown menu — content renders inline so menu items are queryable.
export const DropdownMenu = makeHost('div', 'dropdown-menu');
export const DropdownMenuTrigger = makeHost('button', 'dropdown-menu-trigger');
export const DropdownMenuContent = makeHost('div', 'dropdown-menu-content');
export const DropdownMenuItem = makeHost('button', 'dropdown-menu-item');
export const DropdownMenuSeparator = makeHost('div', 'dropdown-menu-separator');
export const DropdownMenuLabel = makeHost('div', 'dropdown-menu-label');
export const DropdownMenuGroup = makeHost('div', 'dropdown-menu-group');

// Alert dialog (delete-confirmation-modal) — render inline when open.
export const AlertDialog = makeHost('div', 'alert-dialog');
export const AlertDialogTrigger = makeHost('button', 'alert-dialog-trigger');
export const AlertDialogContent = makeHost('div', 'alert-dialog-content');
export const AlertDialogHeader = makeHost('div', 'alert-dialog-header');
export const AlertDialogFooter = makeHost('div', 'alert-dialog-footer');
export const AlertDialogTitle = makeHost('div', 'alert-dialog-title');
export const AlertDialogDescription = makeHost(
    'div',
    'alert-dialog-description',
);
export const AlertDialogAction = makeHost('button', 'alert-dialog-action');
export const AlertDialogCancel = makeHost('button', 'alert-dialog-cancel');
export const AlertDialogMedia = makeHost('div', 'alert-dialog-media');
export const AlertDialogPortal = ({
    children,
}: {
    children?: React.ReactNode;
}) => <>{children}</>;
