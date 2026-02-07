import React, { useState } from "react";
import API, { setToken } from "../api";

export default function AuthTest({ setRole, setGlobalToken, addLog }) {
    const [email, setEmail] = useState("master@auction.com");
    const [password, setPassword] = useState("admin123");
    const [forgotEmail, setForgotEmail] = useState("");

    const login = async () => {
        try {
            const res = await API.post("/auth/login", { email, password });
            setToken(res.data.token);
            setGlobalToken(res.data.token);
            setRole(res.data.role);
            addLog("LOGIN SUCCESS", res.data);
            alert("Login Successful");
        } catch (err) {
            addLog("LOGIN ERROR", err.response?.data);
            alert("Login Failed");
        }
    };

    const registerAdminPublic = async () => {
        try {
            const res = await API.post("/auth/register-admin", {
                name: "New Public Admin",
                email: email,
                password: password,
                mobile: "9876543210"
            });
            addLog("REGISTER ADMIN SUCCESS", res.data);
        } catch (err) {
            addLog("REGISTER ADMIN ERROR", err.response?.data);
        }
    };

    const forgotPassword = async () => {
        try {
            const res = await API.post("/auth/forgot-password", { email: forgotEmail });
            addLog("FORGOT PASS SUCCESS", res.data);
        } catch (err) {
            addLog("FORGOT PASS ERROR", err.response?.data);
        }
    };

    return (
        <div style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
            <h3>🔐 Authentication</h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button onClick={login}>Login</button>
                <button onClick={registerAdminPublic}>Register Admin (Public)</button>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
                <input placeholder="Forgot Email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                <button onClick={forgotPassword}>Forgot Password</button>
            </div>
        </div>
    );
}
