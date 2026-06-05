export default function OptionalLabel({
    label = '(opcional)',
}: {
    label?: string;
}) {
    return <span className="text-xs text-muted-foreground">{label}</span>;
}
