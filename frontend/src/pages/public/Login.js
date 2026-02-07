import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ActionModal from "../../components/ActionModal";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    // Modal State for Forgot Password Message
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const res = await login(mobile, password);
        if (res.success) {
            navigate("/admin");
        } else {
            setError(res.message);
        }
    };

    const handleForgotPassword = () => {
        setModalConfig({
            isOpen: true,
            type: 'info',
            title: 'Forgot Password?',
            message: "For password recovery, please contact ProBid Owner:\n\n👤 Nandan Popat\n📞 7048470585",
            confirmText: 'Understood'
        });
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
            <ActionModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "40px", background: "white", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>

                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                    <img src={require('../../assets/logo.png')} alt="ProBid" style={{ height: '50px', marginBottom: '10px' }} />
                    <h2 style={{ color: "#1e3c72", margin: 0 }}>ProBid Login</h2>
                </div>

                {error && <div style={{ background: "#ffebee", color: "#c62828", padding: "10px", borderRadius: "5px", marginBottom: "20px" }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Mobile or Email</label>
                        <input
                            type="text"
                            className="input-field"
                            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                            value={mobile}
                            onChange={e => { setMobile(e.target.value); setError(""); }}
                            placeholder="Enter Mobile or Email"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: "10px", position: "relative" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="input-field"
                            style={{ width: "100%", padding: "10px", paddingRight: "40px", borderRadius: "5px", border: "1px solid #ccc" }}
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(""); }}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: "absolute", right: "10px", top: "32px", background: "none", border: "none", cursor: "pointer", color: '#666' }}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                        <span onClick={handleForgotPassword} style={{ color: '#1e3c72', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Forgot Password?
                        </span>
                    </div>

                    <button type="submit" style={{ width: "100%", padding: "12px", background: "#1e3c72", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Start Bidding</button>
                </form>
            </div>
        </div>
    );
}
