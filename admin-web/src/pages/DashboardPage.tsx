import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getDashboard } from '../services/mockService';
import {
    Package,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    ChevronDown
} from 'lucide-react';
import Card from '../components/Card';

const DashboardPage = () => {
    const { t } = useTranslation();
    const [year, setYear] = useState(new Date().getFullYear());
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard', year],
        queryFn: () => getDashboard(year),
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-24 gap-4 animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold">{t('common.loading')}</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{t('admin.dashboard.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{t('admin.dashboard.subtitle')}</p>
                </div>

                <div className="relative group">
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="appearance-none bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 px-6 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 pr-12 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all cursor-pointer"
                    >
                        {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                    label={t('admin.dashboard.stats.total_box')}
                    value={data?.totalBoxes}
                    subValue={t('admin.dashboard.stats.overall_capacity')}
                    color="blue"
                />
                <StatCard
                    icon={<CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />}
                    label={t('admin.dashboard.stats.available')}
                    value={data?.available}
                    subValue={t('admin.dashboard.stats.ready_to_use')}
                    color="green"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                    label={t('admin.dashboard.stats.active')}
                    value={data?.active}
                    subValue={t('admin.dashboard.stats.ongoing_contracts')}
                    color="purple"
                />
                <StatCard
                    icon={<AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />}
                    label={t('admin.dashboard.stats.arrears')}
                    value={data?.latePayments}
                    subValue={t('admin.dashboard.stats.late_payments')}
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {Object.entries(data?.metricsBySize || {}).map(([size, metrics]: [string, any]) => (
                    <Card key={size} className="p-8 border-none shadow-xl shadow-gray-200/40 dark:shadow-none dark:bg-gray-900 dark:border dark:border-gray-800 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="w-14 h-14 bg-gray-900 dark:bg-blue-900/30 text-white dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl font-black italic">
                                {size}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('inventory.table_type')}</span>
                        </div>

                        <div className="space-y-6">
                            <ProgressRow label={t('admin.dashboard.metrics.active')} value={metrics.active} total={metrics.total} color="bg-blue-600 shadow-lg shadow-blue-500/20" />
                            <ProgressRow label={t('admin.dashboard.metrics.available')} value={metrics.available} total={metrics.total} color="bg-green-500 shadow-lg shadow-green-500/20" />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, subValue, color }: any) => {
    const bgColors: any = {
        blue: "bg-blue-50 dark:bg-blue-900/10",
        green: "bg-green-50 dark:bg-green-900/10",
        purple: "bg-purple-50 dark:bg-purple-900/10",
        red: "bg-red-50 dark:bg-red-900/10"
    };

    return (
        <Card className="p-8 border-none shadow-xl shadow-gray-200/40 dark:shadow-none dark:bg-gray-900 dark:border dark:border-gray-800 relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${bgColors[color]} rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150`}></div>
            <div className="relative z-10 flex flex-col gap-5">
                <div className={`w-14 h-14 ${bgColors[color]} rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{value}</p>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-2">{subValue}</p>
                </div>
            </div>
        </Card>
    );
};

const ProgressRow = ({ label, value, total, color }: any) => {
    return (
        <div className="space-y-3">
            <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">{label}</span>
                <span className="text-gray-900 dark:text-white">{value} <span className="text-gray-300 dark:text-gray-700">/ {total}</span></span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${(value / total) * 100}%` }}></div>
            </div>
        </div>
    );
};

export default DashboardPage;
