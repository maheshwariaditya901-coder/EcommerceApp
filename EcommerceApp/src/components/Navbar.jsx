import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { setCart, clearCart } from '../redux/slices/cartSlice';
import { getCartAPI } from '../services/cartService';
import { ShoppingCart, Heart, User, LogOut, Menu } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const cartItems = useSelector(state => state.cart.cartItems);
    const cartTotalItems = cartItems.reduce((acc, item) => acc + (item.Quantity || item.quantity || 0), 0);
    const isCustomer = user?.role === 'User';
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Rehydrate cart from API when user logs in or site loads
    useEffect(() => {
        const fetchCart = async () => {
            const userId = user?.id || user?.Id;
            if (isAuthenticated && userId) {
                try {
                    const dbCart = await getCartAPI(userId);
                    // Defensive mapping ensuring standard shape with ProductId + product object
                    if (Array.isArray(dbCart)) {
                        const mappedCart = dbCart.map(item => {
                            // Backend returning fields directly (e.g. ProductName, Quantity, Price)
                            // We assemble a complete 'product' object so CartPage renders it
                            const productId = item.id || null;
                            const productPart = item.product || item.Product || {
                                Id: productId, // VITAL: API MUST return ProductId!
                                Name: item.productName || item.ProductName || item.name || "Unknown Product",
                                Price: item.price || item.Price || 0,
                                Description: item.description || item.Description || item.productDescription || "No description provided.",
                                ...item // Keep any other raw props just in case
                            }; 
                            return {
                                UserId: item.UserId || item.userId,
                                ProductId: productId,
                                Quantity: item.Quantity || item.quantity || 1,
                                Description: item.Description || item.description || item.productDescription || '',
                                product: productPart
                            };
                        });
                        dispatch(setCart(mappedCart));
                    }
                } catch (error) {
                    console.error('Failed to load initial cart data from API:', error);
                }
            }
        };

        fetchCart();
    }, [isAuthenticated, user?.id, user?.Id, dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearCart());
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-primary-600 tracking-tight flex items-center gap-2">
                        <span className="bg-primary-600 text-white p-1 rounded-lg">E</span>Shop
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/home" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Home</Link>

                        <div className="flex items-center gap-5 ml-4">
                            {isAuthenticated && (
                                <div className="text-sm font-medium text-primary-600 mr-4">
                                    {/* Placeholders for future features */}
                                </div>
                            )}

                            {isAuthenticated ? (
                                <div className="flex items-center gap-3 ml-4">

                                    {user?.role === 'Admin' && (
                                        <Link to="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary-600">Admin</Link>
                                    )}
                                    {user?.role === 'Seller' && (
                                        <Link to="/seller/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary-600">Seller</Link>
                                    )}

                                    {isCustomer && (
                                        <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-primary-600">Order History</Link>
                                    )}

                                    {/* Cart Icon */}
                                    {isCustomer && (
                                        <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                                            <ShoppingCart size={20} />
                                            {cartTotalItems > 0 && (
                                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                    {cartTotalItems}
                                                </span>
                                            )}
                                        </Link>
                                    )}

                                    <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                                        <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                                        <button
                                            onClick={handleLogout}
                                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                                            title="Logout"
                                        >
                                            <LogOut size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 ml-4 border-l pl-4 border-gray-200">
                                    <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Login</Link>
                                    <Link to="/signup" className="text-sm font-medium bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Sign up</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button  & Cart Icon */}
                    <div className="md:hidden flex items-center gap-4">
                        {isAuthenticated && isCustomer && (
                            <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-primary-600">Order History</Link>
                        )}
                        {isAuthenticated && isCustomer && (
                            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                                <ShoppingCart size={20} />
                                {cartTotalItems > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {cartTotalItems}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button className="text-gray-500 hover:text-gray-700 p-2">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
