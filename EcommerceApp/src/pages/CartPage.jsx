import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react';
import { removeFromCart, clearCart } from '../redux/slices/cartSlice';
import { removeCartItemAPI, clearCartAPI } from '../services/cartService';

const CartPage = () => {
    const { cartItems } = useSelector(state => state.cart);
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userId = user?.id || user?.Id;
    

    const handleRemove = async (productId) => {
        // Optimistic UI update
        dispatch(removeFromCart(productId));

        try {
            if (userId) {
                await removeCartItemAPI(userId, productId);
            } else {
                console.warn("User ID missing, skipping API backend sync.");
            }
        } catch (error) {
            console.warn(`API remove cart item failed for product ${productId}.`);
        }
    };

    const handleClearCart = async () => {
        dispatch(clearCart());

        try {
            if (userId) {
                await clearCartAPI(userId);
            } else {
                console.warn("User ID missing, skipping API backend sync.");
            }
        } catch (error) {
            console.warn('API clear cart failed.');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const product = item.product || item.Product || item;
            const price = product.Price || product.price || 0;
            const quantity = item.Quantity || item.quantity || 0;
            return total + (price * quantity);
        }, 0);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-primary-600" />
                        Shopping Cart
                    </h1>
                    <p className="text-gray-500 mt-2">Manage your items and proceed to checkout</p>
                </div>
                {cartItems.length > 0 && (
                    <button
                        onClick={handleClearCart}
                        className="text-sm font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-rose-100 flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear Cart
                    </button>
                )}
            </div>

            {cartItems.length === 0 ? (
                /* Empty Cart State */
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <ShoppingCart className="w-16 h-16 text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Looks like you haven't added anything to your cart yet. Explore our products and find something you love.
                    </p>
                    <Link
                        to="/home"
                        className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 hover:-translate-y-0.5"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item, index) => {
                           // console.log(item);
                            const product = item.product || item.Product || item;
                            const id = item.ProductId;
        
                            const price = product.Price || product.price || 0;
                            const quantity = item.Quantity || item.quantity || 0;
                            const name = product.Name || product.name || "Unknown Product";
                            const image = product.Image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80";

                            return (
                                <div key={id || `cart-item-${index}`} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:shadow-md transition-shadow">
                                    {/* Product Image */}
                                    <div className="w-full sm:w-32 h-32 shrink-0 bg-gray-50 rounded-xl overflow-hidden relative">
                                        <img src={image} alt={name} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-grow flex flex-col min-w-0 w-full">
                                        <div className="flex justify-between items-start mb-2 gap-4">
                                            <h3 className="text-lg font-bold text-gray-900 truncate" title={name}>
                                                {name}
                                            </h3>
                                            <span className="text-lg font-black text-gray-900 whitespace-nowrap">
                                                ${(price * quantity).toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="text-sm text-gray-500 mb-4 line-clamp-1">
                                            {product.Description || product.description || "No description"}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                                            {/* Quantity Display */}
                                            <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
                                                <span className="text-gray-500 text-sm mr-2">Qty:</span>
                                                <span className="font-bold text-gray-900 text-sm">
                                                    {quantity}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className="text-xs text-gray-400 font-medium">
                                                    ${price.toFixed(2)} each
                                                </span>
                                                <button
                                                    onClick={() => handleRemove(id)}
                                                    className="text-gray-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                                                    title="Remove from cart"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Subtotal ({cartItems.reduce((a, b) => a + (b.Quantity || b.quantity || 0), 0)} items)</span>
                                    <span className="font-medium text-gray-900">${calculateTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Shipping Estimate</span>
                                    <span className="font-medium text-emerald-600">Free</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Tax Estimate</span>
                                    <span className="font-medium text-gray-900">${(calculateTotal() * 0.08).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-black text-gray-900">
                                        ${(calculateTotal() * 1.08).toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 text-right">Including VAT</p>
                            </div>

                            <button className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-primary-600 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 group">
                                <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Proceed to Checkout
                            </button>

                            <div className="mt-4 flex justify-center">
                                <Link to="/home" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1">
                                    <ArrowLeft className="w-4 h-4" /> Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
