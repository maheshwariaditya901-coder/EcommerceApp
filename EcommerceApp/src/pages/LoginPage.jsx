import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import { loginUser } from '../services/authService';
import Loader from '../components/Loader';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginStart());
        try {
            const response = await loginUser({ email, password });


            // Check if the authService caught an error
            if (!response.success) {
                dispatch(loginFailure(response.message));
                return;
            }

            // Dispatch the successful user payload
            dispatch(loginSuccess(response.user));

            // Redirect based on role (it's now nested under response.user)
            const role = response.user?.role;
            if (role === 'Admin') navigate('/admin/dashboard');
            else if (role === 'Seller') navigate('/seller/dashboard');
            else navigate('/home');

        } catch (err) {
            console.log(err);
            dispatch(loginFailure('An unexpected error occurred.'));
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-200/20 blur-3xl mix-blend-multiply"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-200/20 blur-3xl mix-blend-multiply"></div>
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-200/20 blur-3xl mix-blend-multiply"></div>
            </div>

            <div className="max-w-md w-full animate-in slide-in-from-bottom-8 duration-500">
                <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-gray-100/50 backdrop-blur-xl bg-white/90">
                    <div className="text-center mb-10">
                        <div className="mx-auto w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-primary-100 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                            <LogIn size={32} className="text-primary-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
                        <p className="mt-3 text-gray-500 text-sm font-medium">Please sign in to your account</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center shadow-sm animate-in fade-in duration-300">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email address</label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer transition-colors"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 font-medium cursor-pointer select-none">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-bold text-primary-600 hover:text-primary-500 transition-colors hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gray-900 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-900/10 hover:shadow-primary-600/30 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </div>

                        {/* Demo Credentials Helper */}
                        <div className="mt-8 pt-6 border-t border-gray-100/80 text-center space-y-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Demo Access</p>
                            <div className="flex flex-wrap justify-center gap-2 text-[10px] sm:text-xs">
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono border border-gray-200">admin@mail.com / 1234</span>
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono border border-gray-200">seller@mail.com / 1234</span>
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono border border-gray-200">user@mail.com / 1234</span>
                            </div>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-600 font-medium">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-bold text-primary-600 hover:text-primary-500 hover:underline transition-colors flex items-center justify-center gap-1 mt-1 inline-flex">
                            <UserPlus size={16} /> Create one now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
