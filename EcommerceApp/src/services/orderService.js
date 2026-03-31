import api from '../api/axios';

export const checkout = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required for checkout');
    }
    const response = await api.post(`/Order/checkout/${userId}`);
    return response.data;
};

export const getOrderHistory = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required to fetch order history');
    }
    const response = await api.get(`/Order/orderHistory/${userId}`);
    return response.data;
};
