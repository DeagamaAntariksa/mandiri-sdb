import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import Stepper from '../components/Stepper';
import Button from '../components/Button';
import StepPersonalInfo from './steps/StepPersonalInfo';
import StepBoxSize from './steps/StepBoxSize';
import StepBoxSelection from './steps/StepBoxSelection';
import StepUpload from './steps/StepUpload';
import StepSignature from './steps/StepSignature';
import StepReview from './steps/StepReview';
import { submitApplication } from '../services/mockService';

const ApplyPage = () => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const schema = z.object({
        fullName: z.string().min(3, t('customer_form.validation.name_min')),
        nik: z.string().length(16, t('customer_form.validation.nik_len')),
        phone: z.string().min(10, t('customer_form.validation.phone_min')),
        email: z.string().email(t('customer_form.validation.email_invalid')),
        address: z.string().min(10, t('customer_form.validation.address_min')),
        accountNumber: z.string().length(13, t('customer_form.validation.account_mandiri_len')),
        accountType: z.string().min(1, t('customer_form.validation.select_account')),
        creditCardType: z.string().min(1, t('customer_form.validation.select_credit_card')),
        boxSize: z.string().min(1, t('customer_form.validation.select_box')),
        boxRoom: z.string().min(1, t('apply.validation.select_room')),
        boxNumber: z.string().min(1, t('apply.validation.select_box_number')),
        ktpImage: z.any().refine((file) => file instanceof File, t('customer_form.validation.ktp_required')),
        passbookImage: z.any().refine((file) => file instanceof File, t('customer_form.validation.passbook_required')),
        signature: z.any().refine((file) => file instanceof File, t('customer_form.validation.signature_required')),
        agreed: z.boolean().refine((val) => val === true, t('customer_form.validation.agreed_required')),
    });

    const methods = useForm({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            fullName: '',
            nik: '',
            phone: '',
            email: '',
            address: '',
            accountNumber: '',
            accountType: '',
            creditCardType: '',
            boxSize: '',
            boxRoom: '',
            boxNumber: '',
            ktpImage: null,
            passbookImage: null,
            signature: null,
            agreed: false,
        }
    });

    const { handleSubmit, trigger, getValues } = methods;

    const steps = [
        t('customer_form.step_1'),
        t('customer_form.step_2'),
        t('customer_form.step_3'),
        t('customer_form.step_4'),
        t('customer_form.step_5'),
        t('customer_form.step_6'),
    ];

    const nextStep = async () => {
        let fields: any[] = [];
        if (currentStep === 1) fields = ['fullName', 'nik', 'phone', 'email', 'address', 'accountNumber', 'accountType', 'creditCardType'];
        if (currentStep === 2) fields = ['boxSize'];
        if (currentStep === 3) fields = ['boxRoom', 'boxNumber'];
        if (currentStep === 4) fields = ['ktpImage', 'passbookImage'];
        if (currentStep === 5) fields = ['signature'];
        if (currentStep === 6) fields = ['agreed'];

        const isValid = await trigger(fields);
        if (isValid) {
            setCurrentStep(s => s + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep(s => s - 1);
    };

    const onFormSubmit = async () => {
        setIsSubmitting(true);
        try {
            const data = getValues();
            const result = await submitApplication(data);
            if (result?.success) {
                toast.success(t('apply.success_toast'));
                navigate('/success', { state: { trackingCode: result.trackingCode } });
            }
        } catch (error) {
            toast.error(t('apply.error_toast'));
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const TOTAL_STEPS = 6;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 dark:bg-gray-900 min-h-screen">
            <div className="text-center space-y-3">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{t('apply.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{t('apply.subtitle', { count: TOTAL_STEPS })}</p>
            </div>

            <Stepper steps={steps} currentStep={currentStep} />

            <FormProvider {...methods}>
                <div className="mt-8">
                    {currentStep === 1 && <StepPersonalInfo />}
                    {currentStep === 2 && <StepBoxSize />}
                    {currentStep === 3 && <StepBoxSelection />}
                    {currentStep === 4 && <StepUpload />}
                    {currentStep === 5 && <StepSignature />}
                    {currentStep === 6 && <StepReview />}

                    <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-gray-100 dark:border-gray-800 mt-10">
                        {currentStep > 1 && (
                            <Button fullWidth onClick={prevStep} variant="outline" disabled={isSubmitting} className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                                {t('apply.prev_step')}
                            </Button>
                        )}
                        {currentStep < TOTAL_STEPS ? (
                            <Button fullWidth onClick={nextStep}>
                                {t('apply.next_step')}
                            </Button>
                        ) : (
                            <Button fullWidth onClick={handleSubmit(onFormSubmit)} disabled={isSubmitting}>
                                {isSubmitting ? t('apply.submitting') : t('apply.submit_application')}
                            </Button>
                        )}
                    </div>
                </div>
            </FormProvider>
        </div>
    );
};

export default ApplyPage;
