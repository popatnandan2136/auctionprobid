import React, { useEffect, useState } from "react";
import { Calendar, Clock, Edit } from "lucide-react";
import EditAuctionModal from "./EditAuctionModal";
import API from "../../api";

import { useAuth } from "../../context/AuthContext";

const UpcomingAuctions = () => {
    const { isAdmin, isMaster } = useAuth();
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const res = await API.get("/auction/all");
                const upcoming = res.data.filter(a => a.status === 'NOT_STARTED');
                setAuctions(upcoming);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch auctions", err);
                setLoading(false);
            }
        };
        fetchAuctions();
    }, []);

    const fetchAuctions = async () => {
        try {
            const res = await API.get("/auction/all");
            const upcoming = res.data.filter(a => a.status === 'NOT_STARTED');
            setAuctions(upcoming);
        } catch (err) {
            console.error("Failed to fetch auctions", err);
        }
    };

    const handleEditClick = (auction) => {
        setSelectedAuction(auction);
        setIsEditModalOpen(true);
    };

    if (loading) return <div>Loading upcoming auctions...</div>;

    if (auctions.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                <h3>No Upcoming Auctions</h3>
                <p>Stay tuned for new announcements!</p>
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ marginBottom: '20px', color: '#1e3c72' }}>Upcoming Auctions</h2>
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {auctions.map((auction) => (
                    <div key={auction._id} style={{
                        background: 'white', borderRadius: '10px', padding: '20px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '10px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {auction.logoUrl ? <img src={auction.logoUrl} alt="Logo" style={{ width: 50, height: 50, borderRadius: '50%' }} /> : <span style={{ fontSize: '2rem' }}>🗓️</span>}
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{auction.name}</h3>
                                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{auction.totalTeams || 0} Teams Registered</p>
                            </div>
                            {(isAdmin() || isMaster()) && (
                                <button
                                    onClick={() => handleEditClick(auction)}
                                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#1e3c72' }}
                                    title="Edit Auction"
                                >
                                    <Edit size={18} />
                                </button>
                            )}
                        </div>

                        <div style={{ marginTop: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', marginBottom: '5px' }}>
                                <Calendar size={16} />
                                <span>{new Date(auction.auctionDate || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                                <Clock size={16} />
                                <span>{new Date(auction.auctionDate || Date.now()).toLocaleTimeString()}</span>
                            </div>
                        </div>

                        <button disabled style={{
                            marginTop: '10px',
                            background: '#e0e0e0', color: '#888', border: 'none', padding: '10px',
                            borderRadius: '5px', fontWeight: 'bold', cursor: 'not-allowed', width: '100%'
                        }}>
                            Starts Soon
                        </button>
                    </div>
                ))}
            </div>


            <EditAuctionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                auction={selectedAuction}
                onUpdate={fetchAuctions}
            />
        </div >
    );
};

export default UpcomingAuctions;