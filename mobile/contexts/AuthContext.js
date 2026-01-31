import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('userInfo');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password, role) => {
        try {
            const response = await authAPI.login(email, password, role);
            const userData = response.data;

            await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            if (userData.token) {
                await AsyncStorage.setItem('token', userData.token);
            }

            setUser(userData);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userInfo');
            await AsyncStorage.removeItem('token');
            setUser(null);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const registerStudent = async (data) => {
        try {
            const response = await authAPI.studentRegister(data);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const registerManager = async (data) => {
        try {
            const response = await authAPI.managerRegister(data);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            registerStudent,
            registerManager,
            setUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
