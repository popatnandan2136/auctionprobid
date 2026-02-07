import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';
import MainLoader from '../../components/MainLoader';
import { FaBars, FaChartBar, FaGavel, FaUsers, FaPlus, FaCog, FaEdit, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All Auctions');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Auctions on Mount
    useEffect(() => {
        fetchAuctions();
    }, []);

    const fetchAuctions = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/auctions/all'); // Updated endpoint
            setAuctions(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching auctions:", err);
            setError("Failed to load auctions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this auction? This cannot be undone.")) {
            try {
                await API.delete(`/auctions/${id}`);
                setAuctions(auctions.filter(a => a._id !== id));
            } catch (err) {
                alert("Failed to delete auction");
            }
        }
    };

    const getFilteredAuctions = () => {
        if (activeTab === 'All Auctions') return auctions;
        if (activeTab === 'Live') return auctions.filter(a => a.status === 'LIVE');
        if (activeTab === 'Upcoming') return auctions.filter(a => a.status === 'NOT_STARTED' || a.status === 'UPCOMING');
        if (activeTab === 'Completed') return auctions.filter(a => a.status === 'FINISHED');
        return auctions;
    };

    if (loading) return <MainLoader />;

    return (
        <div className="admin-layout">
            {/* Header */}
            <header className="admin-header">
                <div className="header-left">
                    <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <FaBars />
                    </button>
                    <div className="logo">
                        <span className="logo-text">ProBidAuction</span>
                    </div>
                </div>
                <div className="header-right">
                </div>
            </header>

            <div className="admin-body">
                {/* Sidebar */}
                <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-section">
                        <h3 className="sidebar-title">ADMIN MENU</h3>
                        <ul className="sidebar-menu">
                            <li className="menu-item active">
                                <FaChartBar className="menu-icon" /> Dashboard
                            </li>
                            <li className="menu-item">
                                <FaGavel className="menu-icon" /> Auctions
                            </li>
                            <li className="menu-item">
                                <FaUsers className="menu-icon" /> Player Management
                            </li>
                        </ul>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="admin-main">
                    <div className="main-header">
                        <h2>Auction Management</h2>
                        <button className="create-btn" onClick={() => navigate('/admin/create-auction')}><FaPlus /> Create Auction</button>
                    </div>

                    <div className="tabs">
                        {['All Auctions', 'Live', 'Upcoming', 'Completed'].map((tab) => (
                            <button
                                key={tab}
                                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}

                    <div className="auction-grid">
                        {getFilteredAuctions().length === 0 && !loading && !error && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#666' }}>
                                No auctions found. Create one to get started!
                            </div>
                        )}

                        {getFilteredAuctions().map(auction => (
                            <div className="auction-card" key={auction._id}>
                                <div className="card-image">
                                    <img
                                        src={auction.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png"}
                                        alt={auction.name}
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png" }}
                                    />
                                </div>
                                <div className="card-content">
                                    <h3>{auction.name}</h3>
                                    <p className="card-meta">Teams: {auction.totalTeams} • Budget: ₹{(auction.pointsPerTeam / 10000000).toFixed(2)} Cr</p>
                                    <div className="card-footer">
                                        <div className={`status-badge ${auction.status.toLowerCase()}`}>
                                            <span className="status-dot"></span> {auction.status}
                                        </div>
                                        <div className="card-actions">
                                            <button className="action-btn settings" title="Manage Auction" onClick={() => navigate(`/admin/auction/${auction._id}`)}><FaCog /></button>
                                            <button className="action-btn settings" title="Public View" onClick={() => navigate(`/auction/${auction._id}`)}><FaUsers /></button>
                                            <button className="action-btn delete" title="Delete" onClick={(e) => handleDelete(e, auction._id)}><FaTrash /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
