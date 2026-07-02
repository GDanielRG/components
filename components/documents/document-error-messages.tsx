import { FieldError } from '@/components/ui/field';
import { cn } from '@/lib/utils';

interface DocumentErrorMessagesProps {
    messages: Array<string | undefined>;
    className?: string;
}

export function DocumentErrorMessages({
    messages,
    className,
}: DocumentErrorMessagesProps) {
    const filteredMessages = [...new Set(messages.filter(Boolean))] as string[];

    if (filteredMessages.length === 0) {
        return null;
    }

    return (
        <div className={cn('flex flex-col gap-1 pt-1', className)}>
            {filteredMessages.map((message, index) => (
                <FieldError key={`${index}-${message}`}>{message}</FieldError>
            ))}
        </div>
    );
}
