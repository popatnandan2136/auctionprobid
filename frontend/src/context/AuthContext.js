import React, { createContext, useState, useEffect, useContext } from "react";
import API, { setToken } from "../api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check session storage for token (Tab-specific session)
        const token = sessionStorage.getItem("token");
        const storedUser = sessionStorage.getItem("user");
        if (token && storedUser) {
            try {
                setToken(token); // <--- FIX: Set header on load
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (mobile, password) => {
        try {
            const res = await API.post("/auth/login", { mobile, password });
            const { token, user } = res.data;

            sessionStorage.setItem("token", token);
            sessionStorage.setItem("user", JSON.stringify(user));
            setToken(token); // <--- FIX: Set header on login
            setUser(user);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Login failed" };
        }
    };

    const forgotPassword = async (mobile) => {
        try {
            await API.post("/auth/forgot-password", { mobile });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Failed to send OTP" };
        }
    };

    const resetPassword = async (mobile, otp, newPassword) => {
        try {
            await API.post("/auth/reset-password", { mobile, otp, newPassword });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Reset failed" };
        }
    };

    const logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    const isAdmin = () => user?.role === "ADMIN" || user?.role === "MASTER_ADMIN";
    const isMaster = () => user?.role === "MASTER_ADMIN";

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, isMaster, loading, forgotPassword, resetPassword }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
