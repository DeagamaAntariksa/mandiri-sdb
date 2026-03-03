import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Card from '../components/Card';
import { CheckCircle2, Copy, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const SuccessPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const trackingCode = location.state?.trackingCode || 'SDB-XXXXXX';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(trackingCode);
        toast.success(t('success.copy_toast'));
    };

    return (
        <div className="max-w-2xl mx-auto py-12 text-center space-y-8 animate-in zoom-in duration-500 px-4 sm:px-0">
            <div className="flex justify-center">
                <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-full ring-8 ring-green-50 dark:ring-green-900/10">
                    <CheckCircle2 className="w-20 h-20 text-green-600 dark:text-green-400" />
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">{t('success.title')}</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                    {t('success.subtitle')}
                </p>
            </div>

            <Card className="p-8 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck className="w-24 h-24 dark:text-blue-400" />
                </div>
                <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">{t('success.tracking_code')}</p>
                <div className="flex items-center justify-center gap-4">
                    <span className="text-4xl font-black text-blue-900 dark:text-blue-200 tracking-wider">
                        {trackingCode}
                    </span>
                    <button
                        onClick={copyToClipboard}
                        className="p-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-90"
                    >
                        <Copy className="w-6 h-6" />
                    </button>
                </div>
            </Card>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 text-left space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" /> {t('success.next_steps_title')}
                </h4>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400 font-medium list-disc pl-5">
                    <li>{t('success.next_step_1')}</li>
                    <li>{t('success.next_step_2')}</li>
                    <li>{t('success.next_step_3')}</li>
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button fullWidth onClick={() => navigate('/')} variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                    {t('success.back_home')}
                </Button>
                <Button fullWidth onClick={() => navigate(`/status/${trackingCode}`)}>
                    {t('success.check_status_cta')}
                </Button>
            </div>
        </div>
    );
};

export default SuccessPage;
