import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaPlus } from 'react-icons/fa';
import PlayerForm from '../../components/PlayerForm'; // Import the component created earlier
import './CreateAuction.css'; // Reuse styles for consistency

const AuctionDetails = () => {
    const { id } = useParams(); // Get auction ID from URL
    const navigate = useNavigate();
    const [showPlayerModal, setShowPlayerModal] = useState(false);

    // Mock data for display - in real app, fetch using id
    const auctionName = "IPL 2026";

    return (
        <div className="admin-layout">
            {/* Header - simplified for this view */}
            <header className="admin-header">
                <div className="header-left">
                    <button className="menu-btn" onClick={() => navigate('/admin/dashboard')}>
                        <FaArrowLeft />
                    </button>
                    <div className="logo">
                        <span className="logo-text">{auctionName} - Management</span>
                    </div>
                </div>
                <div className="header-right">
                    <button
                        className="create-btn"
                        onClick={() => navigate(`/admin/auction/${id}/table`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
                    >
                        <FaUsers /> View Auction Table
                    </button>
                </div>
            </header>

            <div className="admin-main create-auction-container">
                <div className="form-card">
                    <div className="main-header" style={{ marginBottom: '20px' }}>
                        <h2>Player Management</h2>
                        <button className="create-btn" onClick={() => setShowPlayerModal(true)}>
                            <FaPlus /> Add Player
                        </button>
                    </div>

                    {/* Placeholder for Player List */}
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: '8px' }}>
                        <FaUsers size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                        <p>No players added yet. Click "Add Player" to start.</p>
                    </div>

                    {/* Player Form Modal/Overlay */}
                    {showPlayerModal && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
                        }}>
                            <div style={{ background: 'white', borderRadius: '10px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                                <div style={{ padding: '10px', textAlign: 'right' }}>
                                    <button onClick={() => setShowPlayerModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                                </div>
                                <div style={{ padding: '0 20px 20px 20px' }}>
                                    <PlayerForm
                                        auctionId={id}
                                        onSuccess={() => {
                                            alert("Player Added Successfully!");
                                            setShowPlayerModal(false);
                                        }}
                                        onCancel={() => setShowPlayerModal(false)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuctionDetails;
