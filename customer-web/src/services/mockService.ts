import { APP_CONFIG } from '../shared/constants';
import api from './api';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const submitApplication = async (formData: any) => {
    if (APP_CONFIG.USE_MOCK_API) {
        await delay(1200);
        return {
            success: true,
            trackingCode: 'SDB-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        };
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
            // Map 'signature' field to 'signatureImage' for multer
            const fieldName = key === 'signature' ? 'signatureImage' : key;
            data.append(fieldName, formData[key]);
        }
    });

    const response = await api.post('/api/applications', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const checkStatus = async ({ trackingCode }: { trackingCode: string, verifyValue: string }) => {
    if (APP_CONFIG.USE_MOCK_API) {
        await delay(800);
        return {
            status: 'pending',
            paymentStatus: 'unpaid',
            boxSize: '40',
            startDate: null,
            endDate: null,
        };
    }

    const response = await api.get(`/api/status/${trackingCode}`);
    return response.data;
};

export const getBoxAvailability = async (room: string) => {
    if (APP_CONFIG.USE_MOCK_API) {
        await delay(500);
        return []; // In mock mode, assume all available
    }
    const response = await api.get(`/api/boxes/availability/${room}`);
    return response.data; // [{ boxNumber, status }]
};
