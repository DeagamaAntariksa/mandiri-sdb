import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, User, Eye, EyeOff, Loader2, ShieldCheck, Globe, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const createSchema = (t: any) => z.object({
    username: z.string().min(3, t('login.error_username_min')),
    password: z.string().min(6, t('login.error_password_min')),
});

type LoginData = {
    username: string;
    password: string;
};

interface LoginPageProps {
    theme: string;
    toggleTheme: () => void;
}

const LoginPage = ({ theme, toggleTheme }: LoginPageProps) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successUser, setSuccessUser] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
        resolver: zodResolver(createSchema(t)),
    });

    const toggleLanguage = () => {
        const newLang = i18n.language === 'id' ? 'en' : 'id';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    const onSubmit = async (data: LoginData) => {
        setLoading(true);
        try {
            const response = await api.post('/api/login', data);
            const { token, user } = response.data;
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_username', user.username);

            setSuccessUser(user.username);
            toast.success(t('login.success_toast'));

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error: any) {
            console.error('Login failed', error);
            toast.error(t('login.error'));
        } finally {
            setLoading(false);
        }
    };

    if (successUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-600 dark:bg-gray-950 animate-in fade-in duration-700">
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 dark:bg-blue-600/20 backdrop-blur-md rounded-full border border-white/30 dark:border-blue-500/30 animate-bounce">
                        <ShieldCheck className="w-12 h-12 text-white dark:text-blue-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white dark:text-blue-400 animate-in slide-in-from-bottom-8 duration-500">
                            {t('login.success_title', { name: successUser })}
                        </h2>
                        <p className="text-white/80 dark:text-gray-400 font-medium text-lg animate-in fade-in slide-in-from-bottom-4 delay-200 duration-500">
                            {t('login.success_subtitle')}
                        </p>
                    </div>
                    <div className="flex justify-center gap-2 pt-4">
                        <div className="w-2 h-2 bg-white dark:bg-blue-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-white dark:bg-blue-400 rounded-full animate-bounce delay-200" />
                        <div className="w-2 h-2 bg-white dark:bg-blue-400 rounded-full animate-bounce delay-300" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-gray-950 transition-colors duration-500">
            {/* Theme & Language Toggles */}
            {/* Theme & Language Toggles */}
            <div className="fixed bottom-6 right-6 md:top-6 md:right-6 md:bottom-auto z-50 flex items-center gap-2 md:gap-3 px-2 py-1 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-full border border-white/20 shadow-2xl">
                <button
                    onClick={toggleTheme}
                    className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm"
                >
                    {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                </button>
                <div className="w-px h-4 bg-white/20 mx-1" />
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-400 text-[9px] font-black uppercase tracking-widest hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm"
                >
                    <Globe className="w-3 h-3" />
                    {i18n.language.toUpperCase()}
                </button>
            </div>

            {/* ── LEFT PANEL ── */}
            <div className="relative md:flex-1 h-64 md:h-auto overflow-hidden">
                <img
                    src="/bg-login.jpg"
                    alt="Bank Mandiri Safe Deposit Box"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-b md:bg-gradient-to-r from-black/80 via-black/50 to-black/20' : 'bg-gradient-to-b md:bg-gradient-to-r from-blue-900/60 via-blue-900/40 to-transparent'}`} />

                {/* Desktop Version */}
                <div className="relative hidden md:flex flex-col justify-between h-full p-10 z-10">
                    <div className="flex items-center gap-3">
                        <img src="/mandiri-logo.png" alt="Bank Mandiri" className={`h-9 w-auto ${theme === 'dark' ? 'brightness-0 invert' : ''}`} />
                    </div>

                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5" /> {t('login.internal_system')}
                        </div>
                        <h2 className="text-4xl font-black text-white leading-tight drop-shadow-lg">
                            Safe Deposit Box<br />
                            <span className="text-yellow-400">{t('login.branch_name')}</span>
                        </h2>
                        <p className="text-white/70 text-sm font-medium max-w-xs leading-relaxed">
                            {t('login.branding_desc')}
                        </p>
                    </div>
                </div>

                {/* Mobile Version - More structured */}
                <div className="relative md:hidden flex flex-col items-center justify-center h-full z-10 p-6 text-center">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-2xl">
                        <img src="/mandiri-logo.png" alt="Bank Mandiri" className={`h-8 w-auto mx-auto mb-4 ${theme === 'dark' ? 'brightness-0 invert' : ''}`} />
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-white leading-tight drop-shadow-sm">Safe Deposit Box</h2>
                            <p className="text-yellow-400 text-sm font-bold uppercase tracking-widest">{t('login.branch_name')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex items-center justify-center md:w-[440px] lg:w-[480px] shrink-0 p-8 sm:p-12 transition-colors duration-500">
                <div className="w-full max-w-sm space-y-8">
                    <div className="space-y-1">
                        <div className="flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none mb-4">
                            <Lock className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t('login.welcome')}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('login.subtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('login.username')}</label>
                            <div className="relative">
                                <input
                                    {...register('username')}
                                    type="text"
                                    placeholder={t('login.username_placeholder')}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/10 outline-none transition-all font-medium text-sm"
                                />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-[18px] h-[18px]" />
                            </div>
                            {errors.username && <p className="text-red-500 text-xs font-bold">{errors.username.message} </p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('login.password')}</label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/10 outline-none transition-all font-medium text-sm"
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-[18px] h-[18px]" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs font-bold">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black rounded-xl transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:shadow-none mt-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : t('login.submit')}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                        © {new Date().getFullYear()} Bank Mandiri {t('login.branch_name')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
