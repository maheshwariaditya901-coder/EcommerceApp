import { createSlice } from '@reduxjs/toolkit';

const loadUserFromMemory = () => {
    try {
        const storedUser = sessionStorage.getItem('ecommerce_session_user');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        return null;
    }
};

const savedUser = loadUserFromMemory();

const initialState = {
    user: savedUser, // { id, name, email, role }
    token: null,
    isAuthenticated: !!savedUser,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            // Handle both { user: {...}, token: "..." } and { id: 1, role: "Seller" } formats
            state.user = action.payload.user || action.payload;
            state.token = action.payload.token || null;

            // Save state mapping cleanly across F5 refreshes
            sessionStorage.setItem('ecommerce_session_user', JSON.stringify(state.user));
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            sessionStorage.removeItem('ecommerce_session_user');
        },
        setInitialUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        }
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, setInitialUser } = authSlice.actions;
export default authSlice.reducer;
