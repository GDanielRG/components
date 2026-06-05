import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function OptionalAddButton({
    children,
    buttonText,
    dataTest,
    defaultOpen = false,
    icon = <Plus data-icon="inline-start" />,
    open,
    onOpenChange,
}: {
    children: ReactNode;
    buttonText: string;
    dataTest?: string;
    defaultOpen?: boolean;
    icon?: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    return (
        <Collapsible
            defaultOpen={defaultOpen}
            open={open}
            onOpenChange={onOpenChange}
        >
            <CollapsibleTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        data-test={dataTest}
                        className="data-panel-open:hidden"
                    />
                }
            >
                {icon}
                {buttonText}
            </CollapsibleTrigger>

            <CollapsibleContent>{children}</CollapsibleContent>
        </Collapsible>
    );
}
