import api from "../api/axios";

// Fetch all available products in the system
export const getAllProducts = async () => {
    try {
        const response = await api.get('/Products/allProducts');
        return response.data;
    } catch (error) {
        console.error("Error fetching all products:", error);
        throw error;
    }
};

// Fetch products for a specific seller
// NOTE TO USER: Replace '/Products/seller/${userId}' with your actual .NET endpoint
export const getSellerProducts = async (userId) => {
    try {
        const response = await api.get(`/Products/Seller/${userId}`);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

// Add a new product
// NOTE TO USER: Replace '/Products' with your actual .NET endpoint
export const addProduct = async (productData) => {
    try {
        const response = await api.post("/Products/AddProduct", productData);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error adding product:", error);
        throw error;
    }
};

// Update an existing product
// NOTE TO USER: Replace '/Products/${id}' with your actual .NET endpoint
export const updateProduct = async (id, productData) => {
    try {
        const response = await api.put(`/Products/EditProduct/${id}`, productData);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};

// Delete a product
// NOTE TO USER: Replace '/Products/${id}' with your actual .NET endpoint
export const deleteProduct = async (id) => {
    try {
        const response = await api.delete(`/Products/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};

export const updateProductStatus = async (productId, newStatus) => {
    try {
        // passing status using  URL's query parameters
        const response = await api.patch(`/Products/UpdateStatus/${productId}?newstatus=${newStatus}`);

        return response.data;
    } catch (error) {
        console.error("Error updating status:", error);
        throw error;
    }
};




