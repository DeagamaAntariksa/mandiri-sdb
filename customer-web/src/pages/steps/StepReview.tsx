import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BOX_SIZES } from '../../shared/constants';
import { Check, Info } from 'lucide-react';

const StepReview = () => {
    const { register, watch, formState: { errors } } = useFormContext();
    const { t } = useTranslation();
    const data = watch();
    const isAgreed = watch('agreed');

    const boxLabel = BOX_SIZES.find(b => b.id === data.boxSize)?.label || '-';

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('customer_form.step_6')}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{t('apply.review_subtitle')}</p>
            </div>

            <div className="space-y-8 bg-gray-50/50 dark:bg-gray-800/50 p-6 lg:p-8 rounded-3xl border border-gray-100 dark:border-gray-700">
                <section className="space-y-4">
                    <h4 className="flex items-center gap-2 font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs py-2 px-1 border-b border-gray-200 dark:border-gray-700">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" /> {t('customer_form.step_1')}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                        <DataRow label={t('customer_form.full_name')} value={data.fullName} />
                        <DataRow label={t('customer_form.nik')} value={data.nik} />
                        <DataRow label={t('customer_form.email')} value={data.email} />
                        <DataRow label={t('customer_form.phone')} value={data.phone} />
                        <DataRow label={t('customer_form.account_number')} value={data.accountNumber} />
                        <DataRow label={t('customer_form.account_type')} value={data.accountType} />
                        <DataRow label={t('customer_form.credit_card_type')} value={data.creditCardType} />
                        <DataRow label={t('customer_form.address')} value={data.address} className="sm:col-span-2" />
                    </div>
                </section>

                <section className="space-y-4">
                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs py-2 px-1 border-b border-gray-200 dark:border-gray-700">{t('customer_form.step_2')}</h4>
                    <div className="flex items-center gap-4 bg-blue-600 dark:bg-blue-700 text-white p-6 rounded-2xl shadow-lg dark:shadow-none shadow-blue-200">
                        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl font-black">
                            {boxLabel}
                        </div>
                        <div>
                            <p className="font-black text-lg"> {t('box_sizes.type_label', { label: boxLabel })}</p>
                            <p className="text-blue-100/80 text-xs font-bold mb-1">Rp {BOX_SIZES.find(b => b.id === data.boxSize)?.price.toLocaleString('id-ID')} / tahun</p>
                            <p className="text-blue-100 text-sm">{t(`box_sizes.box_size_${data.boxSize}_desc`)}</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs py-2 px-1 border-b border-gray-200 dark:border-gray-700">{t('customer_form.step_3')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl">
                            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Ruangan</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white">Ruangan {data.boxRoom || '-'}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl">
                            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Nomor Box</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white">Box #{data.boxNumber || '-'}</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs py-2 px-1 border-b border-gray-200 dark:border-gray-700">{t('customer_form.step_4')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {data.ktpImage instanceof File && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('customer_form.ktp_photo')}</p>
                                <div className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-3">
                                    <img src={URL.createObjectURL(data.ktpImage)} alt="KTP" className="max-h-32 w-full object-cover rounded-xl" />
                                </div>
                            </div>
                        )}
                        {data.passbookImage instanceof File && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('customer_form.passbook_photo')}</p>
                                <div className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-3">
                                    <img src={URL.createObjectURL(data.passbookImage)} alt="Passbook" className="max-h-32 w-full object-cover rounded-xl" />
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {data.signature instanceof File && (
                    <section className="space-y-4">
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs py-2 px-1 border-b border-gray-200 dark:border-gray-700">{t('customer_form.step_5')}</h4>
                        <div className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-4">
                            <img
                                src={URL.createObjectURL(data.signature)}
                                alt="Signature"
                                className="max-h-24 object-contain mx-auto dark:invert"
                            />
                        </div>
                    </section>
                )}

                <div className="pt-6">
                    <label className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all group cursor-pointer ${isAgreed ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10' : 'border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-600 dark:hover:border-blue-500'}`}>
                        <div className={`min-w-[28px] h-7 rounded-lg border-2 flex items-center justify-center transition-all ${isAgreed ? 'bg-blue-600 border-blue-600' : 'border-gray-200 dark:border-gray-700 group-hover:border-blue-600 dark:group-hover:border-blue-500'}`}>
                            {isAgreed && <Check className="w-4 h-4 text-white font-black" />}
                        </div>
                        <span className="text-sm lg:text-base font-bold text-gray-700 dark:text-gray-300 leading-tight">
                            {t('customer_form.confirmation')}
                        </span>
                        <input type="checkbox" {...register('agreed')} className="hidden" />
                    </label>
                    {errors.agreed && (
                        <p className="text-red-500 dark:text-red-400 text-xs font-bold mt-2 px-6">{errors.agreed.message as string}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const DataRow = ({ label, value, className = '' }: { label: string, value: string, className?: string }) => (
    <div className={className}>
        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter mb-1">{label}</p>
        <p className="text-gray-900 dark:text-white font-bold break-words">{value || '-'}</p>
    </div>
);

export default StepReview;
