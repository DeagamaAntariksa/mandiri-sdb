import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getBoxAvailability } from '../../services/mockService';
import Card from '../../components/Card';
import { CheckCircle2, Layout, Info } from 'lucide-react';

const StepBoxSelection = () => {
    const { setValue, watch, formState: { errors } } = useFormContext();
    const { t } = useTranslation();

    const selectedSize = watch('boxSize'); // '30', '40', or '50'
    const selectedRoom = watch('boxRoom') || '1';
    const selectedNumber = watch('boxNumber');

    const rooms = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

    const { data: availability = [], isLoading } = useQuery({
        queryKey: ['box-availability', selectedRoom],
        queryFn: () => getBoxAvailability(selectedRoom),
        refetchInterval: 5000, // Refresh every 5s for the "war" experience
    });

    const boxes = useMemo(() => {
        return Array.from({ length: 510 }, (_, i) => {
            const num = i + 1;
            let type = '30';
            if (num > 170 && num <= 340) type = '40';
            else if (num > 340) type = '50';

            const statusData = availability.find((a: any) => a.box_number === num);
            const status = statusData ? statusData.status : 'available';

            return {
                number: num.toString(),
                type,
                status
            };
        });
    }, [selectedRoom, availability]);

    const handleBoxClick = (box: { number: string, type: string, status: string }) => {
        if (box.status !== 'available') return;
        if (box.type !== selectedSize) return;

        setValue('boxRoom', selectedRoom, { shouldValidate: true });
        setValue('boxNumber', box.number, { shouldValidate: true });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('customer_form.step_3')}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                    {t('apply.box_selection.subtitle', 'Silakan pilih ruangan dan posisi box yang tersedia')}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm font-bold">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Tersedia</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Menunggu Approve</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Sedang Digunakan</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <span className="text-gray-600 dark:text-gray-400">Tipe Lain</span>
                    </div>
                </div>
            </div>

            {/* Room Selector */}
            <div className="flex flex-wrap justify-center gap-2">
                {rooms.map(room => (
                    <button
                        key={room}
                        type="button"
                        onClick={() => setValue('boxRoom', room)}
                        className={`
                            px-6 py-3 rounded-xl font-black transition-all active:scale-95
                            ${selectedRoom === room
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none translate-y-[-2px]'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
                        `}
                    >
                        Ruangan {room}
                    </button>
                ))}
            </div>

            {/* Cinema Grid Layout */}
            <Card className="p-6 overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <Layout className="w-6 h-6 text-blue-600" />
                    <div>
                        <h4 className="font-black text-gray-900 dark:text-white">Denah Box Ruangan {selectedRoom}</h4>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Menampilkan 510 slot penyimpanan</p>
                    </div>
                </div>

                <div className="relative overflow-auto max-h-[600px] p-8 custom-scrollbar bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                    <div className="grid grid-cols-12 gap-1.5 min-w-[600px]">
                        {boxes.map((box, index) => {
                            const isSelected = selectedNumber === box.number && selectedRoom === watch('boxRoom');
                            const isCorrectType = box.type === selectedSize;

                            let bgColor = 'bg-gray-100 dark:bg-gray-800/50 opacity-20 cursor-not-allowed';
                            if (isCorrectType) {
                                if (box.status === 'active') {
                                    bgColor = 'bg-red-500 hover:bg-red-600 transition-colors cursor-not-allowed';
                                } else if (box.status === 'pending') {
                                    bgColor = 'bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-not-allowed';
                                } else {
                                    bgColor = 'bg-green-500 hover:scale-110 hover:shadow-lg active:scale-95 cursor-pointer hover:bg-green-600';
                                }
                            }

                            if (isSelected) {
                                bgColor = 'bg-blue-600 scale-110 shadow-xl z-10 ring-4 ring-blue-100 dark:ring-blue-900/40';
                            }

                            // Row/Column for sekat logic (every 12 boxes is a new row in a 12-col grid)
                            // Every 144 boxes (12x12) we could add a larger gap
                            const isEndOfSekat = (index + 1) % 144 === 0;

                            return (
                                <div
                                    key={box.number}
                                    onClick={() => handleBoxClick(box)}
                                    title={`Box ${box.number} (${box.type}) - ${box.status === 'active' ? 'Sedang Digunakan' : box.status === 'pending' ? 'Menunggu Approve' : 'Tersedia'}`}
                                    className={`
                                        aspect-square rounded-[4px] flex items-center justify-center text-[8px] font-black text-white transition-all duration-300
                                        ${bgColor}
                                        ${isEndOfSekat ? 'mb-4' : ''}
                                        ${isLoading ? 'animate-pulse' : ''}
                                    `}
                                >
                                    {isCorrectType && box.status === 'available' && box.number}
                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>

            {(errors.boxRoom || errors.boxNumber) && (
                <div className="flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 text-red-500 animate-bounce">
                    <Info className="w-5 h-5" />
                    <p className="font-black">Silakan pilih box yang tersedia</p>
                </div>
            )}

            {selectedNumber && (
                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border-2 border-blue-100 dark:border-blue-900/30 flex items-center justify-between animate-in zoom-in">
                    <div>
                        <p className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-1">Pilihan Anda</p>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white">
                            Ruangan {selectedRoom} • Box No. {selectedNumber}
                        </h4>
                    </div>
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 dark:shadow-none">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StepBoxSelection;
