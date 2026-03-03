import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import { FileSpreadsheet, File as FilePdf, BarChart3, Calendar, CheckCircle2, Clock, Loader2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getContracts } from '../services/mockService';

const FilterGroup = ({ label, icon, children }: any) => (
    <div className="space-y-3">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-tighter px-1">
            {icon} {label}
        </label>
        {children}
    </div>
);

const ExportButton = ({ label, icon, onClick, active, format, t }: any) => {
    const colors: any = {
        xlsx: 'text-green-500 bg-green-500/10',
        pdf: 'text-red-500 bg-red-500/10',
    };

    return (
        <button
            onClick={onClick}
            disabled={active}
            className={`
                w-full flex items-center justify-between p-6 rounded-[2rem] transition-all font-bold group
                ${active ? 'bg-blue-600 text-white scale-[0.98]' : 'bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'}
            `}
        >
            <div className="flex items-center gap-5">
                {active ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 duration-300 ${colors[format] || 'bg-blue-50 text-blue-600'}`}>
                        {icon}
                    </div>
                )}
                <div className="text-left">
                    <span className="block text-sm sm:text-base font-black">{label}</span>
                    {!active && <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mt-0.5">{format.toUpperCase()} FORMAT</span>}
                </div>
            </div>
            {!active && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-[10px] font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <span>{t('reports.download')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </div>
            )}
            {active && (
                <span className="text-xs font-black uppercase tracking-widest opacity-80">{t('common.processing')}...</span>
            )}
        </button>
    );
};

const ReportsPage = () => {
    const { t } = useTranslation();
    const [exporting, setExporting] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        year: '2025',
        boxSize: 'Semua Ukuran',
        status: 'Semua Status',
        paymentStatus: 'Semua Status'
    });

    const handleExport = async (format: string) => {
        setExporting(format);
        try {
            const data = await getContracts(filters);

            if (!data || data.length === 0) {
                toast.error(t('reports.no_data'));
                setExporting(null);
                return;
            }

            const branchAddress = t('footer.address');
            const fileNamePrefix = t('reports.filename_prefix');
            const sheetName = t('reports.sheet_name');

            if (format === 'xlsx') {
                const excelData = data.map((item: any) => ({
                    [t('reports.pdf_code')]: item.tracking_code || '-',
                    [t('reports.pdf_name')]: item.name || item.full_name || '-',
                    [t('reports.pdf_nik')]: item.nik || '-',
                    [t('reports.pdf_box')]: item.size || item.box_size || '-',
                    [t('reports.pdf_box_number')]: item.box_number || '-',
                    [t('reports.pdf_account')]: item.account_number || '-',
                    [t('reports.pdf_price')]: item.price || 0,
                    [t('reports.pdf_status')]: (t(`common.${item.status?.toLowerCase()}`) || item.status || 'pending').toUpperCase(),
                    [t('reports.pdf_payment')]: (t(`common.${item.paymentStatus?.toLowerCase()}`) || item.paymentStatus || 'unpaid').toUpperCase()
                }));
                const ws = XLSX.utils.json_to_sheet(excelData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
                XLSX.writeFile(wb, `${fileNamePrefix}_${filters.year}.xlsx`);
            } else if (format === 'pdf') {
                const doc = new jsPDF();

                // Header - Logo
                const logoImg = new Image();
                logoImg.src = '/mandiri-logo.png';

                await new Promise((resolve) => {
                    logoImg.onload = resolve;
                    logoImg.onerror = resolve;
                });

                if (logoImg.complete && logoImg.naturalWidth > 0) {
                    doc.addImage(logoImg, 'PNG', 14, 10, 45, 15);
                }

                // Header - Branch Info
                doc.setFontSize(9);
                doc.setTextColor(80);
                const addressLines = doc.splitTextToSize(branchAddress, 120);
                doc.text(addressLines, 65, 14);

                doc.setDrawColor(220);
                doc.line(14, 32, 196, 32);

                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text(`${t('reports.title').toUpperCase()} - ${filters.year}`, 14, 42);

                const tableData = data.map((item: any) => [
                    item.tracking_code || '-',
                    item.name || item.full_name || '-',
                    item.nik || '-',
                    `Tipe ${item.size || item.box_size || '-'}`,
                    item.box_number || '-',
                    item.account_number || '-',
                    item.price ? `Rp ${new Intl.NumberFormat('id-ID').format(item.price)}` : '-',
                    (t(`common.${item.status?.toLowerCase()}`) || item.status || 'pending').toUpperCase(),
                    (t(`common.${item.paymentStatus?.toLowerCase()}`) || item.paymentStatus || 'unpaid').toUpperCase()
                ]);

                autoTable(doc, {
                    startY: 48,
                    head: [[
                        t('reports.pdf_code'),
                        t('reports.pdf_name'),
                        t('reports.pdf_nik'),
                        t('reports.pdf_box'),
                        t('reports.pdf_box_number'),
                        t('reports.pdf_account'),
                        t('reports.pdf_price'),
                        t('reports.pdf_status'),
                        t('reports.pdf_payment')
                    ]],
                    body: tableData,
                    headStyles: { fillColor: [0, 61, 121], textColor: [255, 255, 255] },
                    styles: { fontSize: 7 }, // Reduced font size to fit more columns
                    margin: { top: 35 },
                    alternateRowStyles: { fillColor: [245, 247, 250] }
                });

                doc.save(`${fileNamePrefix}_${filters.year}.pdf`);
            }

            toast.success(`${t('reports.export_success')} ${format.toUpperCase()}`);
        } catch (error) {
            console.error(error);
            toast.error(t('reports.export_failed'));
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t('reports.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">{t('reports.subtitle')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-10 border-none shadow-xl shadow-gray-200/40 dark:shadow-none dark:bg-gray-900 dark:border dark:border-gray-800 space-y-10">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b dark:border-gray-800 pb-4">{t('reports.filter_title')}</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <FilterGroup label={t('reports.filter_year')} icon={<Calendar className="w-4 h-4" />}>
                                <select
                                    value={filters.year}
                                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700 px-4 py-3 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all font-sans"
                                >
                                    <option>2025</option>
                                    <option>2024</option>
                                </select>
                            </FilterGroup>

                            <FilterGroup label={t('reports.filter_size')} icon={<BarChart3 className="w-4 h-4" />}>
                                <select
                                    value={filters.boxSize}
                                    onChange={(e) => setFilters({ ...filters, boxSize: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700 px-4 py-3 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all font-sans"
                                >
                                    <option value="Semua Ukuran">{t('reports.all_sizes')}</option>
                                    <option value="30">{t('inventory.size')} 30</option>
                                    <option value="40">{t('inventory.size')} 40</option>
                                    <option value="50">{t('inventory.size')} 50</option>
                                </select>
                            </FilterGroup>

                            <FilterGroup label={t('reports.filter_status')} icon={<CheckCircle2 className="w-4 h-4" />}>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700 px-4 py-3 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all font-sans"
                                >
                                    <option value="Semua Status">{t('reports.all_statuses')}</option>
                                    <option value="active">{t('common.active')}</option>
                                    <option value="pending">{t('common.pending')}</option>
                                    <option value="expired">{t('common.expired')}</option>
                                </select>
                            </FilterGroup>

                            <FilterGroup label={t('reports.filter_payment')} icon={<Clock className="w-4 h-4" />}>
                                <select
                                    value={filters.paymentStatus}
                                    onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700 px-4 py-3 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all font-sans"
                                >
                                    <option value="Semua Status">{t('reports.all_statuses')}</option>
                                    <option value="paid">{t('common.paid')}</option>
                                    <option value="unpaid">{t('common.unpaid')}</option>
                                    <option value="late">{t('common.late')}</option>
                                </select>
                            </FilterGroup>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-8 border-none bg-gray-900 dark:bg-blue-900/10 text-white shadow-2xl dark:shadow-none space-y-8">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-white/10 dark:border-gray-800 pb-4">{t('reports.format_title')}</h3>

                        <div className="grid grid-cols-1 gap-4">
                            <ExportButton
                                label="Microsoft Excel"
                                format="xlsx"
                                icon={<FileSpreadsheet className="w-6 h-6" />}
                                active={exporting === 'xlsx'}
                                onClick={() => handleExport('xlsx')}
                                t={t}
                            />
                            <ExportButton
                                label="Portable Document (PDF)"
                                format="pdf"
                                icon={<FilePdf className="w-6 h-6" />}
                                active={exporting === 'pdf'}
                                onClick={() => handleExport('pdf')}
                                t={t}
                            />
                        </div>

                        <p className="text-[10px] text-gray-500 font-bold text-center leading-relaxed italic">
                            {t('reports.note')}
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
