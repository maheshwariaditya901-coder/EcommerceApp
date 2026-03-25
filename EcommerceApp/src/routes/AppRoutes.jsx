import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import MainLayout from '../layouts/MainLayout';

// Pages
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import UserDashboard from '../pages/UserDashboard';
import SellerDashboard from '../pages/SellerDashboard';
import AdminDashboard from '../pages/AdminDashboard';

const AppRoutes = () => {
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const role = user?.role;

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/home" element={isAuthenticated ? <UserDashboard /> : <Navigate to="/login" />} />
                <Route path="/seller/dashboard" element={isAuthenticated && role === 'Seller' ? <SellerDashboard /> : <Navigate to="/login" />} />
                <Route path="/admin/dashboard" element={isAuthenticated && role === 'Admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to={role === 'Seller' ? "/seller/dashboard" : role === 'Admin' ? "/admin/dashboard" : "/home"} /> : <LoginPage />} />
                <Route path="/signup" element={isAuthenticated ? <Navigate to={role === 'Seller' ? "/seller/dashboard" : role === 'Admin' ? "/admin/dashboard" : "/home"} /> : <SignupPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
};

export default AppRoutes;
