import React, { useState } from 'react';
import { FaBars, FaChartBar, FaGavel, FaUsers, FaPlus, FaTimes, FaImage, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './CreateAuction.css';
import './AdminDashboard.css'; // Reuse sidebar/header styles

const CreateAuction = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Form State
    const [auctionName, setAuctionName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [teams, setTeams] = useState(0);
    const [minPlayers, setMinPlayers] = useState(0);
    const [maxPlayers, setMaxPlayers] = useState(0);
    const [budget, setBudget] = useState(0);
    const [increment, setIncrement] = useState(10000);
    const [dateTime, setDateTime] = useState('');
    const [auctionType, setAuctionType] = useState('without_stats');

    // Tags State
    const [categories, setCategories] = useState(['Batsman', 'Bowler', 'All-Rounder', 'Wicket Keeper']);
    const [newCategory, setNewCategory] = useState('');

    const [roles, setRoles] = useState(['Opener', 'Middle Order', 'Finisher', 'Spinner', 'Fast Bowler']);
    const [newRole, setNewRole] = useState('');

    const addCategory = () => {
        if (newCategory) {
            setCategories([...categories, newCategory]);
            setNewCategory('');
        }
    };

    const removeCategory = (index) => {
        const newCats = [...categories];
        newCats.splice(index, 1);
        setCategories(newCats);
    };

    const addRole = () => {
        if (newRole) {
            setRoles([...roles, newRole]);
            setNewRole('');
        }
    };

    const removeRole = (index) => {
        const newRoles = [...roles];
        newRoles.splice(index, 1);
        setRoles(newRoles);
    };

    return (
        <div className="admin-layout">
            {/* Reuse Header */}
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
                {/* Reuse Sidebar */}
                <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-section">
                        <h3 className="sidebar-title">ADMIN MENU</h3>
                        <ul className="sidebar-menu">
                            <li className="menu-item" onClick={() => navigate('/admin/dashboard')}>
                                <FaChartBar className="menu-icon" /> Dashboard
                            </li>
                            <li className="menu-item active">
                                <FaGavel className="menu-icon" /> Auctions
                            </li>
                            <li className="menu-item">
                                <FaUsers className="menu-icon" /> Player Management
                            </li>
                        </ul>
                    </div>
                </aside>

                <main className="admin-main create-auction-container">
                    <div className="form-card">
                        <h2 className="page-title">Create New Auction</h2>

                        <div className="form-row">
                            <div className="form-group flex-2">
                                <label>Auction Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={auctionName}
                                    onChange={(e) => setAuctionName(e.target.value)}
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label>Auction Logo</label>
                                <div className="url-input-group">
                                    <button className="upload-btn"><FaImage /> Upload Logo</button>
                                    <span className="separator">OR</span>
                                    <input
                                        type="text"
                                        placeholder="Paste Image URL"
                                        className="form-input"
                                        value={logoUrl}
                                        onChange={(e) => setLogoUrl(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-row three-col">
                            <div className="form-group">
                                <label>Total Teams</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={teams}
                                    onChange={(e) => setTeams(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Min Players/Team</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={minPlayers}
                                    onChange={(e) => setMinPlayers(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Max Players/Team</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={maxPlayers}
                                    onChange={(e) => setMaxPlayers(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Total Budget Per Team</label>
                            <div className="currency-input">
                                <span className="currency-symbol">₹</span>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Increment Steps</label>
                                <div className="action-input-group">
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={increment}
                                        onChange={(e) => setIncrement(e.target.value)}
                                    />
                                    <button className="add-btn-square"><FaPlus /></button>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Auction Date & Time</label>
                            <div className="date-input-wrapper">
                                <input
                                    type="datetime-local"
                                    className="form-input"
                                    value={dateTime}
                                    onChange={(e) => setDateTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-row two-col">
                            <div className="form-group">
                                <label>Player Categories</label>
                                <div className="tags-container">
                                    {categories.map((cat, index) => (
                                        <span key={index} className="tag purple">
                                            {cat} <FaTimes className="tag-remove" onClick={() => removeCategory(index)} />
                                        </span>
                                    ))}
                                </div>
                                <div className="action-input-group mt-10">
                                    <input
                                        type="text"
                                        placeholder="New Category"
                                        className="form-input"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                    <button className="add-btn-square purple-btn" onClick={addCategory}><FaPlus /></button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Player Roles</label>
                                <div className="tags-container">
                                    {roles.map((role, index) => (
                                        <span key={index} className="tag orange">
                                            {role} <FaTimes className="tag-remove" onClick={() => removeRole(index)} />
                                        </span>
                                    ))}
                                </div>
                                <div className="action-input-group mt-10">
                                    <input
                                        type="text"
                                        placeholder="New Role"
                                        className="form-input"
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                    />
                                    <button className="add-btn-square orange-btn" onClick={addRole}><FaPlus /></button>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Auction Type</label>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="auctionType"
                                        value="without_stats"
                                        checked={auctionType === 'without_stats'}
                                        onChange={() => setAuctionType('without_stats')}
                                    /> Without Stats
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="auctionType"
                                        value="with_stats"
                                        checked={auctionType === 'with_stats'}
                                        onChange={() => setAuctionType('with_stats')}
                                    /> With Stats
                                </label>
                            </div>
                        </div>

                        <div className="form-actions-footer">
                            <button className="btn-cancel" onClick={() => navigate('/admin/dashboard')}>Cancel</button>
                            <button className="btn-create">Create Auction</button>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateAuction;
