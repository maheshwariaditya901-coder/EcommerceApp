import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrderHistory } from '../../services/orderService';

export const fetchOrderHistory = createAsyncThunk(
    'orders/fetchOrderHistory',
    async (userId, { rejectWithValue }) => {
        try {
            const data = await getOrderHistory(userId);
            console.log('Order history data:', data);
            return data;
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to fetch order history';
            return rejectWithValue(message);
        }
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        orders: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrderHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = Array.isArray(action.payload) ? action.payload : (action.payload?.orders || []);
            })
            .addCase(fetchOrderHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch order history';
            });
    },
});

export default orderSlice.reducer;
