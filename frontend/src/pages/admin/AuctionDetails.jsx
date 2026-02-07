import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import MainLoader from '../../components/MainLoader';
import TeamForm from '../../components/TeamForm';
import PlayerForm from '../../components/PlayerForm';
import {
    FaArrowLeft, FaUsers, FaPlus, FaTrash, FaDesktop, FaHandshake, FaGavel, FaCoins, FaEdit
} from 'react-icons/fa';
import './AuctionDetails.css';

const AuctionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Data State
    const [auction, setAuction] = useState(null);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [activeTab, setActiveTab] = useState('TEAMS');
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [showBonusModal, setShowBonusModal] = useState(false);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null); // For editing
    const [bonusAmount, setBonusAmount] = useState('');
    const [bonusTeamId, setBonusTeamId] = useState('ALL');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [auctionRes, teamsRes, playersRes] = await Promise.all([
                API.get(`/auctions/${id}`),
                API.get(`/teams/auction/${id}`),
                API.get(`/players/auction/${id}`)
            ]);
            setAuction(auctionRes.data);
            setTeams(teamsRes.data);
            setPlayers(playersRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setLoading(false);
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (window.confirm("Are you sure? This will delete the team and reset its players.")) {
            try {
                await API.delete(`/teams/${teamId}`);
                fetchData();
            } catch (err) {
                alert("Failed to delete team");
            }
        }
    };

    const handleAddBonus = async (e) => {
        e.preventDefault();
        try {
            await API.post('/teams/bonus', {
                auctionId: id,
                teamId: bonusTeamId,
                amount: bonusAmount
            });
            setShowBonusModal(false);
            setBonusAmount('');
            fetchData(); // Refresh to see updated points
        } catch (err) {
            alert("Failed to add bonus points");
        }
    };

    if (loading) return <MainLoader />;
    if (!auction) return <div className="text-center mt-10">Auction not found</div>;

    return (
        <div className="admin-layout">
            {/* Main Content Area */}
            <div className="auction-details-container">
                {/* Header Card */}
                <div className="auction-header-card">
                    <div className="auction-info">
                        <button className="icon-btn" onClick={() => navigate('/admin/dashboard')} style={{ fontSize: '20px', marginRight: '10px' }}>
                            <FaArrowLeft />
                        </button>
                        <img
                            src={auction.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png"}
                            alt={auction.name}
                            className="auction-logo-large"
                        />
                        <div className="auction-title">
                            <h1>{auction.name}</h1>
                            <div className="auction-meta">
                                <span>Date: {new Date(auction.createdAt).toLocaleDateString()}</span>
                                <span className={`status-badge ${auction.status === 'LIVE' ? 'live-badge' : ''}`} style={{ color: auction.status === 'LIVE' ? 'red' : 'gray' }}>
                                    {auction.status === 'LIVE' && '●'} {auction.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button className="btn-action btn-blue">
                            <FaDesktop /> Team Preview
                        </button>
                        <button className="btn-action btn-orange">
                            <FaHandshake /> Partner Preview
                        </button>
                        <button className="btn-action btn-pink" onClick={() => navigate(`/admin/auction/${id}/table`)}>
                            <FaGavel /> Go to Auction Table
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-nav">
                    <button className={`tab-btn ${activeTab === 'TEAMS' ? 'active' : ''}`} onClick={() => setActiveTab('TEAMS')}>TEAMS</button>
                    <button className={`tab-btn ${activeTab === 'SPONSORS' ? 'active' : ''}`} onClick={() => setActiveTab('SPONSORS')}>SPONSORS</button>
                    <button className={`tab-btn ${activeTab === 'PLAYERS' ? 'active' : ''}`} onClick={() => setActiveTab('PLAYERS')}>PLAYERS</button>
                </div>

                {/* TEAMS CONTENT */}
                {activeTab === 'TEAMS' && (
                    <div>
                        <div className="section-header">
                            <div className="section-title">Participating Teams ({teams.length})</div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-action btn-yellow" onClick={() => setShowBonusModal(true)}>
                                    <FaCoins /> Bonus Points
                                </button>
                                <button className="btn-action btn-green" onClick={() => { setSelectedTeam(null); setShowTeamModal(true); }}>
                                    <FaPlus /> Add Team
                                </button>
                            </div>
                        </div>

                        <div className="teams-grid">
                            {teams.map(team => (
                                <div key={team._id} className="team-card">
                                    <div className="team-info">
                                        <img
                                            src={team.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png"}
                                            alt={team.name}
                                            className="team-logo"
                                        />
                                        <div className="team-details">
                                            <h3>{team.name}</h3>
                                            <p>Owner: {team.ownerName}</p>
                                            <p style={{ marginTop: '5px', fontWeight: 'bold', color: '#666' }}>Points: {team.totalPoints}</p>
                                        </div>
                                    </div>
                                    <div className="team-actions">
                                        <button className="icon-btn" onClick={() => { setSelectedTeam(team); setShowTeamModal(true); }}>
                                            <FaEdit />
                                        </button>
                                        <button className="icon-btn delete" onClick={() => handleDeleteTeam(team._id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PLAYERS CONTENT */}
                {activeTab === 'PLAYERS' && (
                    <div>
                        <div className="section-header">
                            <div className="section-title">Players Pool ({players.length})</div>
                            <button className="btn-action btn-green" onClick={() => setShowPlayerModal(true)}>
                                <FaPlus /> Add Player
                            </button>
                        </div>
                        {/* Simple List for now */}
                        <div style={{ background: 'white', borderRadius: '10px', padding: '20px' }}>
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                        <th style={{ padding: '10px' }}>Name</th>
                                        <th style={{ padding: '10px' }}>Category</th>
                                        <th style={{ padding: '10px' }}>Base Price</th>
                                        <th style={{ padding: '10px' }}>Status</th>
                                        <th style={{ padding: '10px' }}>Sold Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {players.map(player => (
                                        <tr key={player._id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                            <td style={{ padding: '10px' }}>{player.name}</td>
                                            <td style={{ padding: '10px' }}>{player.category}</td>
                                            <td style={{ padding: '10px' }}>{player.basePrice}</td>
                                            <td style={{ padding: '10px' }}>
                                                <span className={`status-badge`}>{player.status}</span>
                                            </td>
                                            <td style={{ padding: '10px' }}>{player.soldPrice || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* SPONSORS CONTENT - Placeholder */}
                {activeTab === 'SPONSORS' && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <h3>Sponsors Management Coming Soon</h3>
                    </div>
                )}
            </div>

            {/* MODALS */}

            {/* Bonus Points Modal */}
            {showBonusModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add Bonus Points</h3>
                            <button className="close-btn" onClick={() => setShowBonusModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddBonus}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Select Team</label>
                                <select
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    value={bonusTeamId}
                                    onChange={(e) => setBonusTeamId(e.target.value)}
                                >
                                    <option value="ALL">All Teams</option>
                                    {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Points Amount</label>
                                <input
                                    type="number"
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    value={bonusAmount}
                                    onChange={(e) => setBonusAmount(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn-action btn-yellow" style={{ width: '100%', justifyContent: 'center' }}>
                                Add Points
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Team Form Modal */}
            {showTeamModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>{selectedTeam ? 'Edit Team' : 'Add New Team'}</h3>
                            <button className="close-btn" onClick={() => setShowTeamModal(false)}>×</button>
                        </div>
                        <TeamForm
                            auctionId={id}
                            initialData={selectedTeam}
                            onSuccess={() => { setShowTeamModal(false); fetchData(); }}
                            onCancel={() => setShowTeamModal(false)}
                        />
                    </div>
                </div>
            )}

            {/* Player Form Modal */}
            {showPlayerModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h3>Add Player</h3>
                            <button className="close-btn" onClick={() => setShowPlayerModal(false)}>×</button>
                        </div>
                        <PlayerForm
                            auctionId={id}
                            onSuccess={() => { setShowPlayerModal(false); fetchData(); }}
                            onCancel={() => setShowPlayerModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuctionDetails;
