import { SaveIcon } from 'lucide-react';
import LoadingButton from '@/components/loading-button';

export default function SaveSubmitButton({
    processing,
    label = 'Guardar',
    dataTest = 'save-button',
}: {
    processing: boolean;
    label?: string;
    dataTest?: string;
}) {
    return (
        <div className="col-span-full flex justify-end">
            <LoadingButton
                type="submit"
                className="max-sm:w-full"
                processing={processing}
                icon={SaveIcon}
                data-test={dataTest}
            >
                {label}
            </LoadingButton>
        </div>
    );
}
