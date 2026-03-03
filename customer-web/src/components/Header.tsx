import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Globe, Sun, Moon } from 'lucide-react';

const Header = () => {
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'id' ? 'en' : 'id';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 group">
                    <img src="/mandiri-logo.png" alt="Bank Mandiri" className="h-10 w-auto object-contain dark:brightness-0 dark:invert" />
                    <div className="border-l border-gray-200 dark:border-gray-700 pl-3 hidden sm:block">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-tight">Safe Deposit Box</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">KC Pondok Indah</p>
                    </div>
                </Link>

                <div className="flex items-center gap-3 sm:gap-6">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full border dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-bold"
                    >
                        <Globe className="w-4 h-4" />
                        <span className="hidden sm:inline">{i18n.language.toUpperCase()}</span>
                    </button>

                    <Link
                        to="/status"
                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-sm px-2 cursor-pointer transition-colors"
                    >
                        {t('status.title')}
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
