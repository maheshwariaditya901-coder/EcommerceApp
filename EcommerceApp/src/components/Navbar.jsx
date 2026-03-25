import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Heart, User, LogOut, Menu } from 'lucide-react';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
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

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
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
