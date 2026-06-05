import { SaveIcon } from 'lucide-react';
import LoadingButton from '@/components/loading-button';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

export default function SaveSubmitButton({
    processing,
    label,
    dataTest = 'save-button',
}: {
    processing: boolean;
    label?: string;
    dataTest?: string;
}) {
    const copy = useSharedComponentCopy() as {
        saveLabel?: string;
    };
    const resolvedLabel = label ?? copy.saveLabel ?? 'Guardar';

    return (
        <div className="col-span-full flex justify-end">
            <LoadingButton
                type="submit"
                className="max-sm:w-full"
                processing={processing}
                icon={SaveIcon}
                data-test={dataTest}
            >
                {resolvedLabel}
            </LoadingButton>
        </div>
    );
}
