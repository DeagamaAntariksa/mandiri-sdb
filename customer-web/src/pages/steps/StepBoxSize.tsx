import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import { BOX_SIZES } from '../../shared/constants';
import { CheckCircle2 } from 'lucide-react';

const StepBoxSize = () => {
    const { setValue, watch, formState: { errors } } = useFormContext();
    const { t } = useTranslation();
    const selectedSize = watch('boxSize');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('box_sizes.title')}</h3>
                <p className="text-gray-500 dark:text-gray-400">{t('box_sizes.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {BOX_SIZES.map((box) => (
                    <Card
                        key={box.id}
                        selected={selectedSize === box.id}
                        onClick={() => setValue('boxSize', box.id, { shouldValidate: true })}
                        className="flex flex-col items-center text-center p-8 relative overflow-hidden group dark:bg-gray-800 dark:border-gray-700"
                    >
                        {selectedSize === box.id && (
                            <div className="absolute top-4 right-4 text-blue-600 dark:text-blue-400 animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-8 h-8 fill-blue-50 dark:fill-blue-900/20" />
                            </div>
                        )}

                        <div className={`
              w-24 h-24 rounded-3xl mb-6 flex items-center justify-center transition-all duration-500
              ${selectedSize === box.id ? 'bg-blue-600 text-white scale-110 rotate-3' : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-400 dark:group-hover:text-blue-300'}
            `}>
                            <span className="text-4xl font-black">{box.label}</span>
                        </div>

                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
                            {t('box_sizes.type_label', { label: box.label })}
                        </h4>
                        <p className="text-blue-600 dark:text-blue-400 font-black text-lg mb-4">
                            Rp {box.price.toLocaleString('id-ID')}
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium ml-1">/ tahun</span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium px-2">
                            {t(`box_sizes.${box.description_key}`)}
                        </p>
                    </Card>
                ))}
            </div>

            {errors.boxSize && (
                <p className="text-red-500 dark:text-red-400 text-center font-bold animate-bounce mt-4">
                    {errors.boxSize.message as string}
                </p>
            )}
        </div>
    );
};

export default StepBoxSize;
