import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../api";
import { Users, Shield, Award, Power, Key } from "lucide-react";
import MainLoader from "../../components/MainLoader";
import ActionModal from "../../components/ActionModal";

export default function AdminHome() {
    const { user, isMaster } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

    // Password Reset State
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetData, setResetData] = useState({ userId: "", userName: "", newPassword: "" });

    useEffect(() => {
        if (isMaster()) fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await API.get("/admin");
            setAdmins(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch admins", err);
        }
    };

    const toggleStatus = async (id) => {
        try {
            await API.put(`/admin/${id}/status`);
            fetchAdmins();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const openResetModal = (id, name) => {
        setResetData({ userId: id, userName: name, newPassword: "" });
        setShowResetModal(true);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await API.post("/auth/reset-user-password", { userId: resetData.userId, newPassword: resetData.newPassword });
            setShowResetModal(false);
            setModalConfig({
                isOpen: true,
                type: 'success',
                title: 'Success',
                message: 'Password updated successfully!',
                confirmText: 'Okay'
            });
        } catch (err) {
            setModalConfig({
                isOpen: true,
                type: 'danger',
                title: 'Error',
                message: err.response?.data?.message || "Failed to update password",
                confirmText: 'Close'
            });
        }
    };

    return (
        <div>
            {loading && <MainLoader loading={true} onRetry={fetchAdmins} />}
            <ActionModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            {/* Password Reset Modal */}
            {showResetModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '10px', width: '400px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Key size={20} /> Reset Password</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Enter new password for <strong>{resetData.userName}</strong></p>
                        <form onSubmit={handleResetPassword}>
                            <input
                                type="text"
                                placeholder="New Password"
                                value={resetData.newPassword}
                                onChange={e => setResetData({ ...resetData, newPassword: e.target.value })}
                                required
                                style={{ width: '100%', padding: '10px', margin: '15px 0', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowResetModal(false)} style={{ padding: '8px 15px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '8px 15px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <h2 style={{ marginBottom: "20px", color: '#1e3c72' }}>Welcome, {user?.name}</h2>

            {!isMaster() && (
                <div style={{ display: "flex", gap: "20px", marginBottom: '40px' }}>
                    <div className="card" style={{ flex: 1, padding: "20px", textAlign: "center", background: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <Shield size={30} color="#1565c0" />
                        <h3>Auctions</h3>
                        <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "10px 0" }}>Manage</p>
                    </div>
                    <div className="card" style={{ flex: 1, padding: "20px", textAlign: "center", background: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <Users size={30} color="#2e7d32" />
                        <h3>Players</h3>
                        <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "10px 0" }}>Approve Request</p>
                    </div>
                </div>
            )}


        </div>
    );
}
