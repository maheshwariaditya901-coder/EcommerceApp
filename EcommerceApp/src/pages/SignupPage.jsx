import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, LogIn, Store, Shield } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import { registerUser, loginUser } from '../services/authService';
import Loader from '../components/Loader';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        role: 'User',
        storeName: '',
        address: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (formData.role === 'Seller') {
            if (!formData.storeName.trim()) {
                setLocalError('Store Name is required for Sellers');
                return;
            }
            if (!formData.address.trim()) {
                setLocalError('Store Address is required for Sellers');
                return;
            }
        }

        dispatch(loginStart());
        try {
            const response = await registerUser(formData);
            let user = response?.data?.user || response?.data;

            // If register response doesn't include a usable user, fallback to login
            if (!user?.id && !user?.Id) {
                const loginResponse = await loginUser({ email: formData.email, password: formData.password });
                if (!loginResponse.success) {
                    throw new Error(loginResponse.message || 'Login failed after registration');
                }
                user = loginResponse.user;
            }

            dispatch(loginSuccess(user));

            const role = user?.role;
            if (role === 'Admin') navigate('/admin/dashboard');
            else if (role === 'Seller') navigate('/seller/dashboard');
            else navigate('/home');

        } catch (err) {
            dispatch(loginFailure(err.response?.data?.message || err.message || 'Registration failed'));
        }
    };

    const roles = [
        { id: 'User', icon: UserPlus, label: 'Customer', desc: 'Shop & track orders' },
        { id: 'Seller', icon: Store, label: 'Seller', desc: 'Manage your store' },
        { id: 'Admin', icon: Shield, label: 'Admin', desc: 'Platform control' }
    ];

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-primary-200/20 blur-3xl mix-blend-multiply"></div>
                <div className="absolute bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-200/20 blur-3xl mix-blend-multiply"></div>
            </div>

            <div className="max-w-xl w-full animate-in slide-in-from-bottom-8 duration-500">
                <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-gray-100/50 backdrop-blur-xl bg-white/90">
                    <div className="text-center mb-10">
                        <div className="mx-auto w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-primary-100 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                            <UserPlus size={32} className="text-primary-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an Account</h2>
                        <p className="mt-3 text-gray-500 text-sm font-medium">Join us and start your journey</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {(error || localError) && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center shadow-sm animate-in fade-in duration-300">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                {localError || error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 font-medium">Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 placeholder:text-gray-400 font-medium transition-all"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 font-medium">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 placeholder:text-gray-400 font-medium transition-all"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 font-medium">Phone Number</label>
                                <input
                                    name="phoneNumber"
                                    type="tel"
                                    required
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 placeholder:text-gray-400 font-medium transition-all"
                                    placeholder="+1 (234) 567-8900"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 font-medium">Password</label>
                                    <div className="relative">
                                        <input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength="6"
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 placeholder:text-gray-400 font-medium transition-all"
                                            placeholder="Min 6 characters"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 font-medium">Confirm</label>
                                    <div className="relative">
                                        <input
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            minLength="6"
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 placeholder:text-gray-400 font-medium transition-all"
                                            placeholder="Repeat password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3 font-medium">Select Account Type</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {roles.map((r) => {
                                        const Icon = r.icon;
                                        const isSelected = formData.role === r.id;
                                        return (
                                            <div
                                                key={r.id}
                                                onClick={() => setFormData({ ...formData, role: r.id })}
                                                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 text-center flex flex-col items-center justify-center h-full relative overflow-hidden group ${isSelected
                                                    ? 'border-primary-600 bg-primary-50 shadow-sm'
                                                    : 'border-gray-100/50 bg-gray-50 hover:bg-white hover:border-primary-200 hover:shadow-sm'
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute -top-6 -right-6 w-12 h-12 bg-primary-600 rounded-full flex items-end justify-start pb-2 pl-2">
                                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className={`p-2 rounded-full mb-3 flex-shrink-0 transition-colors ${isSelected ? 'bg-primary-600 text-white shadow-inner' : 'bg-white text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 shadow-sm border border-gray-100'
                                                    }`}>
                                                    <Icon size={24} strokeWidth={isSelected ? 2 : 1.5} />
                                                </div>
                                                <span className={`block text-sm font-bold mb-1 transition-colors ${isSelected ? 'text-primary-900' : 'text-gray-900'
                                                    }`}>{r.label}</span>
                                                <span className={`block text-[10px] leading-tight transition-colors px-1 ${isSelected ? 'text-primary-700/80' : 'text-gray-500'
                                                    }`}>{r.desc}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {formData.role === 'Seller' && (
                                <div className="space-y-5 animate-in slide-in-from-top-4 fade-in duration-300">
                                    <div className="pt-2 border-t border-gray-100"></div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 font-medium">Store Name</label>
                                        <input
                                            name="storeName"
                                            type="text"
                                            required={formData.role === 'Seller'}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 placeholder:text-gray-400 font-medium transition-all"
                                            placeholder="My Awesome Store"
                                            value={formData.storeName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 font-medium">Store Address</label>
                                        <input
                                            name="address"
                                            type="text"
                                            required={formData.role === 'Seller'}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 placeholder:text-gray-400 font-medium transition-all"
                                            placeholder="123 Store St, Commerce City"
                                            value={formData.address}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gray-900 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-900/10 hover:shadow-primary-600/30 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <svg className="w-4 h-4 ml-2 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-600 font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500 hover:underline transition-colors flex items-center justify-center gap-1 mt-1 inline-flex">
                            <LogIn size={16} /> Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
