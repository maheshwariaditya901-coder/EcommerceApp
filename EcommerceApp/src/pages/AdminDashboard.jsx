import React, { useState, useEffect } from 'react';
import { Search, Shield, Users, Store, CheckCircle, XCircle, MoreVertical, Package, X, Clock, AlertCircle, ToggleRight, ToggleLeft } from 'lucide-react';
import api from '../api/axios';
import { getSellerProducts, updateProductStatus } from '../services/productService';
import { getSellersData, enableSeller, disableSeller } from '../services/sellerService';

const AdminDashboard = () => {
    const [sellers, setSellers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Seller Products Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [sellerProducts, setSellerProducts] = useState([]);
    const [isProductsLoading, setIsProductsLoading] = useState(false);
    const [pendingStatusUpdates, setPendingStatusUpdates] = useState({});

    // --- API INTEGRATION ---
    useEffect(() => {
        const fetchSellers = async () => {
            try {
                setIsLoading(true);
                const data = await getSellersData();
                setSellers(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch sellers:", error);
                setIsLoading(false);
            }
        };

        fetchSellers();
    }, []);

    const filteredSellers = sellers.filter(seller =>
        (seller.sellerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (seller.shopName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (seller.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                </span>;
            case 'Suspended':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <XCircle className="w-3.5 h-3.5" /> Suspended
                </span>;
            case 'Pending':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Store className="w-3.5 h-3.5" /> Pending
                </span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
        }
    };

    const handleViewProducts = async (seller) => {
        setSelectedSeller(seller);
        setIsModalOpen(true);
        setIsProductsLoading(true);
        setPendingStatusUpdates({}); // Reset any pending changes
        console.log(seller);
        // Fallback to seller.userId or seller.Id if the model requires it
        const idToUse = seller.id || seller.userId || seller.Id;

        try {
            const data = await getSellerProducts(idToUse);
            const safeData = Array.isArray(data) ? data : (data?.data || data?.products || []);

            const normalizedData = safeData.map((p, ix) => ({
                ...p,
                id: p.id || p.Id || `unique_fallback_${Date.now()}_${ix}`
            }));


            setSellerProducts(normalizedData);
        } catch (error) {
            console.error("Failed to fetch seller products:", error);
            setSellerProducts([]);
        } finally {
            setIsProductsLoading(false);
        }
    };

    const handleStatusSelection = (productId, newStatus) => {
        setPendingStatusUpdates(prev => ({
            ...prev,
            [productId]: newStatus
        }));
    };

    const handleToggleSellerStatus = async (sellerId, currentStatus) => {
        const isCurrentlyActive = currentStatus === 'Active';
        const newStatus = isCurrentlyActive ? 'Suspended' : 'Active';


        // Optimistically update the UI instantly so it feels blazing fast
        setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, status: newStatus } : s));

        try {
            if (isCurrentlyActive) {
                await disableSeller(sellerId);
            } else {
                await enableSeller(sellerId);
            }
            // console.log(`Successfully executed backend API toggle for seller: ${sellerId}`);
        } catch (error) {
            // console.error("Failed to toggle seller status:", error);
            alert("Failed to toggle seller account status.");

            // Revert state back if API fails to prevent false sync
            setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, status: currentStatus } : s));
        }
    };

    const submitStatusChange = async (productId) => {
        const newStatus = pendingStatusUpdates[productId];
        if (!newStatus) return;

        try {
            // Actively update db via API call
            await updateProductStatus(productId, newStatus);

            // Assume success: update core local state so UI locks in securely
            setSellerProducts(prevProducts =>
                prevProducts.map(p =>
                    p.id === productId ? { ...p, status: newStatus, Status: newStatus } : p
                )
            );

            // Clear pending tracking for this item
            setPendingStatusUpdates(prev => {
                const updated = { ...prev };
                delete updated[productId];
                return updated;
            });

            alert("Product status updated successfully!");
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update product status.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">

            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                            <Shield className="w-8 h-8 text-indigo-300" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
                            <p className="text-indigo-200 font-medium">Platform Management & Seller Oversight</p>
                        </div>
                    </div>

                    <div className="flex bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 gap-6">
                        <div className="text-center px-4 border-r border-white/10">
                            <p className="text-3xl font-black text-white">{sellers.length}</p>
                            <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mt-1">Total Sellers</p>
                        </div>
                        <div className="text-center px-4">
                            <p className="text-3xl font-black text-emerald-400">{sellers.filter(s => (s.status || 'Active') === 'Active').length}</p>
                            <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mt-1">Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Toolbar */}
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Seller Directory</h2>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, email, or store..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full shadow-sm transition-all"
                        />
                    </div>
                </div>

                {/* Sellers Table */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-16 text-center flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium text-lg">Loading seller directory...</p>
                        </div>
                    ) : filteredSellers.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                <Users className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-lg font-bold text-gray-900 mb-1">No sellers found</p>
                            <p className="text-gray-500 text-sm max-w-sm">We couldn't find any sellers matching your search query. Try adjusting your filters.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Seller Identity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Store Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredSellers.map((seller) => (
                                    <tr key={seller.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                    {(seller.sellerName || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{seller.sellerName || 'Unknown Seller'}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">ID: #SLR-{(seller.id || 0).toString().padStart(4, '0')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-gray-800 flex items-center gap-1.5">
                                                <Store className="w-4 h-4 text-gray-400" /> {seller.shopName}
                                            </p>
                                            {seller.address && (
                                                <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]" title={seller.address}>
                                                    {seller.address}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-medium text-sm text-gray-900">{seller.email}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{seller.contactNumber}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            {getStatusBadge(seller.status || 'Active')}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleToggleSellerStatus(seller.id, seller.status || 'Active')}
                                                    className={`px-3 py-2 rounded-lg transition-colors border focus:outline-none inline-flex items-center gap-2 text-sm font-semibold shadow-sm ${(seller.status || 'Active') === 'Active'
                                                        ? 'text-rose-600 hover:text-white hover:bg-rose-600 border-rose-100 hover:border-rose-600'
                                                        : 'text-emerald-600 hover:text-white hover:bg-emerald-600 border-emerald-100 hover:border-emerald-600'
                                                        }`}
                                                    title={(seller.status || 'Active') === 'Active' ? "Disable Seller Account" : "Enable Seller Account"}
                                                >
                                                    {(seller.status || 'Active') === 'Active' ? (
                                                        <><ToggleRight className="w-4 h-4" /> Disable</>
                                                    ) : (
                                                        <><ToggleLeft className="w-4 h-4" /> Enable</>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => handleViewProducts(seller)}
                                                    className="px-3 py-2 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors border border-indigo-100 focus:outline-none inline-flex items-center gap-2 text-sm font-semibold shadow-sm"
                                                    title="View Seller Products"
                                                >
                                                    <Package className="w-4 h-4" /> View Products
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {!isLoading && filteredSellers.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-sm text-gray-500 flex justify-between items-center">
                        <span>Showing <span className="font-bold text-gray-900">{filteredSellers.length}</span> results</span>
                    </div>
                )}
            </div>

            {/* Seller Products Modal */}
            {isModalOpen && selectedSeller && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-2xl w-full max-w-4xl relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-indigo-600" />
                                    Products for {selectedSeller.sellerName || 'Seller'}
                                </h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
                            {isProductsLoading ? (
                                <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                    <p>Loading products for this seller...</p>
                                </div>
                            ) : sellerProducts.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
                                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 mb-1">No products found</p>
                                    <p className="text-sm">This seller hasn't submitted any products yet.</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price / Stock</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {sellerProducts.map(product => {
                                                const originalStatus = (product.status || product.Status || 'Pending').toLowerCase();
                                                const currentStatus = pendingStatusUpdates[product.id] || originalStatus;
                                                const hasChanged = pendingStatusUpdates[product.id] && pendingStatusUpdates[product.id] !== originalStatus;

                                                let badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                                                let Icon = Clock;

                                                if (currentStatus === 'approved') {
                                                    badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                                                    Icon = CheckCircle;
                                                } else if (currentStatus === 'rejected') {
                                                    badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
                                                    Icon = AlertCircle;
                                                }

                                                return (
                                                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-gray-900">{product.name || product.Name}</p>
                                                            <p className="text-sm text-gray-500 line-clamp-1 mt-0.5 max-w-sm">{product.description || product.Description}</p>
                                                        </td>
                                                        <td className="px-6 py-4 align-top">
                                                            <p className="font-semibold text-gray-900">${(product.price || product.Price || 0).toFixed(2)}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{product.stock || product.Stock} units qty</p>
                                                        </td>
                                                        <td className="px-6 py-4 align-top text-right">
                                                            <div className="flex flex-col items-end gap-2">
                                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}>
                                                                    <Icon className="w-3.5 h-3.5" />
                                                                    <select
                                                                        value={currentStatus}
                                                                        onChange={(e) => handleStatusSelection(product.id, e.target.value)}
                                                                        className="bg-transparent appearance-none outline-none cursor-pointer pr-4 uppercase tracking-wider"
                                                                        style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right center' }}
                                                                    >
                                                                        <option value="pending" className="text-amber-800 bg-amber-50">Pending</option>
                                                                        <option value="approved" className="text-emerald-800 bg-emerald-50">Approved</option>
                                                                        <option value="rejected" className="text-rose-800 bg-rose-50">Rejected</option>
                                                                    </select>
                                                                </div>
                                                                {hasChanged && (
                                                                    <button
                                                                        onClick={() => submitStatusChange(product.id)}
                                                                        className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm animate-in zoom-in-95 duration-200"
                                                                    >
                                                                        Submit Changes
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;
