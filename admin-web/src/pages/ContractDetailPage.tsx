import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getContractDetail, updateApplication } from '../services/mockService';
import {
    ArrowLeft,
    User,
    MapPin,
    CreditCard,
    FileText,
    CheckCircle2,
    XCircle,
    Download,
    Calendar,
    Clock,
    Loader2,
    Phone,
    Briefcase,
    ShieldCheck
} from 'lucide-react';
import { BOX_SIZES } from '../shared/constants';
import Button from '../components/Button';
import Card from '../components/Card';
import toast from 'react-hot-toast';

const ContractDetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);
    const [customEndDate, setCustomEndDate] = useState('');

    const handleReject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectReason.trim()) {
            toast.error(t('contracts.rejection_hint'));
            return;
        }

        setIsActionLoading(true);
        try {
            await updateApplication(id!, {
                status: 'rejected',
                rejection_reason: rejectReason
            });
            toast.error(t('contracts.toast.rejected'), {
                icon: '❌',
                style: { borderRadius: '15px', fontWeight: 'bold' }
            });
            setShowRejectModal(false);
            navigate('/contracts');
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setIsActionLoading(false);
        }
    };

    const { data, isLoading } = useQuery({
        queryKey: ['contract', id],
        queryFn: () => getContractDetail(id!),
    });

    if (isLoading) return <div className="text-center py-20 font-bold text-gray-400 dark:text-gray-600">{t('common.loading')}</div>;
    if (!data) return <div className="text-center py-20 dark:text-gray-400">{t('common.error')}</div>;

    const defaultPrice = BOX_SIZES.find(b => b.id === data.size.toString())?.price || 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={() => navigate('/contracts')}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                {t('contracts.back')}
            </button>

            <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{data.name}</h1>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">ID: {data.id}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg italic">{t('contracts.type')} {data.size}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${data.status === 'active' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'}`}>
                            {t(`common.${data.status}`)}
                        </span>
                    </div>
                </div>

                {data.status === 'pending' && (
                    <div className="flex gap-4 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => setShowRejectModal(true)}
                            disabled={isActionLoading}
                            className="flex-grow sm:flex-initial border-red-100 dark:border-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                            <XCircle className="w-5 h-5" /> {t('contracts.reject')}
                        </Button>
                        <Button
                            onClick={() => setShowApproveModal(true)}
                            disabled={isActionLoading}
                            className="flex-grow sm:flex-initial bg-green-600 hover:bg-green-700 shadow-xl shadow-green-100 dark:shadow-none"
                        >
                            <CheckCircle2 className="w-5 h-5" /> {t('contracts.approve')}
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-8 border-none shadow-xl shadow-gray-200/40 dark:shadow-none dark:bg-gray-900 dark:border dark:border-gray-800 space-y-6">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b dark:border-gray-800 pb-4">{t('contracts.customer_info')}</h3>
                        <DetailItem icon={<User />} label={t('contracts.full_name')} value={data.name} t={t} />
                        <DetailItem icon={<FileText />} label={t('contracts.nik')} value={data.nik} t={t} />
                        <DetailItem icon={<Phone />} label={t('contracts.phone')} value={data.phone} t={t} />
                        <DetailItem icon={<CreditCard />} label={t('contracts.email')} value={data.email} t={t} />
                        <DetailItem icon={<MapPin />} label={t('contracts.address')} value={data.address} t={t} />

                        {/* Timeline section */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('contracts.timeline')}</p>
                            <DetailItem
                                icon={<Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
                                label={t('contracts.submitted_date')}
                                value={data.submittedAt || '-'}
                                t={t}
                            />
                            <DetailItem
                                icon={<Briefcase className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
                                label={t('contracts.box_selection', 'Pemilihan Box')}
                                value={`Ruangan ${data.box_room || '-'} • No. ${data.box_number || '-'}`}
                                t={t}
                            />
                            <DetailItem
                                icon={<CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />}
                                label={t('contracts.approved_date')}
                                value={data.approvedAt || '-'}
                                t={t}
                            />
                            <DetailItem
                                icon={<Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
                                label={t('contracts.active_date')}
                                value={data.startDate || '-'}
                                t={t}
                            />
                            <DetailItem
                                icon={<Clock className="w-5 h-5 text-orange-500 dark:text-orange-400" />}
                                label={t('contracts.due_date')}
                                value={data.paymentDueDate || data.endDate || '-'}
                                t={t}
                            />
                        </div>
                    </Card>

                    {/* Product Holding Card */}
                    <Card className="p-8 border-none shadow-xl shadow-gray-200/40 dark:shadow-none dark:bg-gray-900 dark:border dark:border-gray-800 space-y-6">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b dark:border-gray-800 pb-4">{t('contracts.product_holding')}</h3>
                        <DetailItem
                            icon={<Briefcase className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
                            label={t('contracts.account_type')}
                            value={data.account_type || '-'}
                            t={t}
                        />
                        <DetailItem
                            icon={<ShieldCheck className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />}
                            label={t('contracts.credit_card_type')}
                            value={data.credit_card_type || '-'}
                            t={t}
                        />
                        <DetailItem
                            icon={<FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
                            label={t('contracts.account_number')}
                            value={data.account_number || '-'}
                            t={t}
                        />
                    </Card>

                    {/* Manual Payment Update – only for expired or late payment */}
                    {(data.status === 'expired' || data.paymentStatus === 'late') && (
                        <Card className="p-6 border-none shadow-xl shadow-orange-100 dark:shadow-none dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                            <h3 className="text-xs font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest border-b border-orange-100 dark:border-orange-900/20 pb-4 mb-4 flex items-center gap-2">
                                ⚠️ {t('contracts.confirm_payment')}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                                {t('contracts.confirm_paid')}
                            </p>
                            <form
                                className="space-y-4"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    setIsActionLoading(true);
                                    try {
                                        const payload: any = { payment_status: 'paid' };
                                        if (customEndDate) payload.new_end_date = customEndDate;
                                        const result = await updateApplication(id!, payload);
                                        const nextDue = result?.newEndDate;
                                        toast.success(
                                            nextDue
                                                ? `✅ ${t('contracts.confirm_payment')}! ${t('contracts.next_due_date')}: ${nextDue}`
                                                : `✅ ${t('common.paid')}`,
                                            { style: { borderRadius: '15px', fontWeight: 'bold' } }
                                        );
                                        setCustomEndDate('');
                                    } catch {
                                        toast.error(t('common.error'));
                                    } finally {
                                        setIsActionLoading(false);
                                    }
                                }}
                            >
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">{t('contracts.next_due_date')}</label>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-orange-400 dark:focus:border-orange-500 px-4 py-3 rounded-xl font-bold outline-none transition-all text-sm text-gray-900 dark:text-white"
                                    />
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{t('contracts.auto_pay_hint')}</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all disabled:bg-gray-300 dark:disabled:bg-gray-700 flex items-center justify-center gap-2 text-sm shadow-lg shadow-green-100 dark:shadow-none"
                                >
                                    {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '✅'} {t('contracts.confirm_paid')}
                                </button>
                            </form>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <section className="space-y-4">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-gray-800 px-6 py-2 rounded-full w-fit">{t('contracts.document_previews')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <DocPreview label="KTP (ID CARD)" src={data.ktpImage} onClick={() => setLightbox({ src: data.ktpImage, label: 'KTP (ID CARD)' })} t={t} />
                            <DocPreview label="BANK PASSBOOK" src={data.passbookImage} onClick={() => setLightbox({ src: data.passbookImage, label: 'BANK PASSBOOK' })} t={t} />
                            {data.signatureImage ? (
                                <DocPreview label={t('contracts.signature')} src={data.signatureImage} isSignature onClick={() => setLightbox({ src: data.signatureImage, label: t('contracts.signature') })} t={t} />
                            ) : (
                                <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-8 text-center gap-3">
                                    <span className="text-4xl">✍️</span>
                                    <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('contracts.signature')}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('contracts.no_signature')}</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {showApproveModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <Card className="max-w-lg w-full p-10 space-y-8 scale-in duration-300 dark:bg-gray-900 dark:border dark:border-gray-800">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t('contracts.approve')}</h2>
                            <button onClick={() => setShowApproveModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><XCircle /></button>
                        </div>

                        <form className="space-y-6" onSubmit={async (e) => {
                            e.preventDefault();
                            setIsActionLoading(true);
                            try {
                                const formData = new FormData(e.currentTarget as HTMLFormElement);
                                await updateApplication(id!, {
                                    status: 'active',
                                    start_date: formData.get('start_date'),
                                    end_date: formData.get('end_date'),
                                    price: formData.get('price'),
                                    payment_status: 'paid'
                                });
                                toast.success(t('contracts.toast.approved'));
                                setShowApproveModal(false);
                                navigate('/contracts');
                            } catch (error) {
                                toast.error(t('common.error'));
                            } finally {
                                setIsActionLoading(false);
                            }
                        }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500">{t('contracts.start_date')}</label>
                                    <input name="start_date" type="date" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all font-bold" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500">{t('contracts.end_date')}</label>
                                    <input name="end_date" type="date" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all font-bold" required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500">{t('contracts.price_yearly')}</label>
                                <input name="price" type="number" defaultValue={defaultPrice} placeholder="500000" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all font-bold text-lg" required />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button fullWidth variant="outline" type="button" onClick={() => setShowApproveModal(false)}>{t('common.cancel')}</Button>
                                <Button fullWidth type="submit" disabled={isActionLoading} className="bg-blue-600 hover:bg-blue-700 dark:shadow-none">
                                    {isActionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : t('contracts.approve_confirm')}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {showRejectModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <Card className="max-w-lg w-full p-10 space-y-8 scale-in duration-300 dark:bg-gray-900 dark:border dark:border-gray-800">
                        <div className="flex justify-between items-center text-red-600 dark:text-red-400">
                            <h2 className="text-2xl font-black">{t('contracts.reject')}</h2>
                            <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><XCircle /></button>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-800 dark:text-red-400 font-medium">{t('contracts.rejection_hint')}</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleReject}>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 px-1">{t('contracts.rejection_reason')}</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder={t('contracts.rejection_reason')}
                                    rows={4}
                                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-red-500 dark:focus:border-red-400 transition-all font-bold resize-none"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button fullWidth variant="outline" type="button" onClick={() => setShowRejectModal(false)}>{t('common.back')}</Button>
                                <Button fullWidth type="submit" disabled={isActionLoading} className="bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-100 dark:shadow-none">
                                    {isActionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : t('contracts.reject_confirm')}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setLightbox(null)}
                >
                    <div
                        className="relative max-w-3xl w-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{lightbox.label}</span>
                            <div className="flex items-center gap-3">
                                <a
                                    href={lightbox.src}
                                    download
                                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Download className="w-3.5 h-3.5" /> {t('common.download')}
                                </a>
                                <button
                                    onClick={() => setLightbox(null)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-gray-800 flex items-center justify-center min-h-[300px] max-h-[70vh]">
                            <img
                                src={lightbox.src}
                                alt={lightbox.label}
                                className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-md"
                            />
                        </div>
                    </div>
                    <p className="text-white/60 text-xs mt-4">{t('contracts.lightbox_hint')}</p>
                </div>
            )}
        </div>
    );
};

const DetailItem = ({ icon, label, value }: any) => (
    <div className="flex gap-4">
        <div className="text-gray-300 dark:text-gray-600 mt-1">{icon}</div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
            <p className="font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
        </div>
    </div>
);

const DocPreview = ({ label, src, isSignature, onClick, t }: { label: string; src: string; isSignature?: boolean; onClick?: () => void; t: any }) => (
    <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border-2 border-gray-50 dark:border-gray-800 shadow-lg dark:shadow-none group">
        <div className="p-4 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500 dark:text-gray-400">{label}</span>
            <a href={src} download className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"><Download className="w-4 h-4" /></a>
        </div>
        <div
            className={`relative flex items-center justify-center overflow-hidden p-2 cursor-zoom-in ${isSignature ? 'aspect-[3/1] bg-white dark:bg-gray-800' : 'aspect-[4/3] bg-gray-100 dark:bg-gray-800'}`}
            onClick={onClick}
            title="Klik untuk preview"
        >
            <img
                src={src}
                className={`w-full h-full rounded-2xl group-hover:scale-105 transition-transform duration-700 ${isSignature ? 'object-contain' : 'object-cover'}`}
                alt={label}
            />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <span className="text-white bg-black/40 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">🔍 {t('common.view')}</span>
            </div>
        </div>
    </div>
);

export default ContractDetailPage;
