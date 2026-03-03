import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Camera, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import CameraCapture from '../../components/CameraCapture';

const StepUpload = () => {
    const { setValue, watch, formState: { errors } } = useFormContext();
    const { t } = useTranslation();
    const [activeCapture, setActiveCapture] = useState<'ktp' | 'passbook' | null>(null);

    const ktpImage = watch('ktpImage');
    const passbookImage = watch('passbookImage');

    const handleCapture = (blob: Blob) => {
        if (activeCapture) {
            const file = new File([blob], `${activeCapture}.jpg`, { type: 'image/jpeg' });
            setValue(activeCapture === 'ktp' ? 'ktpImage' : 'passbookImage', file, { shouldValidate: true });
            setActiveCapture(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'ktpImage' | 'passbookImage') => {
        if (e.target.files && e.target.files[0]) {
            setValue(field, e.target.files[0], { shouldValidate: true });
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('customer_form.step_4')}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{t('apply.upload.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* KTP Upload */}
                <UploadCard
                    label={t('customer_form.ktp_photo')}
                    image={ktpImage}
                    onCamera={() => setActiveCapture('ktp')}
                    onFileChange={(e) => handleFileChange(e, 'ktpImage')}
                    onRemove={() => setValue('ktpImage', null)}
                    error={errors.ktpImage?.message as string}
                    t={t}
                />

                {/* Passbook Upload */}
                <UploadCard
                    label={t('customer_form.passbook_photo')}
                    image={passbookImage}
                    onCamera={() => setActiveCapture('passbook')}
                    onFileChange={(e) => handleFileChange(e, 'passbookImage')}
                    onRemove={() => setValue('passbookImage', null)}
                    error={errors.passbookImage?.message as string}
                    t={t}
                />
            </div>

            {activeCapture && (
                <CameraCapture
                    onCapture={handleCapture}
                    onClose={() => setActiveCapture(null)}
                />
            )}
        </div>
    );
};

interface UploadCardProps {
    label: string;
    image: File | null;
    onCamera: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    error?: string;
    t: any;
}

const UploadCard: React.FC<UploadCardProps> = ({ label, image, onCamera, onFileChange, onRemove, error, t }) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (image) {
            const url = URL.createObjectURL(image);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreview(null);
        }
    }, [image]);

    return (
        <Card className={`relative flex flex-col items-center p-8 border-dashed border-4 dark:bg-gray-800 ${error ? 'border-red-200 bg-red-50/30 dark:border-red-900/30 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-700'}`}>
            <span className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6 bg-white dark:bg-gray-800 px-4 -mt-11">{label}</span>

            {!image ? (
                <div className="flex flex-col items-center gap-4 w-full">
                    <button
                        type="button"
                        onClick={onCamera}
                        className="w-full flex items-center justify-center gap-3 py-6 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                    >
                        <Camera className="w-6 h-6" /> {t('customer_form.capture_photo')}
                    </button>

                    <label className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all active:scale-95">
                        <ImageIcon className="w-6 h-6" /> {t('customer_form.gallery')}
                        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                    </label>
                </div>
            ) : (
                <div className="w-full space-y-4">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center relative group">
                        <img src={preview || ''} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={onRemove}
                                className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                            >
                                <Trash2 className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {t('apply.upload.success')}
                        </div>
                    </div>
                    <Button variant="outline" fullWidth onClick={onRemove} className="text-red-500 border-red-50 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10">
                        {t('apply.upload.change')}
                    </Button>
                </div>
            )}

            {error && (
                <div className="mt-4 flex items-center gap-2 text-red-500 dark:text-red-400 text-sm font-bold bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-red-100 dark:border-red-900/50">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </Card>
    );
};

export default StepUpload;
