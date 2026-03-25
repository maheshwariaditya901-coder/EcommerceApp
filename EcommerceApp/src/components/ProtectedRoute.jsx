import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { isAuthenticated, user } = useSelector(state => state.auth);

    if (!isAuthenticated) {
        // Not logged in so redirect to login page with the return url
        return <Navigate to="/login" replace />;
    }

    // check if route is restricted by role
    if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
        // role not authorized so redirect to home page
        return <Navigate to="/home" replace />;
    }

    // authorized so return child components
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
