import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const StepPersonalInfo = () => {
    const { register, formState: { errors } } = useFormContext();
    const { t } = useTranslation();

    const inputStyles = "w-full px-5 py-4 rounded-xl border-2 transition-all outline-none focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/10 focus:border-blue-600 dark:focus:border-blue-500 min-h-[56px] text-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white dark:border-gray-700";
    const labelStyles = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 px-1 uppercase tracking-wider";
    const errorStyles = "text-red-500 dark:text-red-400 text-sm font-bold mt-2 px-1 animate-in fade-in slide-in-from-top-1";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className={labelStyles}>{t('customer_form.full_name')}</label>
                    <input
                        {...register('fullName')}
                        className={`${inputStyles} ${errors.fullName ? 'border-red-500 ring-red-50 dark:ring-red-900/10' : 'border-gray-100 dark:border-gray-700'}`}
                        placeholder={t('customer_form.placeholders.full_name')}
                    />
                    {errors.fullName && <p className={errorStyles}>{errors.fullName.message as string}</p>}
                </div>

                <div>
                    <label className={labelStyles}>{t('customer_form.nik')}</label>
                    <input
                        {...register('nik')}
                        maxLength={16}
                        className={`${inputStyles} ${errors.nik ? 'border-red-500 ring-red-50 dark:ring-red-900/10' : 'border-gray-100 dark:border-gray-700'}`}
                        placeholder={t('customer_form.placeholders.nik')}
                    />
                    {errors.nik && <p className={errorStyles}>{errors.nik.message as string}</p>}
                </div>

                <div>
                    <label className={labelStyles}>{t('customer_form.phone')}</label>
                    <input
                        {...register('phone')}
                        className={`${inputStyles} ${errors.phone ? 'border-red-500 ring-red-50 dark:ring-red-900/10' : 'border-gray-100 dark:border-gray-700'}`}
                        placeholder={t('customer_form.placeholders.phone')}
                    />
                    {errors.phone && <p className={errorStyles}>{errors.phone.message as string}</p>}
                </div>

                <div className="md:col-span-2">
                    <label className={labelStyles}>{t('customer_form.email')}</label>
                    <input
                        {...register('email')}
                        className={`${inputStyles} ${errors.email ? 'border-red-500 ring-red-50 dark:ring-red-900/10' : 'border-gray-100 dark:border-gray-700'}`}
                        placeholder={t('customer_form.placeholders.email')}
                    />
                    {errors.email && <p className={errorStyles}>{errors.email.message as string}</p>}
                </div>

                <div className="md:col-span-2">
                    <label className={labelStyles}>{t('customer_form.address')}</label>
                    <textarea
                        {...register('address')}
                        rows={3}
                        className={`${inputStyles} ${errors.address ? 'border-red-500 ring-red-50 dark:ring-red-900/10' : 'border-gray-100 dark:border-gray-700'} resize-none`}
                        placeholder={t('customer_form.placeholders.address')}
                    />
                    {errors.address && <p className={errorStyles}>{errors.address.message as string}</p>}
                </div>

                <div className="md:col-span-2">
                    <label className={labelStyles}>{t('customer_form.account_number')}</label>
                    <input
                        {...register('accountNumber')}
                        maxLength={13}
                        className={`${inputStyles} ${errors.accountNumber ? 'border-red-500 ring-red-50 dark:ring-red-900/10' : 'border-gray-100 dark:border-gray-700'}`}
                        placeholder={t('customer_form.placeholders.account_number')}
                    />
                    {errors.accountNumber && <p className={errorStyles}>{errors.accountNumber.message as string}</p>}
                </div>

                <div className="md:col-span-1">
                    <label className={labelStyles}>{t('customer_form.account_type')}</label>
                    <select
                        {...register('accountType')}
                        className={`${inputStyles} ${errors.accountType ? 'border-red-500 ring-red-50 dark:ring-red-900/10' : 'border-gray-100 dark:border-gray-700'}`}
                    >
                        <option value="">{t('customer_form.options.select_account')}</option>
                        <option value="Tabungan Now">{t('customer_form.options.account_types.now')}</option>
                        <option value="Tabungan Payroll">{t('customer_form.options.account_types.payroll')}</option>
                        <option value="Tabungan Rencana">{t('customer_form.options.account_types.rencana')}</option>
                        <option value="Mandiri Prioritas">{t('customer_form.options.account_types.prioritas')}</option>
                        <option value="Lainnya">{t('customer_form.options.account_types.other')}</option>
                    </select>
                    {errors.accountType && <p className={errorStyles}>{errors.accountType.message as string}</p>}
                </div>

                <div className="md:col-span-1">
                    <label className={labelStyles}>{t('customer_form.credit_card_type')}</label>
                    <select
                        {...register('creditCardType')}
                        className={`${inputStyles} ${errors.creditCardType ? 'border-red-500 ring-red-50 dark:ring-red-900/10' : 'border-gray-100 dark:border-gray-700'}`}
                    >
                        <option value="">{t('customer_form.options.select_credit_card')}</option>
                        <option value="Mandiri Signature">{t('customer_form.options.cc_types.signature')}</option>
                        <option value="Mandiri Precious">{t('customer_form.options.cc_types.precious')}</option>
                        <option value="Mandiri Skyz">{t('customer_form.options.cc_types.skyz')}</option>
                        <option value="Mandiri Everyday">{t('customer_form.options.cc_types.everyday')}</option>
                        <option value="Bukan Pengguna CC">{t('customer_form.options.cc_types.none')}</option>
                        <option value="Lainnya">{t('customer_form.options.cc_types.other')}</option>
                    </select>
                    {errors.creditCardType && <p className={errorStyles}>{errors.creditCardType.message as string}</p>}
                </div>
            </div>
        </div>
    );
};

export default StepPersonalInfo;
