import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const userInfo = JSON.parse(localStorage.getItem('user'));
                setUser(userInfo);
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            console.log('🔐 Login attempt:', email);
            const response = await authAPI.login(email, password);
            console.log('✅ Login API response:', response);
            console.log('📦 Response data:', response.data);

            // Check if 2FA is required
            if (response.data.requires2FA) {
                console.log('🔐 2FA required');
                return { requires2FA: true, email: response.data.email };
            }

            const { token, id, email: userEmail, fullName, roles } = response.data;
            console.log('🎫 Token:', token ? 'Received' : 'Missing');
            console.log('👤 User data:', { id, email: userEmail, fullName, roles });

            // Strip "ROLE_" prefix from role (backend sends "ROLE_CLIENT", we need "CLIENT")
            const role = roles[0].replace('ROLE_', '');
            console.log('🎭 Processed role:', role);

            localStorage.setItem('token', token);
            const userInfo = { id, email: userEmail, fullName, role };
            localStorage.setItem('user', JSON.stringify(userInfo));
            setUser(userInfo);

            console.log('✨ Login successful, user set:', userInfo);

            return { success: true };
        } catch (error) {
            console.error('❌ Login error:', error);
            console.error('📛 Error response:', error.response);
            console.error('📛 Error data:', error.response?.data);
            console.error('📛 Error message:', error.message);
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const signup = async (data) => {
        try {
            await authAPI.signup(data);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Signup failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
