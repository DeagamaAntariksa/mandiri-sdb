import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    FileText,
    BarChart3,
    LogOut,
    Menu,
    X,
    Globe,
    Box,
    Sun,
    Moon
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminLayoutProps {
    theme: string;
    toggleTheme: () => void;
}

const AdminLayout = ({ theme, toggleTheme }: AdminLayoutProps) => {
    const { t, i18n } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Persistence for sidebar state
    useEffect(() => {
        const saved = localStorage.getItem('sidebar_open');
        if (saved !== null) setIsSidebarOpen(saved === 'true');
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebar_open', isSidebarOpen.toString());
    }, [isSidebarOpen]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/login');
    };

    // Auto-logout after 5 minutes of inactivity
    useEffect(() => {
        let timeout: any;

        const resetTimer = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                handleLogout();
                toast.error(t('admin.toast.session_expired'), {
                    icon: '🕒',
                    style: { borderRadius: '15px', fontWeight: 'bold' }
                });
            }, 5 * 60 * 1000); // 5 minutes
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));

        resetTimer();

        return () => {
            if (timeout) clearTimeout(timeout);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [i18n.language, t]);

    const menuItems = [
        { path: '/dashboard', label: t('admin.sidebar.dashboard'), icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/contracts', label: t('admin.sidebar.contracts'), icon: <FileText className="w-5 h-5" /> },
        { path: '/reports', label: t('admin.sidebar.reports'), icon: <BarChart3 className="w-5 h-5" /> },
        { path: '/inventory', label: t('admin.sidebar.inventory'), icon: <Box className="w-5 h-5" /> },
    ];

    const toggleLanguage = () => {
        const newLang = i18n.language === 'id' ? 'en' : 'id';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 transform overflow-hidden
                ${isSidebarOpen
                    ? 'w-72 translate-x-0'
                    : '-translate-x-full lg:translate-x-0 w-72 lg:w-20'}
            `}>
                <div className={`h-full flex flex-col p-8 ${!isSidebarOpen ? 'lg:items-center lg:px-0' : ''}`}>
                    <div className={`flex items-center justify-between mb-12 transition-all ${!isSidebarOpen ? 'lg:justify-center' : ''}`}>
                        <img
                            src="/mandiri-logo.png"
                            alt="Bank Mandiri"
                            className={`h-8 w-auto object-contain transition-all ${theme === 'dark' ? 'brightness-0 invert' : ''} ${!isSidebarOpen ? 'lg:w-8 lg:h-8' : ''}`}
                        />
                        {isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <nav className="flex-grow space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                                title={!isSidebarOpen ? item.label : ''}
                                className={`
                                    flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all group
                                    ${location.pathname.startsWith(item.path)
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white'}
                                    ${!isSidebarOpen && 'lg:justify-center lg:px-0 lg:w-12 lg:mx-auto'}
                                `}
                            >
                                <span className="shrink-0">{item.icon}</span>
                                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${!isSidebarOpen ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </nav>

                    <button
                        onClick={handleLogout}
                        title={!isSidebarOpen ? t('admin.logout') : ''}
                        className={`
                            flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all mt-auto
                            ${!isSidebarOpen && 'lg:justify-center lg:px-0 lg:w-12 lg:mx-auto'}
                        `}
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${!isSidebarOpen ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
                            {t('admin.logout')}
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-grow flex flex-col min-w-0">
                <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 h-20 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors duration-300">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 transition-all"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <div className="ml-auto flex items-center gap-4 sm:gap-6">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm"
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all text-sm font-bold shadow-sm"
                        >
                            <Globe className="w-4 h-4" />
                            <span>{i18n.language.toUpperCase()}</span>
                        </button>

                        <div className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-gray-800 ml-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black">
                                {localStorage.getItem('admin_username')?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-black text-gray-900 dark:text-white capitalize leading-tight">
                                    {t('admin.hi')}, {localStorage.getItem('admin_username') || 'Admin'}
                                </p>
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{t('admin.super_admin')}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full flex-grow">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
