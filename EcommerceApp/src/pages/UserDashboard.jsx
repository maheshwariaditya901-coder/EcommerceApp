import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Heart, Star, StarHalf, Store, CheckCircle, XCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { getAllProducts } from '../services/productService';
import { addToCartAPI } from '../services/cartService';

const UserDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quantities, setQuantities] = useState({});

    const handleQuantityChange = (productId, delta, maxStock) => {
        setQuantities(prev => {
            const current = prev[productId] || 1;
            const next = Math.max(1, Math.min(maxStock, current + delta));
            return { ...prev, [productId]: next };
        });
    };

    const handleAddToCartClick = async (product) => {
        // console.log(product);
        const productId = product.id || product.Id;
        const identifier = productId || product.name || product.Name;
        const qty = quantities[identifier] || 1;
        const userId = user?.id || user?.Id;
        const description = product.description || product.Description || '';
        const cartPayload = {
            UserId: userId,
            ProductId: productId,
            Quantity: qty,
            Description: description,
            product: {
                Id: productId,
                Name: product.name || product.Name,
                Price: product.price || product.Price || 0,
                Description: description,
                Image: product.image || product.Image || '',
                Stock: product.stock || product.Stock,
            }
        };
       // console.log("cartPayload", cartPayload);
        try {
            if (userId && productId) {
                await addToCartAPI(userId, productId, qty, description);
            }

            dispatch(addToCart(cartPayload));
        }
        catch (error) {
            console.warn("API Add to Cart failed. Ensure your backend endpoint /Cart/AddToCart exists.");
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);

                // The backend API already filters for 'Approved' products & 'Active' sellers!
                const productsResponse = await getAllProducts();

                // Parse correctly whether it returns an array directly or wraps it inside `.data`
                const allProducts = Array.isArray(productsResponse) ? productsResponse : (productsResponse?.data || productsResponse?.products || []);

                setProducts(allProducts);
                setIsLoading(false);

            } catch (error) {
                console.error("Failed to fetch live dashboard data.", error);

                // Keep the UI stable even if the API completely fails
                setProducts([]);
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);



    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Dashboard Header / Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-800 px-8 py-12 shadow-xl sm:px-12 sm:py-16">
                <div className="absolute inset-0 bg-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-2xl text-white">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-4">
                            Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Favorite</span> Item
                        </h1>
                        <p className="text-lg text-indigo-100 mb-6">Explore our curated collection of premium products across all categories. Unbeatable quality, matchless prices.</p>
                        <div className="relative max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-3 border-transparent rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm shadow-sm transition-all duration-300 bg-white/95"
                                placeholder="Search for products..."
                            />
                        </div>
                    </div>
                    <div className="hidden lg:block shrink-0">
                        <div className="w-64 h-64 bg-white/10 backdrop-blur-3xl rounded-full flex items-center justify-center p-8 shadow-[0_0_60px_-15px_rgba(255,255,255,0.2)] border border-white/20">
                            <ShoppingCart className="w-32 h-32 text-yellow-300 transform -rotate-12 hover:rotate-0 transition-transform duration-500 drop-shadow-lg" />
                        </div>
                    </div>
                </div>
            </div>



            {/* Products Grid */}
            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <div className="bg-gray-200 h-56 rounded-xl mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                                <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm block">
                        <div className="bg-gray-50 p-6 rounded-full inline-block mb-4">
                            <Search className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
                        <p className="text-gray-500 max-w-md">There are currently no products available on the platform.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product, idx) => {
                            const identifier = product.id || product.Id || product.name || product.Name || idx;
                            return (
                                <div
                                    key={identifier}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col"
                                >
                                    {/* Product Image */}
                                    <div className="relative h-64 w-full bg-gray-50 flex items-center justify-center p-6 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/5 to-transparent z-10"></div>
                                        <img
                                            src={product.image || product.Image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"}
                                            alt={product.name || product.Name}
                                            className="w-full h-full object-cover rounded-md group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-4 right-4 z-20">
                                            <button className="bg-white/80 backdrop-blur-md text-gray-400 hover:text-rose-500 p-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
                                                <Heart className="w-5 h-5 fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <Heart className="w-5 h-5 absolute inset-0 m-auto" />
                                            </button>
                                        </div>

                                        {(product.stock || product.Stock || 0) <= 5 && (product.stock || product.Stock || 0) > 0 && (
                                            <div className="absolute top-4 left-4 z-20">
                                                <span className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-full shadow-md animate-pulse">
                                                    Only {product.stock || product.Stock} Left
                                                </span>
                                            </div>
                                        )}

                                        {(product.stock || product.Stock || 0) <= 0 && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-30 flex items-center justify-center">
                                                <span className="bg-rose-600 text-white text-sm font-black uppercase tracking-widest py-2 px-4 rounded-lg shadow-xl -rotate-12">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="p-6 flex flex-col flex-grow bg-white relative border-t border-gray-100">

                                        {/* Header Info */}
                                        <div className="mb-4">
                                            {/* Seller Info */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px]">
                                                    {(product.sellerName || product.SellerName || 'S').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                                    {product.sellerName || product.SellerName || "Verified Seller"}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-extrabold text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors duration-300" title={product.name || product.Name}>
                                                {product.name || product.Name}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed min-h-[3rem]" title={product.description || product.Description}>
                                                {product.description || product.Description || "No product description provided."}
                                            </p>
                                        </div>

                                        {/* Footer Metadata */}
                                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5 mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 font-semibold mb-0.5 uppercase tracking-wider">Price</span>
                                                <span className="text-3xl font-black text-gray-900 tracking-tight">
                                                    <span className="text-lg align-top text-gray-500 mr-0.5">$</span>
                                                    {(product.price || product.Price || 0).toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="text-right flex flex-col items-end">
                                                <span className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">Availability</span>
                                                <span className={`text-sm font-bold flex items-center gap-1.5 ${(product.stock || product.Stock || 0) > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                                                    {(product.stock || product.Stock || 0) > 0 ? (
                                                        <><CheckCircle className="w-4 h-4" /> {(product.stock || product.Stock)} In Stock</>
                                                    ) : (
                                                        <><XCircle className="w-4 h-4" /> Sold Out</>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* CTA Add to Cart Button & Quantity */}
                                        <div className="flex items-center gap-3">
                                            {/* Quantity Selector */}
                                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1 shrink-0 h-[52px]">
                                                <button
                                                    onClick={() => handleQuantityChange(identifier, -1, product.Stock || product.stock || 0)}
                                                    disabled={(quantities[identifier] || 1) <= 1 || (product.stock || product.Stock || 0) <= 0}
                                                    className="w-10 h-full rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                                                >
                                                    <span className="text-xl font-medium leading-none mb-1">-</span>
                                                </button>
                                                <span className="w-8 text-center font-bold text-gray-900 text-sm">
                                                    {quantities[identifier] || 1}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(identifier, 1, product.Stock || product.stock || 0)}
                                                    disabled={(quantities[identifier] || 1) >= (product.Stock || product.stock || 0)}
                                                    className="w-10 h-full rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                                                >
                                                    <span className="text-xl font-medium leading-none mb-0.5">+</span>
                                                </button>
                                            </div>

                                            {/* Add to Cart Button */}
                                            <button
                                                key={product.id}
                                                onClick={() => handleAddToCartClick(product)}
                                                disabled={(product.stock || product.Stock || 0) <= 0}
                                                className={`flex-grow flex items-center justify-center gap-2 h-[52px] px-4 rounded-xl font-bold transition-all duration-300 shadow-lg group/btn overflow-hidden relative
                                                ${(product.stock || product.Stock || 0) > 0
                                                        ? "bg-gray-900 hover:bg-indigo-600 text-white hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                                                    }`}
                                            >
                                                <ShoppingCart className={`w-5 h-5 relative z-10 transition-transform ${(product.stock || product.Stock || 0) > 0 ? "group-hover/btn:-rotate-12 group-hover/btn:scale-110" : ""}`} />
                                                <span className="relative z-10 tracking-wide text-sm whitespace-nowrap">{(product.stock || product.Stock || 0) > 0 ? "Add to Cart" : "Unavailable"}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
};

export default UserDashboard;
