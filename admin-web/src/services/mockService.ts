import { APP_CONFIG } from '../shared/constants';
import api from './api';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getDashboard = async (year: number) => {
    if (APP_CONFIG.USE_MOCK_API) {
        await delay(1000);
        return {
            totalBoxes: 5100,
            available: 5025,
            active: 75,
            expiringSoon: 12,
            latePayments: 5,
            metricsBySize: {
                '30': { total: 1700, active: 25, available: 1675 },
                '40': { total: 1700, active: 30, available: 1670 },
                '50': { total: 1700, active: 20, available: 1680 },
            }
        };
    }
    const response = await api.get(`/api/admin/dashboard-stats?year=${year}`);
    return response.data;
};

export const getContracts = async (filters: any) => {
    if (APP_CONFIG.USE_MOCK_API) {
        await delay(800);
        // ... (mock data removed for brevity in this replacement)
        return [];
    }
    const response = await api.get('/api/admin/applications', { params: filters });
    return response.data;
};

export const getContractDetail = async (id: string) => {
    if (APP_CONFIG.USE_MOCK_API) {
        await delay(600);
        return null;
    }
    const response = await api.get(`/api/admin/applications/${id}`);
    return response.data;
};

export const updateApplication = async (id: string, data: any) => {
    const response = await api.patch(`/api/admin/applications/${id}`, data);
    return response.data; // includes newEndDate when payment_status=paid
};


export const sendEmailReminder = async (contractId: string) => {
    const response = await api.post(`/api/admin/applications/${contractId}/send-reminder`);
    return response.data;
};

