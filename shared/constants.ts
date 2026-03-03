export const APP_CONFIG = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
    USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API === 'true',
};

export const BOX_SIZES = [
    { id: '30', label: '30', description_key: 'box_size_30_desc' },
    { id: '40', label: '40', description_key: 'box_size_40_desc' },
    { id: '50', label: '50', description_key: 'box_size_50_desc' },
];

export const CONTRACT_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    REJECTED: 'rejected',
    EXPIRED: 'expired',
};

export const PAYMENT_STATUS = {
    PAID: 'paid',
    UNPAID: 'unpaid',
    LATE: 'late',
};
