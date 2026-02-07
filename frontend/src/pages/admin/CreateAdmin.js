import React, { useState } from "react";
import API from "../../api";
import { User, Phone, Mail, Shield, CheckCircle } from 'lucide-react';

export default function CreateAdmin() {
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        role: "ADMIN"
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const res = await API.post("/admin/create-admin", formData);
            setMessage(`Success! Admin created. Credentials sent to mobile.`); // Mock message
            setFormData({ name: "", mobile: "", email: "", role: "ADMIN" });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create admin");
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
            <h2 style={{ color: "#1e3c72", marginBottom: "20px", display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={28} /> Create New Admin
            </h2>

            {message && <div style={{ background: "#e8f5e9", color: "#2e7d32", padding: "15px", borderRadius: "5px", marginBottom: "20px", display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={20} /> {message}</div>}
            {error && <div style={{ background: "#ffebee", color: "#c62828", padding: "15px", borderRadius: "5px", marginBottom: "20px" }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ background: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>Admin Name</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: "1px solid #ccc", borderRadius: "5px", padding: "0 10px" }}>
                        <User size={20} color="#666" />
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={{ width: "100%", padding: "12px", border: "none", outline: "none" }}
                            placeholder="Enter full name"
                            required
                        />
                    </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>Mobile Number</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: "1px solid #ccc", borderRadius: "5px", padding: "0 10px" }}>
                        <Phone size={20} color="#666" />
                        <input
                            type="text"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            style={{ width: "100%", padding: "12px", border: "none", outline: "none" }}
                            placeholder="10-digit mobile number"
                            required
                        />
                    </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>Email Address</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: "1px solid #ccc", borderRadius: "5px", padding: "0 10px" }}>
                        <Mail size={20} color="#666" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={{ width: "100%", padding: "12px", border: "none", outline: "none" }}
                            placeholder="admin@example.com"
                            required
                        />
                    </div>
                </div>

                    <div style={{ marginBottom: "30px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>Role</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "12px", borderRadius: "5px", border: "1px solid #ccc" }}>
                        <option value="ADMIN">Admin</option>
                        <option value="MASTER_ADMIN">Master Admin</option>
                    </select>
                </div>


                <button type="submit" style={{ width: "100%", padding: "12px", background: "#1e3c72", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" }}>
                    Create Admin
                </button>
            </form>
        </div>
    );
}