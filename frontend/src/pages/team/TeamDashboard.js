import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../../api";
import { useAuth } from "../../context/AuthContext";
import { DollarSign, Clock, Trophy, Users, Eye } from "lucide-react";
import MainLoader from "../../components/MainLoader";

export default function TeamDashboard() {
    const { id } = useParams();
    const { user } = useAuth();
    const [auction, setAuction] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [bids, setBids] = useState([]);
    const [myTeam, setMyTeam] = useState(null);
    const [bidAmount, setBidAmount] = useState(0);
    const [loading, setLoading] = useState(true);

    const intervalRef = useRef(null);

    const updateState = (data) => {
        setAuction(data.auction);
        if (data.currentPlayer) {
            setCurrentPlayer(data.currentPlayer);
            setBids(data.currentPlayer.bids || []);
        } else {
            setCurrentPlayer(null);
            setBids([]);
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/bid/${id}/state`);
            if (user?.role === 'TEAM' && user?.teamId) {
                const teamRes = await API.get(`/team/${user.teamId}`);
                setMyTeam(teamRes.data);
            }
            updateState(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const startPolling = () => {
        intervalRef.current = setInterval(async () => {
            try {
                const res = await API.get(`/bid/${id}/state`);
                updateState(res.data);
                if (user?.role === 'TEAM' && user?.teamId) {
                    const teamRes = await API.get(`/team/${user.teamId}`);
                    setMyTeam(teamRes.data);
                }
            } catch (err) { console.error("Poll Error", err); }
        }, 3000);
    };

    const stopPolling = () => clearInterval(intervalRef.current);

    useEffect(() => {
        fetchInitialData();
        startPolling();
        return () => stopPolling();
    }, [id]);

    if (loading) return <MainLoader loading={true} onRetry={fetchInitialData} />;





    const handleBid = async (amount) => {
        if (!amount) return;
        try {
            await API.post("/bid/place", {
                auctionId: id,
                playerId: currentPlayer._id,
                teamId: user.teamId,
                amount: parseInt(amount)
            });
            // Optimistic update or wait for poll? Wait for poll is safer for sync
            // But we can trigger immediate poll
            const res = await API.get(`/bid/${id}/state`);
            updateState(res.data);
        } catch (err) {
            alert(err.response?.data?.message || "Bid Failed");
        }
    };

    const calculateNextBid = () => {
        if (!currentPlayer) return 0;
        const current = currentPlayer.currentTopBid || currentPlayer.basePrice;
        // Simple 5% or fixed increment logic
        // If increment steps exist in auction, use them?
        // Let's assume fixed increments for now or fetch from auction
        return current + 50000; // Default increment
    };

    if (!auction) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Auction...</div>;

    return (
        <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f7fa' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '15px 25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1e3c72' }}>{auction.name}</h2>
                    <span style={{ fontSize: '0.9rem', color: auction.status === 'COMPLETED' ? '#1e3c72' : (auction.isLive ? 'green' : 'red'), fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: auction.status === 'COMPLETED' ? '#1e3c72' : (auction.isLive ? 'green' : 'red') }}></span>
                        {auction.status === 'COMPLETED' ? "AUCTION COMPLETED" : (auction.isLive ? "LIVE AUCTION" : "PAUSED / UPCOMING")}
                    </span>
                </div>

                {/* Live Console Button */}
                <button
                    onClick={() => window.open(`/auction-view/${id}`, '_blank')}
                    style={{
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Eye size={20} />
                    Show Live Console
                </button>

                {myTeam && (
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>{myTeam.name}</div>
                        <div style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{myTeam.availablePoints.toLocaleString()}</div>
                        <small style={{ color: '#666' }}>Available Budget</small>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '20px', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>

                {/* Main: Current Player */}
                <div style={{ flex: 2 }}>
                    {currentPlayer ? (
                        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', zIndex: 0 }}></div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ width: '180px', height: '180px', background: '#fff', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '5px solid white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                                    {currentPlayer.imageUrl ? <img src={currentPlayer.imageUrl} alt="P" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : <Users size={80} color="#ddd" />}
                                </div>
                                <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>{currentPlayer.name}</h1>
                                <div style={{ display: 'inline-block', padding: '5px 15px', background: '#f0f0f0', borderRadius: '20px', color: '#666', fontWeight: '500' }}>
                                    {currentPlayer.category} • {currentPlayer.role}
                                </div>

                                {/* Player Stats Grid */}
                                {currentPlayer.stats && Object.keys(currentPlayer.stats).length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px', marginTop: '20px', padding: '0 20px' }}>
                                        {Object.entries(currentPlayer.stats).map(([key, value]) => (
                                            <div key={key} style={{ background: '#f8f9fa', padding: '10px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{key}</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3c72' }}>{value}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '40px' }}>
                                    <div>
                                        <small style={{ color: '#999', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Base Price</small>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#666' }}>₹{currentPlayer.basePrice.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <small style={{ color: '#999', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Current Bid</small>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e3c72' }}>
                                            ₹{(currentPlayer.currentTopBid || currentPlayer.basePrice).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Bidding Controls */}
                                {user?.role === 'TEAM' && auction.isLive && (
                                    <div style={{ marginTop: '40px', padding: '20px', background: '#f9f9f9', borderRadius: '15px' }}>
                                        <p style={{ marginBottom: '15px' }}>Quick Bid Options</p>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                            {(auction.incrementSteps && auction.incrementSteps.length ? auction.incrementSteps : [50000, 100000, 200000, 500000]).map(inc => {
                                                const nextBid = (currentPlayer.currentTopBid || currentPlayer.basePrice) + inc;
                                                return (
                                                    <button
                                                        key={inc}
                                                        onClick={() => handleBid(nextBid)}
                                                        disabled={myTeam && myTeam.availablePoints < nextBid}
                                                        style={{
                                                            padding: '12px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                                            background: (myTeam && myTeam.availablePoints < nextBid) ? '#ccc' : '#1e3c72',
                                                            color: 'white', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                            transition: 'transform 0.1s'
                                                        }}
                                                    >
                                                        + ₹{(inc / 100000).toFixed(1)}L
                                                        <br />
                                                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Total: ₹{(nextBid / 10000000).toFixed(2)}Cr</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '400px', background: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                            <Clock size={64} color="#ddd" />
                            <h3 style={{ color: '#999', marginTop: '20px' }}>Waiting for Auctioneer...</h3>
                        </div>
                    )}
                </div>

                {/* Sidebar: Bid History */}
                <div style={{ flex: 1 }}>
                    <div style={{ background: 'white', borderRadius: '15px', padding: '20px', height: '100%', maxHeight: '600px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 20px 0', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>Recent Bids</h3>
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '10px' }}>
                            {bids.map((bid, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '10px' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#e3f2fd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1565c0' }}>
                                        {bid.teamId?.name?.[0] || "T"}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{bid.teamId?.name || "Unknown Team"}</div>
                                        <small style={{ color: '#999' }}>{new Date(bid.time).toLocaleTimeString()}</small>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: '#2e7d32' }}>₹{bid.amount.toLocaleString()}</div>
                                </div>
                            ))}
                            {bids.length === 0 && <p style={{ textAlign: 'center', color: '#999', fontStyle: 'italic', marginTop: '20px' }}>No bids placed on this player yet.</p>}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
