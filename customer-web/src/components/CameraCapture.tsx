import React, { useRef, useState, useEffect } from 'react';
import { Camera, RotateCcw, Check, X } from 'lucide-react';
import Button from './Button';

interface CameraCaptureProps {
    onCapture: (blob: Blob) => void;
    onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError("Permisi kamera ditolak atau tidak tersedia.");
            console.error("Camera error:", err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUrl);
                stopCamera();
            }
        }
    };

    const handleConfirm = () => {
        if (capturedImage) {
            fetch(capturedImage)
                .then(res => res.blob())
                .then(onCapture);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        startCamera();
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 bg-white/20 hover:bg-white/40 p-3 rounded-full text-white backdrop-blur-md transition-all"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="aspect-[4/3] bg-black flex items-center justify-center relative">
                    {!capturedImage ? (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            {error && <p className="text-white text-center p-4 bg-red-600/50 absolute inset-0 flex items-center justify-center">{error}</p>}
                        </>
                    ) : (
                        <img src={capturedImage} className="w-full h-full object-cover" />
                    )}
                </div>

                <div className="p-8 bg-black/50 backdrop-blur-xl flex justify-center gap-6">
                    {!capturedImage ? (
                        <button
                            onClick={takePhoto}
                            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform ring-4 ring-white/30"
                        >
                            <div className="w-16 h-16 rounded-full border-4 border-black/5 flex items-center justify-center">
                                <Camera className="w-8 h-8 text-black" />
                            </div>
                        </button>
                    ) : (
                        <>
                            <Button onClick={handleRetake} variant="outline" className="border-white/20 text-white bg-white/10 hover:bg-white/20">
                                <RotateCcw className="w-5 h-5 mr-2" /> Ambil Ulang
                            </Button>
                            <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                                <Check className="w-5 h-5 mr-2" /> Gunakan Foto
                            </Button>
                        </>
                    )}
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default CameraCapture;
