import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import { Plus, Minus, Loader2, AlertCircle, ShieldCheck, Box, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

interface InventoryItem {
    size: string;
    total: number;
    active: number;
    available: number;
}

const InventoryPage = () => {
    const { t } = useTranslation();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [localChanges, setLocalChanges] = useState<Record<string, number>>({});

    const fetchInventory = async () => {
        try {
            const response = await api.get('/api/admin/inventory');
            setInventory(response.data);
            // Sync local changes with fresh data
            const initialLocal: Record<string, number> = {};
            response.data.forEach((item: InventoryItem) => {
                initialLocal[item.size] = item.total;
            });
            setLocalChanges(initialLocal);
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleLocalUpdate = (size: string, newTotal: number) => {
        if (newTotal < 0) return;
        setLocalChanges(prev => ({ ...prev, [size]: newTotal }));
    };

    const handleSave = async (size: string) => {
        const newTotal = localChanges[size];
        const item = inventory.find(i => i.size === size);

        if (!item) return;
        if (newTotal === item.total) return; // No change

        if (newTotal < item.active) {
            toast.error(t('inventory.min_error', { active: item.active }));
            return;
        }

        setSaving(size);
        try {
            await api.post('/api/admin/inventory', { size, total: newTotal });
            toast.success(t('inventory.save_success', { size }));
            await fetchInventory();
        } catch (error) {
            toast.error(t('inventory.save_error'));
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 font-bold animate-pulse">{t('common.loading')}</p>
            </div>
        );
    }

    const isUpdating = (size: string) => saving === size;
    const hasChanged = (size: string) => {
        const item = inventory.find(i => i.size === size);
        return item ? localChanges[size] !== item.total : false;
    };

    const totalActive = inventory.reduce((acc, curr) => acc + curr.active, 0);
    const totalCapacity = inventory.reduce((acc, curr) => acc + curr.total, 0);
    const totalAvailable = totalCapacity - totalActive;

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t('inventory.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">{t('inventory.subtitle')}</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label={t('inventory.table_total')}
                    value={totalCapacity}
                    icon={<Box className="w-6 h-6" />}
                    color="blue"
                />
                <StatCard
                    label={t('inventory.table_active')}
                    value={totalActive}
                    icon={<ShieldCheck className="w-6 h-6" />}
                    color="orange"
                />
                <StatCard
                    label={t('inventory.table_available')}
                    value={totalAvailable}
                    icon={<Plus className="w-6 h-6" />}
                    color="green"
                />
            </div>

            <Card className="p-8 border-none shadow-xl shadow-gray-200/40 dark:shadow-none dark:bg-gray-900 dark:border dark:border-gray-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-gray-50 dark:border-gray-800">
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('inventory.table_type')}</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('inventory.table_total')}</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('inventory.table_active')}</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('inventory.table_available')}</th>
                                <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('inventory.table_action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {inventory.map((item) => {
                                const localValue = localChanges[item.size] ?? item.total;
                                const changed = hasChanged(item.size);
                                const updating = isUpdating(item.size);

                                return (
                                    <tr key={item.size} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-black">
                                                    {item.size}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{t('box_sizes.type_label', { label: item.size })}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide">{t('admin.dashboard.subtitle')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    disabled={updating}
                                                    onClick={() => handleLocalUpdate(item.size, localValue - 1)}
                                                    className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all disabled:opacity-50"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={localValue}
                                                    onChange={(e) => handleLocalUpdate(item.size, parseInt(e.target.value) || 0)}
                                                    className={`w-16 px-2 py-2 border-2 rounded-lg outline-none transition-all text-center font-black text-xl 
                                                        ${changed
                                                            ? 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-400'
                                                            : 'border-gray-50 bg-white dark:border-gray-800 dark:bg-gray-800 dark:text-white'}`}
                                                />
                                                <button
                                                    disabled={updating}
                                                    onClick={() => handleLocalUpdate(item.size, localValue + 1)}
                                                    className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all disabled:opacity-50"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8">
                                            <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full text-xs font-black">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                {item.active} {t('inventory.table_active')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-8">
                                            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-black">
                                                <Plus className="w-3.5 h-3.5" />
                                                {localValue - item.active} {t('inventory.table_available')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-8 text-center">
                                            <button
                                                onClick={() => handleSave(item.size)}
                                                disabled={!changed || updating}
                                                className={`
                                                    min-w-[100px] py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2
                                                    ${changed
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'}
                                                    ${updating ? 'animate-pulse' : ''}
                                                `}
                                            >
                                                {updating ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Save className="w-3.5 h-3.5" />
                                                )}
                                                {updating ? t('common.loading').toUpperCase() : t('common.save').toUpperCase()}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-black text-blue-900 dark:text-blue-100 mb-1">{t('inventory.guide_title')}</h4>
                    <p className="text-blue-700/80 dark:text-blue-300/80 text-sm font-medium leading-relaxed">
                        {t('inventory.guide_desc')}
                    </p>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon, color }: { label: string, value: number, icon: any, color: string }) => {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/30",
        orange: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-900/30",
        green: "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/30"
    };

    return (
        <Card className={`p-8 border-2 ${colors[color]} shadow-none flex items-center justify-between dark:bg-gray-900/50`}>
            <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
                <p className="text-4xl font-black">{value}</p>
            </div>
            <div className={`p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm transition-colors`}>
                {icon}
            </div>
        </Card>
    );
};

export default InventoryPage;
