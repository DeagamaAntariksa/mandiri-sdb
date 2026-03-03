import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-center md:text-left">
                    {/* Brand Section */}
                    <div className="space-y-6 flex flex-col items-center md:items-start">
                        <img src="/mandiri-logo.png" alt="Bank Mandiri" className="h-10 w-auto dark:brightness-0 dark:invert" />
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Safe Deposit Box</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">{t('footer.branch')}</p>
                        </div>
                        <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed max-w-xs">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('footer.contact_info')}</h4>
                        <ul className="space-y-4">
                            <li className="flex flex-col md:flex-row items-center md:items-start gap-3 group">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                                        {t('footer.address')}
                                    </p>
                                    <a
                                        href="https://www.google.com/maps/place/Mandiri+Jakarta+Pondok+Indah+Branch/@-6.2843074,106.7805876,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f1c812889e39:0x98ccabafda2200df!8m2!3d-6.2843074!4d106.7805876!16s%2Fg%2F1tfh1s49?entry=ttu"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors pt-1"
                                    >
                                        {t('footer.maps_link')} <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">14000 (Mandiri Call)</p>
                            </li>
                            <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">mandiricare@bankmandiri.co.id</p>
                            </li>
                        </ul>
                    </div>

                    {/* Operational Section */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('footer.operational_hours')}</h4>
                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 italic space-y-3">
                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('footer.mon_fri')}</span>
                                <span className="text-sm font-black text-gray-900 dark:text-white">08:00 - 15:00</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('footer.sat')}</span>
                                <span className="text-sm font-black text-gray-900 dark:text-white">09:00 - 15:00</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-400 dark:text-gray-600">
                                <span className="text-sm font-medium">{t('footer.sun')}</span>
                                <span className="text-xs font-bold uppercase">{t('footer.closed')}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-2 font-medium">
                                {t('footer.note')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-center items-center gap-4 text-center">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500">
                        &copy; {new Date().getFullYear()} {t('footer.copyright')}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
