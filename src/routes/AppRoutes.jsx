import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/auth/PrivateRoute';
import Login from '../components/auth/Login';
import OAuth2Callback from '../components/auth/OAuth2Callback';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import ImageTest from '../pages/ImageTest';

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/oauth2/redirect" element={<OAuth2Callback />} />

            {/* Private Routes */}
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Home />
                    </PrivateRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                }
            />
            <Route
                path="/image-test"
                element={
                    <PrivateRoute>
                        <ImageTest />
                    </PrivateRoute>
                }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
