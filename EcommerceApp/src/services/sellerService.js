import api from "../api/axios";

// Fetch all sellers directory data for admin dashboard
export const getSellersData = async () => {
    try {
        const response = await api.get('/Sellers/sellersData');
        return response.data;
    } catch (error) {
        console.error("Error fetching sellers data:", error);
        throw error;
    }
};

// Enable a suspended/pending seller
// NOTE TO USER: Check if your backend expects PUT, PATCH, or POST for these actions
export const enableSeller = async (sellerId) => {
    try {
        const response = await api.put(`/Sellers/enable-seller/${sellerId}`);
        return response.data;
    } catch (error) {
        console.error("Error enabling seller:", error);
        throw error;
    }
};

// Disable an active seller
// NOTE TO USER: Check if your backend expects PUT, PATCH, or POST for these actions
export const disableSeller = async (sellerId) => {
    try {
        const response = await api.put(`/Sellers/disable-seller/${sellerId}`);
        return response.data;
    } catch (error) {
        console.error("Error disabling seller:", error);
        throw error;
    }
};
