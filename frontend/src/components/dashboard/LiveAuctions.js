import React, { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import MainLoader from "../../components/MainLoader";

const LiveAuctions = () => {
    const navigate = useNavigate();
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all and filter, or fetch specific endpoint. 
            const res = await API.get("/auction/all");
            // Filter only LIVE auctions
            const live = res.data.filter(a => a.status === 'LIVE');
            setAuctions(live);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch auctions", err);
            // Optionally keep loading true to trigger retry, or handle error
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleJoin = (id) => {
        navigate(`/auction-view/${id}`);
    };

    if (loading) return <MainLoader loading={true} onRetry={fetchData} />;

    if (auctions.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                <h3>No Auctions Live Right Now</h3>
                <p>Check "Upcoming" for scheduled auctions.</p>
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ marginBottom: '20px', color: '#1e3c72' }}>Live Auctions</h2>
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {auctions.map((auction) => (
                    <div key={auction._id} style={{
                        background: 'white', borderRadius: '10px', padding: '20px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '10px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {auction.logoUrl ? <img src={auction.logoUrl} alt="Logo" style={{ width: '50px', height: '50px', borderRadius: '50%' }} /> : <span style={{ fontSize: '2rem' }}>🏆</span>}
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{auction.name}</h3>
                                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{auction.totalTeams || 0} Teams</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <span className="live-badge">
                                ● LIVE
                            </span>
                            <button
                                onClick={() => handleJoin(auction._id)}
                                style={{
                                    background: '#28a745', color: 'white', border: 'none', padding: '8px 20px',
                                    borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'
                                }}
                            >
                                <Play size={16} /> Join
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveAuctions;
