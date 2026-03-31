import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrderHistory } from '../redux/slices/orderSlice';
import Loader from '../components/Loader';

const OrderHistory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { orders, loading, error } = useSelector((state) => state.orders);

    const userId = user?.id || user?.Id;

    useEffect(() => {
        if (userId) {
            dispatch(fetchOrderHistory(userId));
        }
    }, [dispatch, userId]);

    const groupedOrders = useMemo(() => {
        const groups = new Map();
        (orders || []).forEach((item) => {
            const orderId = item.orderId || item.OrderId || item.orderID || item.OrderID;
            if (!orderId) return;
            if (!groups.has(orderId)) {
                groups.set(orderId, []);
            }
            groups.get(orderId).push(item);
        });
        return Array.from(groups.entries()).map(([orderId, items]) => {
            const first = items[0] || {};
            return { orderId, items, meta: first };
        });
    }, [orders]);

    const formatDate = (value) => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatCurrency = (value) => {
        const number = Number(value);
        if (Number.isNaN(number)) return '₹0';
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(number);
    };

    const calcOrderTotal = (items, meta) => {
        const explicitTotal = meta.totalAmount || meta.TotalAmount || meta.orderTotal || meta.OrderTotal;
        if (explicitTotal !== undefined && explicitTotal !== null) {
            return explicitTotal;
        }
        return items.reduce((sum, item) => {
            const qty = item.quantity || item.Quantity || 0;
            const price = item.price || item.Price || item.unitPrice || item.UnitPrice || 0;
            return sum + qty * price;
        }, 0);
    };

    const summary = useMemo(() => {
        const totalOrders = groupedOrders.length;
        const totalItems = groupedOrders.reduce((count, group) => {
            return count + group.items.reduce((sum, item) => sum + (item.quantity || item.Quantity || 0), 0);
        }, 0);
        const totalSpent = groupedOrders.reduce((sum, group) => sum + calcOrderTotal(group.items, group.meta), 0);
        return { totalOrders, totalItems, totalSpent };
    }, [groupedOrders]);

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 via-white to-white">
            <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Order History</h1>
                        <p className="text-gray-500 mt-1">All your purchases in one place</p>
                    </div>
                    <button
                        onClick={() => navigate('/home')}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold text-primary-600 border border-primary-100 hover:border-primary-200 hover:bg-primary-50 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>

                {error && (
                    <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                {!error && groupedOrders.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Total Orders</div>
                            <div className="text-2xl font-black text-gray-900 mt-1">{summary.totalOrders}</div>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Total Items</div>
                            <div className="text-2xl font-black text-gray-900 mt-1">{summary.totalItems}</div>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Total Spent</div>
                            <div className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(summary.totalSpent)}</div>
                        </div>
                    </div>
                )}

                {!error && groupedOrders.length === 0 && (
                    <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
                        <p className="text-gray-500">Looks like you haven't placed any orders yet.</p>
                    </div>
                )}

                <div className="space-y-6">
                    {groupedOrders.map((group) => {
                        const orderDate = group.meta.orderDate || group.meta.OrderDate || group.meta.createdAt || group.meta.CreatedAt;
                        const total = calcOrderTotal(group.items, group.meta);
                        return (
                            <div key={group.orderId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-gray-50/60">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="text-sm font-bold text-gray-900">Order #{group.orderId}</div>
                                        <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-full px-2.5 py-1">
                                            {formatDate(orderDate)}
                                        </span>
                                        <span className="ml-auto text-lg font-black text-gray-900">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="hidden sm:grid grid-cols-[1fr_120px_120px] text-xs uppercase tracking-wider text-gray-400 font-semibold pb-3">
                                        <div>Item</div>
                                        <div className="text-center">Quantity</div>
                                        <div className="text-right">Price</div>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {group.items.map((item, idx) => {
                                            const name = item.productName || item.ProductName || item.name || item.Name || 'Unknown Product';
                                            const qty = item.quantity || item.Quantity || 0;
                                            const price = item.price || item.Price || item.unitPrice || item.UnitPrice || 0;
                                            return (
                                                <div key={`${group.orderId}-${idx}`} className="py-4 grid grid-cols-1 sm:grid-cols-[1fr_120px_120px] items-center gap-2">
                                                    <div className="font-semibold text-gray-900">{name}</div>
                                                    <div className="text-sm text-gray-600 sm:text-center">Qty: {qty}</div>
                                                    <div className="text-sm font-bold text-gray-900 sm:text-right">{formatCurrency(price)}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;
