import api from '../api/axios';

// NOTE TO USER: Replace these endpoints with your actual ASP.NET Cart Controller endpoints

export const addToCartAPI = async (userId, productId, quantity, description) => {
    try {
        const payload = {
            UserId: userId,
            ProductId: productId,
            Quantity: quantity,
            Description: description
        };
        const response = await api.post('/Cart/AddProduct', payload);
        return response.data;
    } catch (error) {
        console.error("Error adding to cart via API:", error);
        throw error;
    }
};


export const removeCartItemAPI = async (userId, productId) => {
    try {
        
        const response = await api.delete(`/Cart/RemoveItem/${userId}/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Error removing cart item via API:", error);
        throw error;
    }
};

export const clearCartAPI = async (userId) => {
    try {
        const response = await api.delete(`/Cart/clearCart/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error clearing cart via API:", error);
        throw error;
    }
};

export const getCartAPI = async (userId) => {
    try {
        const response = await api.get(`/Cart/AddedCartProducts/${userId}`);
       // console.log("Cart API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching cart from API:", error);
        throw error;
    }
};
