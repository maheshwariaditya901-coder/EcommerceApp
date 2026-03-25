import axios from "axios";

const api = axios.create({
    baseURL: "https://localhost:7259/api", // your ASP.NET API URL
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true // Include cookies in requests
});

export default api;

