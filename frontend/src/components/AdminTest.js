import React, { useState } from "react";
import API from "../api";

export default function AdminTest({ addLog }) {
    const [name, setName] = useState("Admin User");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("password123");

    const createAdmin = async () => {
        try {
            const res = await API.post("/admin", { name });
            if (res.data.credentials) {
                setEmail(res.data.credentials.email);
                setPassword(res.data.credentials.password);
            }
            addLog("CREATE ADMIN SUCCESS", res.data);
        } catch (err) {
            addLog("CREATE ADMIN ERROR", err.response?.data);
        }
    };

    return (
        <div style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
            <h3>🛡️ Admin Management (Master Only)</h3>
            <div style={{ display: "flex", gap: "10px" }}>
                <input placeholder="Admin Name" value={name} onChange={(e) => setName(e.target.value)} />
                <button onClick={createAdmin}>Create Admin</button>
            </div>
            {email && <p style={{ fontSize: "0.8em" }}>Created: {email} / {password}</p>}
        </div>
    );
}
