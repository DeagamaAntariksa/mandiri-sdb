import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto space-y-12 py-8 px-6 md:px-0">
            <section className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight">
                    {t('landing.title')}
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    {t('landing.description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button onClick={() => navigate('/apply')} className="text-lg px-12">
                        {t('landing.cta')}
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/status')} className="text-lg px-12 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                        {t('status.title')}
                    </Button>
                </div>
            </section>

            <section className="grid md:grid-cols-3 gap-8 pt-12">
                <FeatureCard
                    icon={<ShieldCheck className="w-10 h-10 text-blue-600 dark:text-blue-400" />}
                    title={t('landing.features.security_title')}
                    description={t('landing.features.security_desc')}
                />
                <FeatureCard
                    icon={<Clock className="w-10 h-10 text-blue-600 dark:text-blue-400" />}
                    title={t('landing.features.access_title')}
                    description={t('landing.features.access_desc')}
                />
                <FeatureCard
                    icon={<CheckCircle2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />}
                    title={t('landing.features.ease_title')}
                    description={t('landing.features.ease_desc')}
                />
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl dark:hover:shadow-none transition-all hover:-translate-y-1">
        <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
);

export default LandingPage;
