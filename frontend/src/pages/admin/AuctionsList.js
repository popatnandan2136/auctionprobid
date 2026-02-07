import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api";
import { Plus, Trash2, Gavel, Calendar, Edit, ExternalLink } from "lucide-react";
import MainLoader from "../../components/MainLoader";
import ActionModal from "../../components/ActionModal";

export default function AuctionsList() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });
    const navigate = useNavigate();

    const fetchAuctions = async () => {
        setLoading(true);
        try {
            // Try /auction/all first as per routes
            const res = await API.get("/auction/all");
            setAuctions(res.data);
        } catch (err) {
            console.error("Failed to fetch auctions", err);
            // Fallback trial if needed, but /auction/all should work
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions();
    }, []);

    const handleDelete = (id, name) => {
        setModalConfig({
            isOpen: true,
            type: 'confirm',
            title: 'Delete Auction?',
            message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: async () => {
                try {
                    await API.delete(`/auction/${id}`);
                    setModalConfig({ isOpen: true, type: 'success', title: 'Deleted', message: 'Auction deleted permenantly.', confirmText: 'Okay' });
                    fetchAuctions();
                } catch (err) {
                    setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'Failed to delete auction.', confirmText: 'Close' });
                }
            }
        });
    };

    if (loading) return <MainLoader />;

    return (
        <div style={{ padding: "20px", background: "#f4f6f8", minHeight: "100vh" }}>
            <ActionModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h2 style={{ color: "#1e3c72", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                    <Gavel size={28} /> Auctions Management
                </h2>
                <Link to="/admin/create-auction" style={{ textDecoration: "none" }}>
                    <button style={{
                        background: "#1e3c72", color: "white", padding: "12px 24px", borderRadius: "8px", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                    }}>
                        <Plus size={20} /> Create New Auction
                    </button>
                </Link>
            </div>

            {auctions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📭</div>
                    <h3>No Auctions Found</h3>
                    <p style={{ color: "#666", marginBottom: "30px" }}>Get started by creating your first auction event.</p>
                    <Link to="/admin/create-auction">
                        <button style={{ padding: "10px 20px", background: "#2e7d32", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Create Now</button>
                    </Link>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" }}>
                    {auctions.map(auction => (
                        <div key={auction._id} style={{
                            background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                            border: "1px solid #eee", transition: "transform 0.2s", position: "relative", display: "flex", flexDirection: "column"
                        }}>
                            <div style={{ height: "140px", background: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                                {auction.logoUrl ? (
                                    <img src={auction.logoUrl} alt={auction.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <Gavel size={60} color="#90caf9" />
                                )}
                                <div style={{
                                    position: "absolute", top: "10px", right: "10px",
                                    background: auction.status === 'LIVE' ? '#4caf50' : (auction.status === 'UPCOMING' ? '#ff9800' : '#9e9e9e'),
                                    color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold"
                                }}>
                                    {auction.status}
                                </div>
                            </div>

                            <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                                <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "1.2rem" }}>{auction.name}</h3>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#666", fontSize: "0.9rem", marginBottom: "15px" }}>
                                    <Calendar size={16} />
                                    {new Date(auction.auctionDate).toLocaleDateString()}
                                </div>

                                <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
                                    <button
                                        onClick={() => navigate(`/admin/auction/${auction._id}`)}
                                        style={{ flex: 1, padding: "10px", background: "#1565c0", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}
                                    >
                                        <Edit size={16} /> Manage
                                    </button>
                                    <button
                                        onClick={() => handleDelete(auction._id, auction.name)}
                                        style={{ padding: "10px", background: "#ffebee", color: "#c62828", border: "1px solid #ffcdd2", borderRadius: "6px", cursor: "pointer" }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
