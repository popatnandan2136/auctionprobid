import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, DollarSign, Award, Share2, Bus } from 'lucide-react';


const AuctionDashboard = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('remaining'); // remaining, sold, unsold, teams

    // Mock Data
    const auctionDetails = {
        name: "IPL 2026 Mega Auction",
        viewers: 1542,
        teams: [
            { id: 1, name: "CSK", budget: 45000000, players: 12, slots: 8, logo: "https://placehold.co/40" },
            { id: 2, name: "MI", budget: 32000000, players: 14, slots: 6, logo: "https://placehold.co/40" },
           
        ],
        players: {
            remaining: [
                { id: 101, name: "Virat Kohli", role: "Batsman", image: "https://placehold.co/60" },
                { id: 102, name: "Rohit Sharma", role: "Batsman", image: "https://placehold.co/60" }
            ],
            sold: [
                { id: 201, name: "Jasprit Bumrah", price: "12 Cr", team: "MI" }
            ],
            unsold: []
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src="https://placehold.co/60" alt="Logo" style={{ borderRadius: '50%' }} />
                        <div>
                            <h2 style={{ margin: 0, color: '#1e3c72' }}>{auctionDetails.name}</h2>
                            <p style={{ margin: '5px 0', color: '#666' }}>Live Viewers: <span style={{ color: 'red', fontWeight: 'bold' }}>{auctionDetails.viewers}</span></p>
                        </div>
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '25px', border: '1px solid #1e3c72', background: 'transparent', color: '#1e3c72', cursor: 'pointer' }}>
                        <Share2 size={18} /> Share Link
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <Users size={24} color="#1565c0" />
                    <h3>{auctionDetails.teams.length}</h3>
                    <p style={{ margin: 0 }}>Teams</p>
                </div>
                <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <Award size={24} color="#2e7d32" />
                    <h3>{auctionDetails.players.remaining.length}</h3>
                    <p style={{ margin: 0 }}>Remaining Players</p>
                </div>
                <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <DollarSign size={24} color="#ef6c00" />
                    <h3>{auctionDetails.players.sold.length}</h3>
                    <p style={{ margin: 0 }}>Sold Players</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                {['remaining', 'sold', 'unsold', 'teams'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '20px',
                            border: 'none',
                            background: activeTab === tab ? '#1e3c72' : '#e0e0e0',
                            color: activeTab === tab ? 'white' : '#333',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab} Players {tab === 'teams' ? '' : 'List'}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ background: 'white', borderRadius: '10px', padding: '20px', minHeight: '400px' }}>
                {activeTab === 'remaining' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                        {auctionDetails.players.remaining.map(player => (
                            <div key={player.id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '15px', textAlign: 'center' }}>
                                <img src={player.image} alt={player.name} style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px' }} />
                                <h4 style={{ margin: '5px 0' }}>{player.name}</h4>
                                <p style={{ color: '#666', fontSize: '0.9rem' }}>{player.role}</p>
                                <button style={{ width: '100%', marginTop: '10px', padding: '8px', background: '#1e3c72', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Bid Now</button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'teams' && (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {auctionDetails.teams.map(team => (
                            <div key={team.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #f0f0f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <img src={team.logo} alt="Team" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                    <div>
                                        <h4 style={{ margin: 0 }}>{team.name}</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Players: {team.players} | Slots: {team.slots}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontWeight: 'bold', color: '#2e7d32' }}>₹{team.budget.toLocaleString()}</p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Remaining</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'sold' && <p>Sold players list here...</p>}
                {activeTab === 'unsold' && <p>Unsold players list here...</p>}
            </div>
        </div>
    );
};

export default AuctionDashboard;
