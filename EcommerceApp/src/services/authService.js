import api from "../api/axios";

export const loginUser = async (data) => {

    try {
        const response = await api.post("/auth/login", data);
        // console.log(response);


        return {
            success: true,
            user: response.data.user
        };

    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: error.response?.data || "Login failed"
        };

    }


};

export const registerUser = async (data) => {
    const response = await api.post("/auth/register", data);
    return response;
};
