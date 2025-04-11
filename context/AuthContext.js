import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null); // 👉 Agregado para el token
    const [loading, setLoading] = useState(false);

    const handleLogin = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setToken(null); // 👉 Limpia el token al cerrar sesión
    };

    return (
        <AuthContext.Provider 
            value={{
                isAuthenticated,
                user,
                token,            // 👉 Agregado
                loading,
                setLoading,
                handleLogin,
                handleLogout,
                setToken          // 👉 Agregado
            }}
        >
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

export default AuthContext;
