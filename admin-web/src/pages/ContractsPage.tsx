import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getContracts, sendEmailReminder } from '../services/mockService';
import { Link } from 'react-router-dom';
import {
    Search,
    Filter,
    ChevronRight,
    Package,
    Mail,
    Loader2
} from 'lucide-react';
import Card from '../components/Card';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const ContractsPage = () => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [sendingReminder, setSendingReminder] = useState<string | null>(null);
    const [isBulkSending, setIsBulkSending] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['contracts'],
        queryFn: () => getContracts({}),
    });

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
            active: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800',
            rejected: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800',
            expired: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status as keyof typeof styles]}`}>
                {t(`common.${status}`) || status}
            </span>
        );
    };

    const getPaymentBadge = (status: string) => {
        const styles = {
            paid: 'text-green-600 dark:text-green-400',
            unpaid: 'text-gray-400 dark:text-gray-500',
            late: 'text-red-600 dark:text-red-400',
        };
        const dotColors = {
            paid: 'bg-green-600 dark:bg-green-400',
            unpaid: 'bg-gray-400 dark:bg-gray-500',
            late: 'bg-red-600 dark:bg-red-400',
        };
        return (
            <span className={`flex items-center gap-1.5 text-xs font-bold ${styles[status as keyof typeof styles]}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${dotColors[status as keyof typeof styles]}`} />
                {(t(`common.${status}`) || status).toUpperCase()}
            </span>
        );
    };

    const [showFilters, setShowFilters] = useState(false);

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setSortBy('newest');
    };

    const handleSendReminder = async (id: string, name: string) => {
        setSendingReminder(id);
        try {
            await sendEmailReminder(id);
            toast.success(t('contracts.toast.reminder_sent', { name }), {
                icon: '📧',
                style: { borderRadius: '15px', fontWeight: 'bold' }
            });
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setSendingReminder(null);
        }
    };

    const handleBulkSendReminder = async () => {
        const lateContracts = filteredData.filter((c: any) => c.paymentStatus === 'late');
        if (lateContracts.length === 0) return;

        if (!window.confirm(`${t('contracts.bulk_reminder')} ke ${lateContracts.length} nasabah?`)) return;

        setIsBulkSending(true);
        try {
            for (const contract of lateContracts) {
                setSendingReminder(contract.id);
                await sendEmailReminder(contract.id);
            }
            toast.success(t('reports.export_success'), {
                icon: '🚀',
                style: { borderRadius: '15px', fontWeight: 'bold' }
            });
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setIsBulkSending(false);
            setSendingReminder(null);
        }
    };

    if (isLoading) return <div className="text-center py-20 font-bold text-gray-400 dark:text-gray-600">{t('common.loading')}</div>;

    const filteredData = (data || [])
        .filter((c: any) => {
            const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.email.toLowerCase().includes(search.toLowerCase()) ||
                c.nik.includes(search);
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && c.status === 'active') ||
                (statusFilter === 'pending' && c.status === 'pending') ||
                (statusFilter === 'expired' && c.status === 'expired');

            const matchesJatuhTempo = sortBy !== 'due_date' || c.paymentStatus === 'late';

            return matchesSearch && matchesStatus && matchesJatuhTempo;
        })
        .sort((a: any, b: any) => {
            if (sortBy === 'newest') return dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix();
            if (sortBy === 'oldest') return dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix();
            if (sortBy === 'name_az') return a.name.localeCompare(b.name);
            if (sortBy === 'due_date') {
                if (a.paymentStatus === 'late' && b.paymentStatus !== 'late') return -1;
                if (a.paymentStatus !== 'late' && b.paymentStatus === 'late') return 1;
                return dayjs(a.paymentDueDate).unix() - dayjs(b.paymentDueDate).unix();
            }
            return 0;
        });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t('contracts.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">{t('contracts.subtitle')}</p>
                </div>
                {sortBy === 'due_date' && filteredData.length > 0 && (
                    <button
                        onClick={handleBulkSendReminder}
                        disabled={isBulkSending}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95 disabled:bg-gray-400"
                    >
                        {isBulkSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                        {t('contracts.bulk_reminder')} ({filteredData.length})
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-12 space-y-4">
                    <Card className="p-4 border-none shadow-xl shadow-gray-200/40 dark:shadow-none dark:bg-gray-900 dark:border dark:border-gray-800">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-grow">
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('contracts.search_placeholder')}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-medium"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-6 py-3 border-2 rounded-xl font-bold transition-all ${showFilters ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <Filter className="w-5 h-5" />
                                {t('common.filter')}
                            </button>
                            {(search || statusFilter !== 'all' || sortBy !== 'newest') && (
                                <button
                                    onClick={handleResetFilters}
                                    className="px-6 py-3 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                                >
                                    {t('common.reset')}
                                </button>
                            )}
                        </div>
                    </Card>

                    {showFilters && (
                        <Card className="p-8 border-none shadow-xl shadow-gray-200/40 dark:shadow-none dark:bg-gray-900 dark:border dark:border-gray-800 animate-in slide-in-from-top-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest px-1">{t('reports.filter_status')}</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700 px-4 py-3 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                                    >
                                        <option value="all">{t('reports.all_statuses')}</option>
                                        <option value="active">{t('common.active')}</option>
                                        <option value="pending">{t('common.pending')}</option>
                                        <option value="expired">{t('common.expired')}</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest px-1">{t('reports.filter_size')}</label>
                                    <select className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700 px-4 py-3 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all">
                                        <option>{t('reports.all_sizes')}</option>
                                        <option>30</option>
                                        <option>40</option>
                                        <option>50</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest px-1">{t('contracts.sort.label')}</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700 px-4 py-3 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                                    >
                                        <option value="newest">{t('contracts.sort.newest')}</option>
                                        <option value="oldest">{t('contracts.sort.oldest')}</option>
                                        <option value="name_az">{t('contracts.sort.name_az')}</option>
                                        <option value="due_date">{t('contracts.sort.due_date')}</option>
                                    </select>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Desktop Table */}
                <div className="lg:col-span-12 hidden md:block overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-none">
                    <table className="w-full bg-white dark:bg-gray-900 text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('contracts.customer')}</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('reports.pdf_box')}</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('reports.pdf_status')}</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('reports.pdf_payment')}</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('contracts.created')}</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {filteredData.map((contract: any) => (
                                <tr key={contract.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                                                {contract.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{contract.name}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{contract.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white rounded-lg w-fit text-xs font-black italic">
                                            <Package className="w-3 h-3" /> {contract.size}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">{getStatusBadge(contract.status)}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            {getPaymentBadge(contract.paymentStatus)}
                                            {contract.paymentStatus === 'late' && (
                                                <button
                                                    onClick={() => handleSendReminder(contract.id, contract.name)}
                                                    disabled={sendingReminder === contract.id}
                                                    className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors uppercase tracking-widest"
                                                >
                                                    {sendingReminder === contract.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Mail className="w-2.5 h-2.5" />}
                                                    {t('contracts.send_reminder')}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-gray-500 dark:text-gray-400">{dayjs(contract.createdAt).format('DD/MM/YY')}</td>
                                    <td className="px-8 py-6 text-right">
                                        <Link to={`/contracts/${contract.id}`} className="inline-flex items-center gap-2 text-sm font-black text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-xl transition-all">
                                            {t('common.view')} <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:col-span-12 md:hidden space-y-4">
                    {filteredData.map((contract: any) => (
                        <Card key={contract.id} className="p-6 border-none shadow-lg dark:shadow-none dark:bg-gray-900 dark:border dark:border-gray-800">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-black">
                                        {contract.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{contract.name}</h4>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-tight">{t('contracts.nik')}: {contract.nik.substring(0, 6)}****</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {getStatusBadge(contract.status)}
                                    {contract.paymentStatus === 'late' && (
                                        <button
                                            onClick={() => handleSendReminder(contract.id, contract.name)}
                                            disabled={sendingReminder === contract.id}
                                            className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all border border-blue-100 dark:border-blue-800"
                                            title={t('contracts.send_reminder')}
                                        >
                                            {sendingReminder === contract.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex border-t border-gray-50 dark:border-gray-800 pt-6 justify-between items-end">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                        <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" /> {t('contracts.type')} {contract.size}
                                    </div>
                                    {getPaymentBadge(contract.paymentStatus)}
                                </div>
                                <Link to={`/contracts/${contract.id}`} className="bg-gray-900 dark:bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black dark:hover:bg-blue-700 transition-all">
                                    {t('common.detail')}
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContractsPage;
