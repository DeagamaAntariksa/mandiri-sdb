import { useRef, useEffect, useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PenLine, RotateCcw, Check } from 'lucide-react';

const StepSignature = () => {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    const { setValue, formState: { errors } } = useFormContext();

    // Resize canvas to fill container
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Save image data before resize
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Restore context settings
        ctx.strokeStyle = '#2563eb'; // blue-600
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw background
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Restore drawing if any
        if (imgData.width > 0) {
            ctx.putImageData(imgData, 0, 0);
        }
    }, []);

    useEffect(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Handle dark mode changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    resizeCanvas();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            observer.disconnect();
        };
    }, [resizeCanvas]);

    const getPos = (e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if ('touches' in e) {
            const touch = e.touches[0];
            return {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY,
            };
        } else {
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY,
            };
        }
    };

    const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setIsDrawing(true);
        setIsSaved(false);
        lastPos.current = getPos(e, canvas);
    };

    const draw = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !lastPos.current) return;

        const pos = getPos(e, canvas);
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastPos.current = pos;
        setIsEmpty(false);
    };

    const endDraw = () => {
        setIsDrawing(false);
        lastPos.current = null;
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
        setIsSaved(false);
        setValue('signature', null, { shouldValidate: true });
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas || isEmpty) return;
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'signature.png', { type: 'image/png' });
                setValue('signature', file, { shouldValidate: true });
                setIsSaved(true);
            }
        }, 'image/png');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">{t('apply.signature.title')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('apply.signature.subtitle')}
                </p>
            </div>

            {/* Signature Canvas Area */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <PenLine className="w-4 h-4" /> {t('apply.signature.area')}
                    </span>
                    {!isEmpty && (
                        <button
                            type="button"
                            onClick={clearCanvas}
                            className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-full border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {t('apply.signature.reset')}
                        </button>
                    )}
                </div>

                <div
                    ref={containerRef}
                    className="relative w-full rounded-2xl overflow-hidden border-2 transition-colors"
                    style={{
                        height: 220,
                        borderColor: errors.signature
                            ? '#ef4444'
                            : isSaved
                                ? '#22c55e'
                                : undefined,
                        cursor: 'crosshair',
                        touchAction: 'none',
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full bg-white dark:bg-gray-900"
                        onMouseDown={startDraw}
                        onMouseMove={draw}
                        onMouseUp={endDraw}
                        onMouseLeave={endDraw}
                        onTouchStart={startDraw}
                        onTouchMove={draw}
                        onTouchEnd={endDraw}
                        style={{ touchAction: 'none', display: 'block' }}
                    />
                    {/* Placeholder text when empty */}
                    {isEmpty && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                            <PenLine className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" />
                            <p className="text-gray-400 dark:text-gray-600 text-sm font-medium">{t('apply.signature.placeholder_main')}</p>
                            <p className="text-gray-300 dark:text-gray-700 text-xs mt-1">{t('apply.signature.placeholder_sub')}</p>
                        </div>
                    )}
                    {/* Baseline */}
                    <div className="absolute bottom-10 left-6 right-6 border-b-2 border-dashed border-gray-200 dark:border-gray-800 pointer-events-none" />
                </div>

                {/* Error */}
                {errors.signature && (
                    <p className="text-xs text-red-500 dark:text-red-400 font-semibold px-1">
                        {String(errors.signature.message)}
                    </p>
                )}
            </div>

            {/* Save Button */}
            <button
                type="button"
                onClick={saveSignature}
                disabled={isEmpty || isSaved}
                className={`
                    w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all
                    ${isSaved
                        ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-900/30 cursor-default'
                        : isEmpty
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border-2 border-transparent'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg dark:shadow-none shadow-blue-200 active:scale-95 border-2 border-transparent'
                    }
                `}
            >
                <Check className="w-5 h-5" />
                {isSaved ? t('apply.signature.saved') : t('apply.signature.save')}
            </button>

            {isSaved && (
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl p-4 flex gap-3 items-start">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                        {t('apply.signature.success_msg')}
                    </p>
                </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">💡 {t('apply.signature.tips_title')}</p>
                <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1 list-disc pl-4">
                    <li>{t('apply.signature.tip_1')}</li>
                    <li>{t('apply.signature.tip_2')}</li>
                    <li>{t('apply.signature.tip_3')}</li>
                </ul>
            </div>
        </div>
    );
};

export default StepSignature;
