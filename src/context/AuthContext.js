import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setLoading(false);
            // 토큰있으면 사용자로 인정
            setUser({authenticated: true })
        } else {
            setLoading(false);
        }
    }, []);

    const login = (accessToken, userData) => {
        localStorage.setItem('accessToken', accessToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
