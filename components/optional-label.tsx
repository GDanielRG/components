import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

export default function OptionalLabel({ label }: { label?: string }) {
    const copy = useSharedComponentCopy() as {
        optionalLabel?: string;
    };
    const resolvedLabel = label ?? copy.optionalLabel ?? '(opcional)';

    return (
        <span className="text-xs text-muted-foreground">{resolvedLabel}</span>
    );
}
