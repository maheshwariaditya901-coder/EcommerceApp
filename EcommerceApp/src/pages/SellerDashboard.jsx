import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Edit2, Trash2, X, Search, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { getSellerProducts, addProduct, updateProduct, deleteProduct } from '../services/productService';

const SellerDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

    const [currentProduct, setCurrentProduct] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        userId: user?.id || '',
        status: 'Pending',
        image: ''
    });

    // --- FETCH PRODUCTS FROM API ---
    const fetchProducts = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const data = await getSellerProducts(user.id);
            const safeData = Array.isArray(data) ? data : (data?.data || data?.products || []);

            const normalizedData = safeData.map((p, ix) => ({
                ...p,
                id: p.id || p.Id || `unique_fallback_${Date.now()}_${ix}`
            }));

            setProducts(normalizedData);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [user?.id]);

    // --- HANDLERS ---
    const handleOpenModal = (mode, product = null) => {
        setModalMode(mode);
        if (mode === 'edit' && product) {
            const normalizedStatus = (product.status || product.Status || 'Pending').toLowerCase();
            if (normalizedStatus === 'rejected') {
                alert("Rejected products cannot be edited.");
                return;
            }

                setCurrentProduct({
                    id: product.id || product.Id,
                    name: product.name || product.Name || '',
                    description: product.description || product.Description || '',
                    price: product.price || product.Price || '',
                    stock: product.stock || product.Stock || '',
                    userId: product.userId || product.UserId || user?.id || '',
                    status: product.status || product.Status || 'Pending',
                    image: product.image || product.Image || product.imageUrl || product.ImageUrl || ''
                });
            setIsModalOpen(true);
            return;
        }

        setCurrentProduct({
            name: '',
            description: '',
            price: '',
            stock: '',
            userId: user?.id || '',
            status: 'Pending',
            image: ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();

        if (modalMode === 'edit' && currentProduct.status?.toLowerCase() === 'rejected') {
            alert("Rejected products cannot be edited.");
            return;
        }

        if (!currentProduct.name || !currentProduct.description || !currentProduct.price || !currentProduct.stock) {
            alert("Please fill in all required fields.");
            return;
        }

        const normalizedImage = currentProduct.image?.trim() || '';
        console.log(currentProduct.image);

        try {
            if (modalMode === 'add') {
                const newProductPayload = {
                    name: currentProduct.name,
                    description: currentProduct.description,
                    price: parseFloat(currentProduct.price),
                    stock: parseInt(currentProduct.stock, 10),
                    userId: parseInt(currentProduct.userId, 10),
                    ImageUrl: normalizedImage,
                    // Status is typically set to 'Pending' automatically by the Backend.
                };

                await addProduct(newProductPayload);
                await fetchProducts();
            } else {
                const updatePayload = {
                    id: currentProduct.id,
                    name: currentProduct.name,
                    description: currentProduct.description,
                    price: parseFloat(currentProduct.price),
                    stock: parseInt(currentProduct.stock, 10),
                    image: normalizedImage,
                    Image: normalizedImage,
                    imageUrl: normalizedImage,
                    ImageUrl: normalizedImage
                };

                await updateProduct(currentProduct.id, updatePayload);
                await fetchProducts();
            }

            handleCloseModal();
        } catch (error) {
            alert("An error occurred while saving the product.");
            console.error(error);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(id);
                await fetchProducts();
            } catch (error) {
                alert("An error occurred while deleting the product.");
                console.error(error);
            }
        }
    };

    // --- STATUS HELPERS ---
    const getStatusIcon = (status) => {
        const s = status?.toLowerCase() || 'pending';
        if (s === 'approved') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
        if (s === 'rejected') return <AlertCircle className="w-4 h-4 text-rose-500" />;
        if (s === 'disabled') return <XCircle className="w-4 h-4 text-slate-500" />;
        return <Clock className="w-4 h-4 text-amber-500" />;
    };

    const getStatusBadgeClass = (status) => {
        const s = status?.toLowerCase() || 'pending';
        if (s === 'approved') return "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (s === 'rejected') return "bg-rose-50 text-rose-700 border-rose-200";
        if (s === 'disabled') return "bg-slate-50 text-slate-700 border-slate-200";
        return "bg-amber-50 text-amber-700 border-amber-200";
    };

    // Compute Derived Product Lists
    const approvedProducts = products.filter(p => {
        const s = (p.status || p.Status || 'Pending').toLowerCase();
        return s === 'approved';
    });

    const nonApprovedProducts = products.filter(p => {
        const s = (p.status || p.Status || 'Pending').toLowerCase();
        return s !== 'approved';
    });

    // Render Table Helper
    const renderTable = (productList, emptyMessage) => (
        <div className="overflow-x-auto">
            {isLoading ? (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p>Loading your products...</p>
                </div>
            ) : productList.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                    <p className="text-lg font-medium text-gray-700 mb-1">{emptyMessage}</p>
                </div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price / Stock</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {productList.map((product) => {
                            const currentStatus = product.status || product.Status || 'Pending';
                            const normalizedStatus = currentStatus.toLowerCase();
                            const statusLabel = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
                            const isRejected = normalizedStatus === 'rejected';
                            return (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-900">{product.name || product.Name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 line-clamp-2">{product.description || product.Description}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-900">${(product.price || product.Price || 0).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{product.stock || product.Stock} in stock</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(currentStatus)}`}>
                                            {getStatusIcon(currentStatus)}
                                            {statusLabel}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal('edit', product)}
                                                disabled={isRejected}
                                                className={`p-2 rounded-lg transition-colors ${isRejected ? 'text-gray-300 cursor-not-allowed hover:bg-transparent' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                                title={isRejected ? "Rejected products cannot be edited" : "Edit Product"}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Delete Product"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Dashboard Header */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
                    <p className="text-gray-500">Manage your product listings and inventory</p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="relative z-10 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-md shadow-indigo-200 shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    Add New Product
                </button>
            </div>

            {/* Approved Products Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-emerald-700 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Live Product List ({approvedProducts.length})
                    </h2>
                </div>
                {renderTable(approvedProducts, "No approved products yet.")}
            </div>

            {/* Pending / Rejected Products Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-amber-700 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Approvals & Rejected ({nonApprovedProducts.length})
                    </h2>
                </div>
                {renderTable(nonApprovedProducts, "No pending or rejected products.")}
            </div>

            {/* Add / Edit Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
                                </h3>
                                {modalMode === 'add' && (
                                    <p className="text-xs text-amber-600 mt-1 font-medium bg-amber-50 px-2 py-1 rounded-md inline-block">
                                        Note: New products require admin approval before becoming Live.
                                    </p>
                                )}
                            </div>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="product-form" onSubmit={handleSaveProduct} className="space-y-5">

                                {/* Product Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Product Name <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={currentProduct.name}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                        placeholder="e.g., Wireless Earbuds"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>

                                {/* Product Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Description <span className="text-rose-500">*</span></label>
                                    <textarea
                                        required
                                        value={currentProduct.description}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                        placeholder="Product details and features..."
                                        rows="3"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Image URL <span className="text-rose-500">*</span></label>
                                    <input
                                        type="url"
                                        required
                                        value={currentProduct.image}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.value })}
                                        placeholder="https://example.com/product.jpg"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {/* Price */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Price ($) <span className="text-rose-500">*</span></label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            required
                                            value={currentProduct.price}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>

                                    {/* Stock */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Stock Amount <span className="text-rose-500">*</span></label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            required
                                            value={currentProduct.stock}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, stock: e.target.value })}
                                            placeholder="e.g., 50"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>

                                    {/* UserId */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">User ID <span className="text-rose-500">*</span></label>
                                        <input
                                            type="number"
                                            disabled
                                            value={currentProduct.userId}
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-gray-50/50 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="product-form"
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                            >
                                {modalMode === 'add' ? 'Add Product' : 'Save Changes'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default SellerDashboard;
