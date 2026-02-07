import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

const FinishedAuctions = () => {
    const navigate = useNavigate();
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const res = await API.get("/auction/all");
                const finished = res.data.filter(a => a.status === 'FINISHED');
                setAuctions(finished);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch auctions", err);
                setLoading(false);
            }
        };
        fetchAuctions();
    }, []);

    if (loading) return <div>Loading finished auctions...</div>;

    if (auctions.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                <h3>No Finished Auctions</h3>
                <p>Check "Live" or "Upcoming" for active events.</p>
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ marginBottom: '20px', color: '#1e3c72' }}>Finished Auctions</h2>
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {auctions.map((auction) => (
                    <div key={auction._id} style={{
                        background: 'white', borderRadius: '10px', padding: '20px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.8
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {auction.logoUrl ? <img src={auction.logoUrl} alt="Logo" style={{ width: 50, height: 50, borderRadius: '50%' }} /> : <span style={{ fontSize: '2rem' }}>🏁</span>}
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{auction.name}</h3>
                                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Completed</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '10px' }}>
                            <span style={{ color: 'green', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <CheckCircle size={16} /> Auction Ended
                            </span>
                        </div>

                        <button
                            onClick={() => navigate(`/auction-view/${auction._id}`)}
                            style={{
                                marginTop: '10px',
                                background: '#1e3c72', color: 'white', border: 'none', padding: '10px',
                                borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', width: '100%'
                            }}>
                            View Results
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FinishedAuctions;