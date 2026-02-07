import React, { useState, useEffect } from "react";
import CreateAuctionForm from "./CreateAuctionForm";
import API from "../../api";
import { Plus, Edit, Settings, Trash2 } from 'lucide-react'; // Changed Trash to Trash2 for consistency
import { useNavigate } from "react-router-dom";
import MainLoader from "../../components/MainLoader";


import { useAuth } from "../../context/AuthContext";

const AuctionLogo = ({ src, alt }) => {
    const [error, setError] = useState(false);
    if (error || !src) {
        return <div style={{ fontSize: '3rem', opacity: 0.3 }}>🏆</div>;
    }
    return (
        <img
            src={src}
            alt={alt}
            onError={() => setError(true)}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
        />
    );
};


export default function AuctionManagement() {
    const { isMaster } = useAuth();
    const [view, setView] = useState("LIST"); // LIST, CREATE
    const [auctions, setAuctions] = useState([]);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(false);
    const [selectedAuction, setSelectedAuction] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAuctions();
    }, [view]);

    const fetchAuctions = async () => {
        setLoading(true);
        try {
            const res = await API.get("/auction/all");
            setAuctions(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch auctions", err);
            setLoading(false);
        }
    };

    const handleStatusToggle = async (auction) => {
        const newStatus = auction.status === 'LIVE' ? 'UPCOMING' : 'LIVE';
        if (!window.confirm(`Are you sure you want to change status from ${auction.status} to ${newStatus}?`)) return;

        try {
            // Optimistic update
            setAuctions(prev => prev.map(a => a._id === auction._id ? { ...a, status: newStatus } : a));

            await API.put(`/auction/${auction._id}`, { status: newStatus });
        } catch (err) {
            console.error("Failed to update status", err);
            fetchAuctions(); // Revert on error
            alert("Failed to update status");
        }
    };

    const handleDeleteAuction = async (auction) => {
        if (!window.confirm(`⚠️ DANGER ZONE ⚠️\n\nAre you sure you want to PERMANENTLY DELETE the auction "${auction.name}"?\n\nThis will delete ALL related:\n- Teams\n- Players\n- Bids & Stats\n\nThis action CANNOT be undone.`)) return;

        try {
            await API.delete(`/auction/${auction._id}`);
            alert("Auction and all related data deleted successfully.");
            fetchAuctions();
        } catch (err) {
            console.error("Failed to delete auction", err);
            alert("Failed to delete auction: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div>
            {loading && <MainLoader loading={true} onRetry={fetchAuctions} />}
            {view === "LIST" && (
                <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                        <h2 style={{ color: "#1e3c72" }}>Auction Management</h2>
                        <button
                            onClick={() => setView("CREATE")}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: "#1e3c72", color: "white", padding: "10px 20px",
                                border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold"
                            }}
                        >
                            <Plus size={18} /> Create Auction
                        </button>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                        {['ALL', 'LIVE', 'UPCOMING', 'COMPLETED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                style={{
                                    padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
                                    background: statusFilter === status ? '#1e3c72' : '#f5f5f5',
                                    color: statusFilter === status ? 'white' : '#666',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {status === 'ALL' ? 'All Auctions' : status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {auctions.filter(a => statusFilter === 'ALL' || a.status === statusFilter).map(auction => (
                            <div key={auction._id} style={{ background: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                {/* Improved Logo Area */}
                                <div style={{ height: '140px', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>
                                    <AuctionLogo src={auction.logoUrl} alt={auction.name} />
                                </div>

                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#333' }}>{auction.name}</h3>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
                                            Teams: {auction.totalTeams || "-"} • Budget: {auction.pointsPerTeam ? `₹${(auction.pointsPerTeam / 10000000).toFixed(1)} Cr` : "-"}
                                        </p>
                                    </div>

                                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                                        {/* Status Toggle */}
                                        <label
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                                fontSize: '0.85rem', fontWeight: 'bold',
                                                color: auction.status === 'LIVE' ? '#d32f2f' : '#333'
                                            }}
                                            title="Toggle Live Status"
                                        >
                                            <div style={{ position: 'relative', width: '36px', height: '20px', background: auction.status === 'LIVE' ? '#ffcdd2' : '#e0e0e0', borderRadius: '20px', transition: 'background 0.3s' }}>
                                                <div style={{
                                                    position: 'absolute', top: '2px', left: auction.status === 'LIVE' ? '18px' : '2px',
                                                    width: '16px', height: '16px', background: auction.status === 'LIVE' ? '#d32f2f' : '#757575',
                                                    borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                                }} />
                                            </div>
                                            {auction.status === 'LIVE' ? 'LIVE' : auction.status}
                                            <input
                                                type="checkbox"
                                                checked={auction.status === 'LIVE'}
                                                onChange={() => handleStatusToggle(auction)}
                                                style={{ display: 'none' }}
                                            />
                                        </label>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {!isMaster() && (
                                                <button
                                                    onClick={() => navigate(`/admin/auction/${auction._id}`)}
                                                    style={{ background: '#e3f2fd', border: 'none', borderRadius: '5px', padding: '8px', cursor: 'pointer' }}
                                                    title="Manage Details"
                                                >
                                                    <Settings size={18} color="#1565c0" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setSelectedAuction(auction); setView("EDIT"); }}
                                                style={{ background: '#e8f5e9', border: 'none', borderRadius: '5px', padding: '8px', cursor: 'pointer' }}
                                                title="Edit Settings"
                                            >
                                                <Edit size={18} color="#2e7d32" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAuction(auction)}
                                                style={{ background: '#ffebee', border: 'none', borderRadius: '5px', padding: '8px', cursor: 'pointer' }}
                                                title="Delete Auction"
                                            >
                                                <Trash2 size={18} color="#d32f2f" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {view === "CREATE" || view === "EDIT" ? (
                <CreateAuctionForm
                    onCancel={() => { setView("LIST"); setSelectedAuction(null); }}
                    onSuccess={() => { setView("LIST"); fetchAuctions(); setSelectedAuction(null); }}
                    initialData={selectedAuction}
                />
            ) : null}

            {/* EditAuctionModal removed in favor of unified CreateAuctionForm */}
        </div>
    );
}
