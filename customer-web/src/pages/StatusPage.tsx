import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { checkStatus } from '../services/mockService';
import Button from '../components/Button';
import Card from '../components/Card';
import {
    Search, Loader2, Calendar, Box, CheckCircle2, AlertTriangle,
    XCircle, Clock, Info, User, CreditCard, Phone, Mail, MapPin, Hash
} from 'lucide-react';
import dayjs from 'dayjs';

const StatusPage = () => {
    const { t } = useTranslation();
    const { trackingCode: urlCode } = useParams();
    const [inputCode, setInputCode] = useState(urlCode || '');
    const [searching, setSearching] = useState(!!urlCode);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['status', inputCode],
        queryFn: () => checkStatus({ trackingCode: inputCode, verifyValue: '' }),
        enabled: false,
    });

    useEffect(() => {
        if (urlCode) {
            refetch();
        }
    }, [urlCode, refetch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearching(true);
        refetch();
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'active': return { icon: <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />, color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300', label: t('status.active') };
            case 'rejected': return { icon: <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />, color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300', label: t('status.rejected') };
            case 'expired': return { icon: <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />, color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300', label: t('status.expired') };
            default: return { icon: <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300', label: t('status.pending') };
        }
    };

    const getBoxLabel = (size: string) => {
        const labels: Record<string, string> = {
            '30': '30 × 5 × 60 cm',
            '40': '40 × 10 × 60 cm',
            '50': '50 × 15 × 60 cm',
        };
        const dims = labels[size] || '';
        return `${t('box_sizes.type_label', { label: size })} ${dims ? `(${dims})` : ''}`;
    };

    const statusInfo = data ? getStatusInfo(data.status) : null;

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-8 animate-in fade-in duration-500 px-4 sm:px-0">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t('status.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{t('status.subtitle')}</p>
            </div>

            <Card className="p-8 border-none shadow-xl dark:shadow-none shadow-gray-200/50 dark:bg-gray-800">
                <form onSubmit={handleSearch} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
                            {t('status.tracking_code')}
                        </label>
                        <div className="relative">
                            <input
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                placeholder={t('status.search_placeholder')}
                                className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/10 outline-none transition-all text-xl font-black tracking-widest"
                                required
                            />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 w-6 h-6" />
                        </div>
                    </div>

                    <Button type="submit" fullWidth disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : t('status.check_button')}
                    </Button>
                </form>
            </Card>

            {searching && !isLoading && data && (
                <Card className="p-8 border-none shadow-2xl dark:shadow-none shadow-blue-100 dark:bg-gray-800 ring-2 ring-blue-50 dark:ring-blue-900/20 space-y-8 animate-in slide-in-from-bottom-4 duration-500">

                    {/* Status Header */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-700 text-center sm:text-left">
                        <div className={`p-5 rounded-3xl ${statusInfo?.color}`}>
                            {statusInfo?.icon}
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{t('status.status_header')}</p>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white">{statusInfo?.label}</h2>
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{t('status.tracking_code')}</p>
                            <p className="text-lg font-black text-blue-700 dark:text-blue-400 tracking-widest font-mono">{data.tracking_code || inputCode}</p>
                        </div>
                    </div>

                    {/* Data Diri Pemohon */}
                    <div>
                        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">{t('status.applicant_info')}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InfoBox icon={<User className="w-4 h-4 text-blue-600 dark:text-blue-400" />} label={t('customer_form.full_name')} value={data.fullName || '-'} />
                            <InfoBox icon={<CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />} label={t('customer_form.nik')} value={data.nik || '-'} />
                            <InfoBox icon={<Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />} label={t('customer_form.phone')} value={data.phone || '-'} />
                            <InfoBox icon={<Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />} label={t('customer_form.email')} value={data.email || '-'} />
                            <InfoBox icon={<Hash className="w-4 h-4 text-blue-600 dark:text-blue-400" />} label={t('customer_form.account_number')} value={data.accountNumber || '-'} />
                            <InfoBox icon={<MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />} label={t('customer_form.address')} value={data.address || '-'} />
                        </div>
                    </div>

                    {/* Detail Pesanan */}
                    <div>
                        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">{t('status.order_details')}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InfoBox icon={<Box className="w-4 h-4 text-blue-600 dark:text-blue-400" />} label={t('customer_form.step_2')} value={getBoxLabel(data.boxSize)} />
                            <InfoBox icon={<CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />} label={t('status.payment_status')}
                                value={data.paymentStatus ? t(`status.${data.paymentStatus}`) : t('status.payment_none')} />
                            {data.submittedAt && (
                                <InfoBox icon={<Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />} label={t('status.date_submitted')}
                                    value={dayjs(data.submittedAt).format('DD MMM YYYY')} />
                            )}
                            {data.startDate ? (
                                <InfoBox icon={<Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />} label={t('status.date_start')}
                                    value={dayjs(data.startDate).format('DD MMM YYYY')} />
                            ) : (
                                <InfoBox icon={<Calendar className="w-4 h-4 text-gray-300 dark:text-gray-600" />} label={t('status.date_start')}
                                    value={t('status.waiting_approval')} />
                            )}
                            {data.endDate ? (
                                <InfoBox icon={<Calendar className="w-4 h-4 text-red-500 dark:text-red-400" />} label={t('status.date_end')}
                                    value={dayjs(data.endDate).format('DD MMM YYYY')} />
                            ) : (
                                <InfoBox icon={<Calendar className="w-4 h-4 text-gray-300 dark:text-gray-600" />} label={t('status.date_end')}
                                    value={t('status.waiting_approval')} />
                            )}
                        </div>
                    </div>

                    {/* Info / Keterangan */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl flex gap-4 items-start border border-gray-100 dark:border-gray-700">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                            {data.status === 'pending' && t('status.description_pending')}
                            {data.status === 'active' && t('status.description_active')}
                            {data.status === 'rejected' && `${t('status.description_rejected')}${data.rejectionReason ? ` Alasan: ${data.rejectionReason}` : ''}`}
                            {data.status === 'expired' && t('status.description_expired')}
                        </p>
                    </div>
                </Card>
            )}

            {searching && !isLoading && isError && (
                <Card className="p-8 border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-center space-y-4">
                    <XCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto" />
                    <p className="font-bold text-red-700 dark:text-red-300">{t('status.not_found')}</p>
                </Card>
            )}
        </div>
    );
};

const InfoBox = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="space-y-1.5 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-sm font-bold text-gray-900 dark:text-white break-all">{value}</p>
    </div>
);

export default StatusPage;
