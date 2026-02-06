import React, { useState } from 'react';
import { FaBars, FaChartBar, FaGavel, FaUsers, FaPlus, FaCog, FaEdit, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('All Auctions');
    const [sidebarOpen, setSidebarOpen] = useState(true);

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
                        <button className="create-btn"><FaPlus /> Create Auction</button>
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

                    <div className="auction-grid">
                        {/* Example Auction Card */}
                        <div className="auction-card">
                            <div className="card-image">
                                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Tata_IPL_Logo_2024.png/800px-Tata_IPL_Logo_2024.png" alt="IPL 2026" />
                            </div>
                        </div>
                        {/* Add more cards here dynamically */}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
