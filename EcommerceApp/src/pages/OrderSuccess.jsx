import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const orderId = location.state?.orderId;

    return (
        <div className="container mx-auto px-4 py-16 max-w-3xl">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order placed successfully</h1>
                {orderId && (
                    <p className="text-gray-500 mb-6">Your order ID is: <span className="font-bold text-gray-900">{orderId}</span></p>
                )}
                <button
                    onClick={() => navigate('/home')}
                    className="inline-flex items-center justify-center bg-gray-900 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg hover:shadow-primary-500/30"
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
};

export default OrderSuccess;
