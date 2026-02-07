import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Download, Search, Share2 } from "lucide-react";
import html2canvas from "html2canvas";
import API from "../../api";
import DetailsModal from "../../components/DetailsModal";

export default function AuctionPublicView() {
    const { id } = useParams();
    const [auction, setAuction] = useState(null);
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [activeTab, setActiveTab] = useState("live");
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalType, setModalType] = useState("PLAYER");

    const pollingRef = useRef(null);

    const openModal = async (type, data) => {
        setModalType(type);
        setModalData(data);
        setModalOpen(true);

        if (type === "PLAYER" && data._id) {
            try {
                const res = await API.get(`/player/${data._id}`);
                setModalData(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                console.error("Failed to fetch player details", err);
            }
        }
    };

    const fetchData = async () => {
        try {
            const [aucRes, playRes, teamRes] = await Promise.all([
                API.get(`/auction/${id}`),
                API.get(`/player/auction/${id}`),
                API.get(`/team/auction/${id}`)
            ]);

            setAuction(aucRes.data);
            setPlayers(playRes.data);
            setTeams(teamRes.data);

            // Fetch current player if auction is live
            if (aucRes.data.status === "LIVE" && aucRes.data.currentPlayerId) {
                try {
                    const stateRes = await API.get(`/bid/${id}/state`);
                    if (stateRes.data.currentPlayer) {
                        setCurrentPlayer(stateRes.data.currentPlayer);
                    }
                } catch (err) {
                    console.error("Failed to fetch current player", err);
                }
            } else {
                setCurrentPlayer(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Start polling for live updates
        const startPolling = () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
            pollingRef.current = setInterval(() => {
                fetchData();
            }, 3000); // Poll every 3 seconds
        };

        // Start polling immediately
        startPolling();

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [id]);

    // Player Profile Download Function
    const downloadPlayerProfile = async (player) => {
        const profileElement = document.getElementById(`player-profile-${player._id}`);
        if (!profileElement) return;

        try {
            const canvas = await html2canvas(profileElement, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true
            });

            const link = document.createElement('a');
            link.download = `${player.name.replace(/\s+/g, '_')}_Profile.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to download profile", err);
            alert("Failed to download profile. Please try again.");
        }
    };

    // Team Squad Download Function
    const downloadTeamSquad = async (team) => {
        const squadElement = document.getElementById(`team-squad-card-${team._id}`);
        if (!squadElement) return;

        try {
            const canvas = await html2canvas(squadElement, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true
            });

            const link = document.createElement('a');
            link.download = `${team.name.replace(/\s+/g, '_')}_Squad.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to download squad", err);
            alert("Failed to download squad. Please try again.");
        }
    };



    // Remaining Player Download Function
    const downloadRemainingCard = async (player) => {
        const element = document.getElementById(`remaining-player-card-${player._id}`);
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                backgroundColor: null,
                scale: 2,
                logging: false,
                useCORS: true
            });

            const link = document.createElement('a');
            link.download = `${player.name.replace(/\s+/g, '_')}_Profile.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to download remaining player card", err);
            alert("Failed to download remaining player card. Please try again.");
        }
    };

    // Sponsor Download Function
    const downloadSponsorCard = async (sponsor) => {
        const element = document.getElementById(`sponsor-card-${sponsor._id}`);
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                backgroundColor: null, // Allow transparency if needed, but usually we set background on the element
                scale: 2,
                logging: false,
                useCORS: true
            });

            const link = document.createElement('a');
            link.download = `${sponsor.name.replace(/\s+/g, '_')}_Sponsor.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to download sponsor card", err);
            alert("Failed to download sponsor card. Please try again.");
        }
    };

    // Top Buy Download Function
    const downloadTopBuyCard = async (player, rank) => {
        const element = document.getElementById(`top-buy-card-${player._id}`);
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                backgroundColor: null, // Allow transparency if needed, but usually we set background on the element
                scale: 2,
                logging: false,
                useCORS: true
            });

            const link = document.createElement('a');
            link.download = `TopBuy_${rank}_${player.name.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to download top buy card", err);
            alert("Failed to download top buy card. Please try again.");
        }
    };



    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚡</div>
                <h2>Loading Auction...</h2>
            </div>
        </div>
    );

    if (!auction) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2>Auction not found</h2>
        </div>
    );

    // Filter players based on search query
    const filterPlayers = (playerList) => {
        if (!searchQuery.trim()) return playerList;
        const query = searchQuery.toLowerCase();
        return playerList.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.role.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
    };

    const allSoldPlayers = players.filter(p => p.status === "SOLD");
    const allUnsoldPlayers = players.filter(p => p.status === "UNSOLD");
    const allRemainingPlayers = players.filter(p => p.status === "IN_AUCTION" || p.status === "AVAILABLE");

    const soldPlayers = filterPlayers(allSoldPlayers);
    const unsoldPlayers = filterPlayers(allUnsoldPlayers);
    const remainingPlayers = filterPlayers(allRemainingPlayers);
    const topBuys = allSoldPlayers.sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0)).slice(0, 5);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '20px',
                padding: '30px',
                marginBottom: '30px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 10px 0', fontSize: '3.5rem', fontWeight: '900', background: 'linear-gradient(90deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
                            {auction.name}
                        </h1>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.95rem', color: '#666' }}>
                            <span>🏆 Teams: <strong>{auction.totalTeams}</strong></span>
                            <span>💰 Purse/Team: <strong>₹{(auction.pointsPerTeam || 0).toLocaleString('en-IN')}</strong></span>
                            <span>Status: <span style={{
                                background: auction.status === 'LIVE' ? '#00e676' : '#ffa726',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                fontSize: '0.85rem'
                            }}>{auction.status}</span></span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center', padding: '10px 20px', background: '#f5f5f5', borderRadius: '10px' }}>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>SOLD</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00e676' }}>{soldPlayers.length}</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '10px 20px', background: '#f5f5f5', borderRadius: '10px' }}>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>REMAINING</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196f3' }}>{remainingPlayers.length}</div>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Auction link copied to clipboard!");
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                background: 'linear-gradient(90deg, #11998e, #38ef7d)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 15px rgba(56, 239, 125, 0.4)',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <Share2 size={18} />
                            Share
                        </button>
                    </div>
                </div>
            </div>



            {/* Tabs */}
            <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '15px',
                padding: '10px',
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
            }}>
                {[
                    { key: "live", label: "🔴 Live Console", show: true },
                    { key: "topbuys", label: "🌟 Top Buys", show: soldPlayers.length > 0 },
                    { key: "teams", label: "🏆 Teams", show: true },
                    { key: "sold", label: "✅ Sold", show: true },
                    { key: "unsold", label: "❌ Unsold", show: true },
                    { key: "remaining", label: "⏳ Remaining", show: true },
                    { key: "sponsors", label: "🤝 Sponsors", show: true }
                ].filter(tab => tab.show).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '12px 24px',
                            background: activeTab === tab.key ? 'linear-gradient(90deg, #667eea, #764ba2)' : 'transparent',
                            border: 'none',
                            borderRadius: '10px',
                            color: activeTab === tab.key ? 'white' : '#666',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            whiteSpace: 'nowrap',
                            boxShadow: activeTab === tab.key ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div>
                {/* Live Console */}
                {activeTab === "live" && (
                    <div>
                        <div style={{
                            background: 'rgba(0,0,0,0.9)',
                            borderRadius: '20px',
                            padding: '40px',
                            minHeight: '500px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                            marginBottom: '30px'
                        }}>
                            {currentPlayer ? (
                                <div>
                                    {/* Player Info */}
                                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                        <div style={{
                                            width: '150px',
                                            height: '150px',
                                            margin: '0 auto 20px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            border: '5px solid #00e5ff',
                                            boxShadow: '0 0 30px rgba(0, 229, 255, 0.5)'
                                        }}>
                                            {currentPlayer.imageUrl ? (
                                                <img src={currentPlayer.imageUrl} alt={currentPlayer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>👤</div>
                                            )}
                                        </div>
                                        <h1 style={{ color: 'white', fontSize: '3rem', margin: '0 0 10px 0' }}>{currentPlayer.name}</h1>
                                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            <span style={{ background: 'rgba(0, 229, 255, 0.2)', color: '#00e5ff', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
                                                {currentPlayer.role}
                                            </span>
                                            <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', padding: '8px 16px', borderRadius: '20px' }}>
                                                Base: ₹{(currentPlayer.basePrice || 0).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Current Bid */}
                                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                        <h3 style={{ color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '1rem', marginBottom: '10px' }}>Current Top Bid</h3>
                                        <div style={{
                                            background: 'rgba(0,0,0,0.6)',
                                            borderRadius: '20px',
                                            padding: '30px',
                                            border: '2px solid rgba(255, 215, 0, 0.3)',
                                            boxShadow: '0 0 40px rgba(255, 215, 0, 0.2)',
                                            display: 'inline-block',
                                            minWidth: '300px'
                                        }}>
                                            <div style={{
                                                fontSize: 'clamp(3rem, 8vw, 5rem)',
                                                fontWeight: '800',
                                                background: 'linear-gradient(to bottom, #ffd700, #ffa000)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))'
                                            }}>
                                                ₹{(currentPlayer.currentTopBid || 0).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Team Standings */}
                                    <div style={{ marginTop: '40px' }}>
                                        <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>Team Purse Status</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                                            {teams.map(team => (
                                                <div key={team._id} style={{
                                                    background: 'rgba(255,255,255,0.05)',
                                                    borderRadius: '10px',
                                                    padding: '15px',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    transition: 'all 0.3s'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                                        {team.logoUrl && (
                                                            <img src={team.logoUrl} alt={team.name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                                                        )}
                                                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{team.name}</span>
                                                    </div>
                                                    <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
                                                        <div>Available: <span style={{ color: '#00e676', fontWeight: 'bold' }}>₹{(team.availablePoints || 0).toLocaleString('en-IN')}</span></div>
                                                        <div>Squad: {team.playersBought || 0} / {auction.maxPlayersPerTeam}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: 'white', padding: '100px 20px' }}>
                                    <div style={{ fontSize: '5rem', marginBottom: '20px' }}>⏸️</div>
                                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Next Player Start Soon</h2>
                                    <p style={{ color: '#aaa', fontSize: '1.1rem' }}>The auctioneer will select the next player shortly...</p>
                                </div>
                            )}
                        </div>

                        {/* All Players Grid Below Live Console */}
                        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                            <h2 style={{ marginBottom: '20px', color: '#1e3c72' }}>All Players</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                {players.map(player => {
                                    const team = teams.find(t => t._id === (player.teamId?._id || player.teamId));
                                    return (
                                        <div
                                            key={player._id}
                                            onClick={() => openModal("PLAYER", player)}
                                            style={{
                                                background: 'white',
                                                borderRadius: '15px',
                                                padding: '20px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s',
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                border: player.status === 'SOLD' ? '2px solid #00e676' : player.status === 'UNSOLD' ? '2px solid #f44336' : '2px solid #2196f3'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #667eea', flexShrink: 0 }}>
                                                    {player.imageUrl ? (
                                                        <img src={player.imageUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: '0 0 5px 0' }}>{player.name}</h4>
                                                    <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                        {player.role}
                                                    </span>
                                                </div>
                                            </div>
                                            {team && (
                                                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                                                    Team: <strong>{team.name}</strong>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                <span>Base: ₹{(player.basePrice || 0).toLocaleString('en-IN')}</span>
                                                {player.soldPrice && <span style={{ color: '#00e676', fontWeight: 'bold' }}>Sold: ₹{player.soldPrice.toLocaleString('en-IN')}</span>}
                                            </div>
                                            <div style={{ marginTop: '10px', padding: '8px', background: player.status === 'SOLD' ? '#e8f5e9' : player.status === 'UNSOLD' ? '#ffebee' : '#e3f2fd', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: player.status === 'SOLD' ? '#2e7d32' : player.status === 'UNSOLD' ? '#c62828' : '#1565c0' }}>
                                                {player.status}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Buys */}
                {activeTab === "topbuys" && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {topBuys.map((player, index) => {
                            const team = teams.find(t => t._id === (player.teamId?._id || player.teamId));
                            return (
                                <div
                                    key={player._id}
                                    style={{ position: 'relative' }}
                                >
                                    {/* Hidden Downloadable Card with Rank-Based Design */}
                                    <div
                                        id={`top-buy-card-${player._id}`}
                                        style={{
                                            position: 'absolute',
                                            left: '-9999px',
                                            top: 0,
                                            width: '600px',
                                            height: '800px', // Fixed height for consistent look
                                            background: index === 0
                                                ? 'linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #FFD700 100%)' // Gold
                                                : index === 1
                                                    ? 'linear-gradient(135deg, #E0E0E0 0%, #F5F5F5 50%, #BDBDBD 100%)' // Silver
                                                    : index === 2
                                                        ? 'linear-gradient(135deg, #CD7F32 0%, #EDA87C 50%, #A0522D 100%)' // Bronze
                                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Premium Default
                                            padding: '40px',
                                            borderRadius: '30px',
                                            color: index === 1 ? '#333' : 'white', // Dark text for Silver
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            fontFamily: "'Segoe UI', sans-serif"
                                        }}
                                    >
                                        {/* Watermark Logo */}
                                        <img
                                            src="/probid_logo.png"
                                            alt="PROBID"
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                opacity: 0.1,
                                                width: '400px',
                                                zIndex: 0
                                            }}
                                        />

                                        {/* Header with Rank */}
                                        <div style={{ textAlign: 'center', zIndex: 1, width: '100%' }}>
                                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                                <h1 style={{ fontSize: '5rem', margin: 0, color: 'rgba(255,255,255,0.9)', textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>{auction.name}</h1>
                                            </div>
                                            <div style={{
                                                fontSize: '1.5rem',
                                                letterSpacing: '5px',
                                                opacity: 0.8,
                                                marginBottom: '10px',
                                                textTransform: 'uppercase'
                                            }}>
                                                Top Buy
                                            </div>
                                            <div style={{
                                                fontSize: '6rem',
                                                fontWeight: '900',
                                                lineHeight: 1,
                                                textShadow: '0 10px 20px rgba(0,0,0,0.2)'
                                            }}>
                                                #{index + 1}
                                            </div>
                                            <div style={{
                                                width: '100px',
                                                height: '4px',
                                                background: 'currentColor',
                                                margin: '20px auto',
                                                opacity: 0.5
                                            }}></div>
                                        </div>

                                        {/* Player Image */}
                                        <div style={{
                                            position: 'relative',
                                            zIndex: 1,
                                            width: '280px',
                                            height: '280px',
                                            borderRadius: '50%',
                                            border: '8px solid rgba(255,255,255,0.4)',
                                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                                            overflow: 'hidden'
                                        }}>
                                            {player.imageUrl ? (
                                                <img src={player.imageUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', background: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' }}>👤</div>
                                            )}
                                        </div>

                                        {/* info */}
                                        <div style={{ textAlign: 'center', zIndex: 1, width: '100%' }}>
                                            <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{player.name}</h1>

                                            {/* Extra Details */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '15px', fontSize: '0.9rem', opacity: 0.9 }}>
                                                {player.age && <span>Age: <strong>{player.age}</strong></span>}
                                                {player.country && <span>Country: <strong>{player.country}</strong></span>}
                                            </div>

                                            <div style={{
                                                fontSize: '1.5rem',
                                                padding: '10px 20px',
                                                background: 'rgba(255,255,255,0.2)',
                                                borderRadius: '30px',
                                                display: 'inline-block',
                                                marginBottom: '30px',
                                                backdropFilter: 'blur(5px)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                                                    {team?.logoUrl && (
                                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', background: 'white', padding: '2px' }}>
                                                            <img src={team.logoUrl} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </div>
                                                    )}
                                                    <span>{team?.name || 'Unknown Team'}</span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', background: 'rgba(0,0,0,0.1)', padding: '20px', borderRadius: '20px' }}>
                                                <div>
                                                    <div style={{ fontSize: '1rem', opacity: 0.8 }}>Base Price</div>
                                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>₹{(player.basePrice || 0).toLocaleString('en-IN')}</div>
                                                </div>
                                                <div style={{ width: '2px', background: 'rgba(255,255,255,0.3)' }}></div>
                                                <div>
                                                    <div style={{ fontSize: '1rem', opacity: 0.8 }}>Sold Price</div>
                                                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>₹{(player.soldPrice || 0).toLocaleString('en-IN')}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        {/* Footer */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                            padding: '30px 10px 10px',
                                            textAlign: 'center'
                                        }}>
                                            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>PROBID VERIFIED</span>
                                        </div>
                                    </div>

                                    {/* Visible Card */}
                                    <div
                                        onClick={() => openModal("PLAYER", player)}
                                        style={{
                                            background: 'rgba(255,255,255,0.95)',
                                            borderRadius: '20px',
                                            padding: '25px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            paddingBottom: '80px' // Space for footer
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        {/* Rank Badge */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '15px',
                                            right: '15px',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: index === 0 ? 'linear-gradient(135deg, #ffd700, #ffed4e)' : index === 1 ? 'linear-gradient(135deg, #c0c0c0, #e8e8e8)' : index === 2 ? 'linear-gradient(135deg, #cd7f32, #e8a87c)' : '#667eea',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            color: 'white',
                                            fontSize: '1.2rem',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                                        }}>
                                            #{index + 1}
                                        </div>

                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #667eea', flexShrink: 0 }}>
                                                {player.imageUrl ? (
                                                    <img src={player.imageUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.5rem' }}>{player.name}</h3>
                                                <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '4px 12px', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                    {player.role}
                                                </span>
                                            </div>
                                        </div>

                                        {team && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', background: '#f5f5f5', padding: '10px', borderRadius: '10px' }}>
                                                {team.logoUrl && (
                                                    <img src={team.logoUrl} alt={team.name} style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' }} />
                                                )}
                                                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                                    Sold To: <strong style={{ color: '#333', fontSize: '1rem' }}>{team.name}</strong>
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Base Price</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>₹{(player.basePrice || 0).toLocaleString('en-IN')}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Sold Price</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00e676' }}>₹{(player.soldPrice || 0).toLocaleString('en-IN')}</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadTopBuyCard(player, index + 1);
                                            }}
                                            style={{
                                                width: '100%',
                                                marginTop: '20px',
                                                padding: '10px',
                                                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontWeight: 'bold',
                                                transition: 'transform 0.2s',
                                                zIndex: 3
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <Download size={18} />
                                            Download Premium Card
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {topBuys.length === 0 && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.95)', borderRadius: '20px' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏆</div>
                                <h3 style={{ color: '#666' }}>No players sold yet</h3>
                                <p style={{ color: '#999' }}>Top buys will appear here once the auction begins</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Teams */}
                {activeTab === "teams" && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {teams.map(team => (
                            <div key={team._id} style={{ position: 'relative' }}>
                                {/* HIdden Team Squad Card for Download */}
                                <div
                                    id={`team-squad-card-${team._id}`}
                                    style={{
                                        position: 'absolute',
                                        left: '-9999px',
                                        width: '800px',
                                        background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                                        padding: '40px',
                                        borderRadius: '30px',
                                        color: '#333',
                                        fontFamily: "'Segoe UI', sans-serif",
                                        top: 0
                                    }}
                                >
                                    {/* Probid Watermark */}
                                    <img
                                        src="/probid_logo.png"
                                        alt="PROBID"
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            opacity: 0.05,
                                            width: '500px',
                                            zIndex: 0
                                        }}
                                    />

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
                                            <h1 style={{ fontSize: '5rem', margin: 0, color: '#333' }}>{auction.name}</h1>
                                            <h2 style={{ fontSize: '2rem', color: '#666', margin: '10px 0' }}>PROBID</h2>
                                        </div>
                                        {/* Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                {team.logoUrl ? (
                                                    <img src={team.logoUrl} alt={team.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🏆</div>
                                                )}
                                                <div>
                                                    <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#333' }}>{team.name}</h1>
                                                    <div style={{ fontSize: '1.2rem', color: '#666' }}>Official Squad {new Date().getFullYear()}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1rem', color: '#888' }}>Total Players</div>
                                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{team.playersBought || 0}</div>
                                            </div>
                                        </div>

                                        {/* Financials */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', background: '#f9f9f9', padding: '20px', borderRadius: '15px' }}>
                                            <div style={{ textAlign: 'center', flex: 1 }}>
                                                <div style={{ fontSize: '1rem', color: '#666' }}>Total Purse</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>₹{(team.totalPoints || 0).toLocaleString('en-IN')}</div>
                                            </div>
                                            <div style={{ width: '1px', background: '#ddd' }}></div>
                                            <div style={{ textAlign: 'center', flex: 1 }}>
                                                <div style={{ fontSize: '1rem', color: '#666' }}>Spent</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f44336' }}>₹{(team.spentPoints || 0).toLocaleString('en-IN')}</div>
                                            </div>
                                            <div style={{ width: '1px', background: '#ddd' }}></div>
                                            <div style={{ textAlign: 'center', flex: 1 }}>
                                                <div style={{ fontSize: '1rem', color: '#666' }}>Remaining</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00e676' }}>₹{(team.availablePoints || 0).toLocaleString('en-IN')}</div>
                                            </div>
                                        </div>

                                        {/* Player List (Old Design - List View) */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {players.filter(p => (p.teamId?._id || p.teamId) === team._id).map((p, i) => (
                                                <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', background: i % 2 === 0 ? '#f9f9f9' : 'white', borderRadius: '8px', border: '1px solid #eee' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <span style={{ color: '#999', fontWeight: 'bold', width: '25px' }}>{i + 1}.</span>
                                                        <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#333' }}>{p.name}</div>
                                                        <span style={{ fontSize: '0.9rem', color: '#666', background: '#e0e0e0', padding: '3px 8px', borderRadius: '4px' }}>{p.role}</span>
                                                    </div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#00c853' }}>₹{(p.soldPrice || 0).toLocaleString('en-IN')}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                            padding: '30px 10px 10px',
                                            textAlign: 'center'
                                        }}>
                                            <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>PROBID VERIFIED</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Visible Team Card */}
                                <div
                                    onClick={() => openModal("TEAM", team)}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,240,250,0.8))',
                                        borderRadius: '20px',
                                        padding: '25px',
                                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                                        border: '1px solid rgba(255, 255, 255, 0.4)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '15px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {/* Watermark */}
                                    <img src="/probid_logo.png" alt="PROBID" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05, width: '250px', zIndex: 0 }} />

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            {team.logoUrl ? (
                                                <div style={{ padding: '5px', background: 'white', borderRadius: '50%', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                                                    <img src={team.logoUrl} alt={team.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                                                </div>
                                            ) : (
                                                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0e0e0, #bdbdbd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>🏆</div>
                                            )}
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#333' }}>{team.name}</h3>
                                                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                                                    Purse Remaining: <span style={{ color: '#00e676', fontWeight: 'bold' }}>₹{(team.availablePoints || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#555', background: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: '10px' }}>
                                            <span>Players: <strong>{team.playersBought || 0}</strong></span>
                                            <span>Spent: <strong>₹{(team.spentPoints || 0).toLocaleString('en-IN')}</strong></span>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadTeamSquad(team);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                transition: 'transform 0.2s',
                                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <Download size={16} /> Download Squad
                                        </button>
                                    </div> {/* End Content Wrapper */}
                                    <div style={{ fontSize: '0.7rem', color: '#cbd5e0', textAlign: 'center', fontWeight: 'bold', letterSpacing: '1px' }}>PROBID VERIFIED</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Sold Players with Download */}
                {activeTab === "sold" && (
                    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '25px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                        {/* Search Bar */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '20px',
                            padding: '15px',
                            background: '#f8f9fa',
                            borderRadius: '10px'
                        }}>
                            <Search size={20} color="#667eea" />
                            <input
                                type="text"
                                placeholder="Search sold players by name, role, or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    background: 'transparent',
                                    padding: '5px'
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        background: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {soldPlayers.map(player => {
                                const team = teams.find(t => t._id === (player.teamId?._id || player.teamId));
                                return (
                                    <div key={player._id} style={{ position: 'relative' }}>
                                        {/* Hidden Profile Card for Download */}
                                        <div
                                            id={`player-profile-${player._id}`}
                                            style={{
                                                position: 'absolute',
                                                left: '-9999px',
                                                width: '600px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                padding: '40px',
                                                borderRadius: '20px',
                                                color: 'white'
                                            }}
                                        >
                                            {/* Probid Logo Watermark */}
                                            <img
                                                src="/probid_logo.png"
                                                alt="PROBID"
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    opacity: 0.1,
                                                    width: '350px',
                                                    zIndex: 0
                                                }}
                                            />

                                            {/* SOLD Badge Image (Visible) */}
                                            <img
                                                src="/probidSOLD.png"
                                                alt="SOLD"
                                                style={{
                                                    position: 'absolute',
                                                    top: '20px',
                                                    right: '20px',
                                                    width: '120px',
                                                    height: 'auto',
                                                    zIndex: 2,
                                                    filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.3))'
                                                }}
                                            />

                                            {/* SOLD Badge Image (Visible) */}
                                            <img
                                                src="/probidSOLD.png"
                                                alt="SOLD"
                                                style={{
                                                    position: 'absolute',
                                                    top: '20px',
                                                    right: '20px',
                                                    width: '120px',
                                                    height: 'auto',
                                                    zIndex: 2,
                                                    filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.3))'
                                                }}
                                            />

                                            <div style={{ position: 'relative', zIndex: 1 }}>
                                                {/* Header */}
                                                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                                    <h1 style={{ fontSize: '5rem', margin: '0 0 10px 0' }}>{auction.name}</h1>
                                                    <div style={{ fontSize: '2rem', opacity: 0.9 }}>Player Profile</div>
                                                </div>

                                                {/* Player Image */}
                                                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                                    <div style={{ width: '200px', height: '200px', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', border: '5px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                                                        {player.imageUrl ? (
                                                            <img src={player.imageUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', background: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>👤</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Player Details */}
                                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '25px', borderRadius: '15px', backdropFilter: 'blur(10px)' }}>
                                                    <h2 style={{ fontSize: '2rem', margin: '0 0 20px 0', textAlign: 'center' }}>{player.name}</h2>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Role</div>
                                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{player.role}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Category</div>
                                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{player.category}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Base Price</div>
                                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{(player.basePrice || 0).toLocaleString('en-IN')}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Sold Price</div>
                                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00e676' }}>₹{(player.soldPrice || 0).toLocaleString('en-IN')}</div>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px', justifyContent: 'center' }}>
                                                        {player.age && <span style={{ background: 'rgba(0,0,0,0.05)', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}>Age: <strong>{player.age}</strong></span>}
                                                        {player.country && <span style={{ background: 'rgba(0,0,0,0.05)', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}>Country: <strong>{player.country}</strong></span>}
                                                        {player.battingStyle && <span style={{ background: 'rgba(0,0,0,0.05)', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}>Bat: <strong>{player.battingStyle}</strong></span>}
                                                        {player.bowlingStyle && <span style={{ background: 'rgba(0,0,0,0.05)', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}>Bowl: <strong>{player.bowlingStyle}</strong></span>}
                                                    </div>

                                                    {team && (
                                                        <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginTop: '20px' }}>
                                                            {team.logoUrl && (
                                                                <div style={{ width: '80px', height: '80px', margin: '0 auto 10px', borderRadius: '50%', overflow: 'hidden', background: 'white', padding: '5px' }}>
                                                                    <img src={team.logoUrl} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                </div>
                                                            )}
                                                            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>Sold To</div>
                                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{team.name}</div>
                                                        </div>
                                                    )}

                                                    {player.stats && Object.keys(player.stats).length > 0 && (
                                                        <div style={{ marginTop: '20px' }}>
                                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Stats</h3>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                                                {Object.entries(player.stats).map(([key, value]) => (
                                                                    <div key={key} style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                                                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{key}</div>
                                                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{value}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Footer */}
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                                    padding: '30px 10px 10px',
                                                    textAlign: 'center'
                                                }}>
                                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>PROBID VERIFIED</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Visible Card */}
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,240,250,0.8))',
                                            borderRadius: '20px',
                                            padding: '25px',
                                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                                            border: '1px solid rgba(255, 255, 255, 0.4)',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #667eea', flexShrink: 0 }}>
                                                    {player.imageUrl ? (
                                                        <img src={player.imageUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: '0 0 5px 0' }}>{player.name}</h4>
                                                    <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                        {player.role}
                                                    </span>
                                                </div>
                                            </div>
                                            {team && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', background: '#f5f5f5', padding: '10px', borderRadius: '10px' }}>
                                                    {team.logoUrl && (
                                                        <img src={team.logoUrl} alt={team.name} style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' }} />
                                                    )}
                                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                                        Sold To: <strong style={{ color: '#333', fontSize: '1rem' }}>{team.name}</strong>
                                                    </div>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                <span>Base: ₹{(player.basePrice || 0).toLocaleString('en-IN')}</span>
                                                <span style={{ color: '#00e676', fontWeight: 'bold' }}>Sold: ₹{(player.soldPrice || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadPlayerProfile(player);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    background: 'linear-gradient(90deg, #667eea, #764ba2)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    transition: 'all 0.3s',
                                                    boxShadow: '0 4px 10px rgba(102, 126, 234, 0.3)'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <Download size={18} />
                                                Download Profile
                                            </button>
                                            <div style={{ fontSize: '0.7rem', color: '#cbd5e0', textAlign: 'center', marginTop: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>PROBID VERIFIED</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {soldPlayers.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#999' }}>
                                    No players sold yet
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Unsold Players with Download */}
                {activeTab === "unsold" && (
                    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '25px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                        {/* Search Bar */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '20px',
                            padding: '15px',
                            background: '#f8f9fa',
                            borderRadius: '10px'
                        }}>
                            <Search size={20} color="#667eea" />
                            <input
                                type="text"
                                placeholder="Search unsold players by name, role, or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    background: 'transparent',
                                    padding: '5px'
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        background: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {unsoldPlayers.map(player => (
                                <div key={player._id} style={{ position: 'relative' }}>
                                    {/* Hidden Profile Card for Download */}
                                    <div
                                        id={`player-profile-${player._id}`}
                                        style={{
                                            position: 'absolute',
                                            left: '-9999px',
                                            width: '600px',
                                            background: 'linear-gradient(135deg, #f44336 0%, #c62828 100%)',
                                            padding: '40px',
                                            borderRadius: '20px',
                                            color: 'white'
                                        }}
                                    >
                                        {/* Probid Logo Watermark */}
                                        <img
                                            src="/probid_logo.png"
                                            alt="PROBID"
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '70%',
                                                transform: 'translate(-50%, -50%)',
                                                opacity: 0.1,
                                                width: '350px',
                                                zIndex: 0
                                            }}
                                        />

                                        {/* UNSOLD Badge Image (Visible) */}
                                        <img
                                            src="/probidUNSOLD.png"
                                            alt="UNSOLD"
                                            style={{
                                                position: 'absolute',
                                                top: '20px',
                                                right: '20px',
                                                width: '120px',
                                                height: 'auto',
                                                zIndex: 2,
                                                filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.3))'
                                            }}
                                        />

                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            {/* Header */}
                                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                                <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>PROBID</h1>
                                                <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>Player Profile</div>
                                            </div>

                                            {/* Player Image */}
                                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                                <div style={{ width: '200px', height: '200px', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', border: '5px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                                                    {player.imageUrl ? (
                                                        <img src={player.imageUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', background: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>👤</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Player Details */}
                                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '25px', borderRadius: '15px', backdropFilter: 'blur(10px)' }}>
                                                <h2 style={{ fontSize: '2rem', margin: '0 0 20px 0', textAlign: 'center' }}>{player.name}</h2>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Role</div>
                                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{player.role}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Category</div>
                                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{player.category}</div>
                                                    </div>
                                                    <div style={{ gridColumn: '1 / -1' }}>
                                                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Base Price</div>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{(player.basePrice || 0).toLocaleString('en-IN')}</div>
                                                    </div>
                                                </div>

                                                <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffcdd2' }}>UNSOLD</div>
                                                </div>

                                                {player.stats && Object.keys(player.stats).length > 0 && (
                                                    <div style={{ marginTop: '20px' }}>
                                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Stats</h3>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                                            {Object.entries(player.stats).map(([key, value]) => (
                                                                <div key={key} style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                                                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{key}</div>
                                                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{value}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div style={{ textAlign: 'center', marginTop: '30px', opacity: 0.7, fontSize: '0.9rem' }}>
                                                {auction.name} • {new Date().getFullYear()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visible Card */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,240,250,0.8))',
                                        borderRadius: '20px',
                                        padding: '25px',
                                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                                        border: '1px solid rgba(255, 255, 255, 0.4)',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #f44336', flexShrink: 0 }}>
                                                {player.imageUrl ? (
                                                    <img src={player.imageUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#333' }}>{player.name}</h4>
                                                <span style={{ background: '#ffebee', color: '#c62828', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                    {player.role}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#555' }}>
                                            Base Price: <strong>₹{(player.basePrice || 0).toLocaleString('en-IN')}</strong>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadPlayerProfile(player);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                background: 'linear-gradient(90deg, #f44336, #c62828)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                transition: 'all 0.3s',
                                                boxShadow: '0 4px 10px rgba(244, 67, 54, 0.3)'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <Download size={18} />
                                            Download Profile
                                        </button>
                                        <div style={{ fontSize: '0.7rem', color: '#cbd5e0', textAlign: 'center', marginTop: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>PROBID VERIFIED</div>
                                    </div>
                                </div>
                            ))}
                            {unsoldPlayers.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#999' }}>
                                    No unsold players
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Remaining Players */}
                {activeTab === "remaining" && (
                    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '25px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                        {/* Search Bar */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '20px',
                            padding: '15px',
                            background: '#f8f9fa',
                            borderRadius: '10px'
                        }}>
                            <Search size={20} color="#667eea" />
                            <input
                                type="text"
                                placeholder="Search remaining players by name, role, or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    background: 'transparent',
                                    padding: '5px'
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        background: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                            {remainingPlayers.map(p => (
                                <div style={{ position: 'relative' }}>
                                    {/* Hidden Card for Download */}
                                    <div
                                        id={`remaining-player-card-${p._id}`}
                                        style={{
                                            position: 'absolute',
                                            left: '-9999px',
                                            width: '600px',
                                            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                            padding: '40px',
                                            borderRadius: '20px',
                                            color: '#333'
                                        }}
                                    >
                                        {/* Probid Logo Watermark */}
                                        <img
                                            src="/probid_logo.png"
                                            alt="PROBID"
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                opacity: 0.1,
                                                width: '350px',
                                                zIndex: 0
                                            }}
                                        />

                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            {/* Header */}
                                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                                <h1 style={{ fontSize: '5rem', margin: '0 0 10px 0', color: '#1565c0' }}>{auction.name}</h1>
                                                <div style={{ fontSize: '2rem', opacity: 0.8 }}>Remaining Player</div>
                                            </div>

                                            {/* Player Image */}
                                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                                <div style={{ width: '200px', height: '200px', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', border: '5px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                                                    {p.imageUrl ? (
                                                        <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', background: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', color: 'white' }}>👤</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Player Details */}
                                            <div style={{ background: 'rgba(255,255,255,0.6)', padding: '25px', borderRadius: '15px', backdropFilter: 'blur(10px)' }}>
                                                <h2 style={{ fontSize: '2rem', margin: '0 0 10px 0', textAlign: 'center', color: '#1565c0' }}>{p.name}</h2>

                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                                                    {p.age && <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', opacity: 0.8 }}>Age: <strong>{p.age}</strong></span>}
                                                    {p.country && <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', opacity: 0.8 }}>{p.country}</span>}
                                                    {p.battingStyle && <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', opacity: 0.8 }}>{p.battingStyle}</span>}
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Role</div>
                                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{p.role}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Category</div>
                                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{p.category}</div>
                                                    </div>
                                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '10px' }}>
                                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Base Price</div>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1565c0' }}>₹{(p.basePrice || 0).toLocaleString('en-IN')}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                                padding: '30px 10px 10px',
                                                textAlign: 'center'
                                            }}>
                                                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>PROBID VERIFIED</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visible Card */}
                                    <div
                                        onClick={() => openModal("PLAYER", p)}
                                        style={{
                                            padding: '25px',
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,240,250,0.8))',
                                            borderRadius: '20px',
                                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                                            border: '1px solid rgba(255, 255, 255, 0.4)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.2)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.15)';
                                        }}
                                    >
                                        {/* Watermark */}
                                        <img src="/probid_logo.png" alt="PROBID" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05, width: '200px', zIndex: 0 }} />

                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <div style={{ width: '100%', height: '200px', marginBottom: '20px', borderRadius: '15px', overflow: 'hidden', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ fontSize: '3rem' }}>👤</div>
                                                )}
                                            </div>
                                            <strong style={{ fontSize: '1.3rem', display: 'block', marginBottom: '8px', color: '#1a202c' }}>{p.name}</strong>
                                            <div style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>
                                                {p.role} • {p.category}
                                            </div>
                                            <div style={{ marginBottom: '20px' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Base Price</span>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1565c0' }}>
                                                    ₹{(p.basePrice || 0).toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadRemainingCard(p);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    background: 'linear-gradient(90deg, #1565c0, #0d47a1)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    transition: 'all 0.2s',
                                                    boxShadow: '0 4px 15px rgba(21, 101, 192, 0.3)'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <Download size={16} />
                                                Download
                                            </button>
                                            <div style={{ fontSize: '0.7rem', color: '#cbd5e0', textAlign: 'center', marginTop: '15px', fontWeight: 'bold', letterSpacing: '1px' }}>PROBID VERIFIED</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {remainingPlayers.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#999' }}>
                                    No remaining players
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Sponsors */}
                {activeTab === "sponsors" && (
                    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '25px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>

                            {auction.sponsors && auction.sponsors.length > 0 ? (
                                auction.sponsors.map((sponsor, idx) => (
                                    <div key={idx} style={{ position: 'relative' }}>

                                        {/* Hidden Sponsor Card */}
                                        <div
                                            id={`sponsor-card-${sponsor._id}`}
                                            style={{
                                                position: 'absolute',
                                                left: '-9999px',
                                                top: 0,
                                                width: '600px',
                                                height: '600px',
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                                padding: '50px',
                                                borderRadius: '30px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <img
                                                src="/probid_logo.png"
                                                alt="PROBID"
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    opacity: 0.05,
                                                    width: '400px',
                                                    zIndex: 0
                                                }}
                                            />

                                            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                                                <div style={{
                                                    fontSize: '1.5rem',
                                                    letterSpacing: '5px',
                                                    textTransform: 'uppercase',
                                                    color: '#999',
                                                    marginBottom: '40px'
                                                }}>
                                                    Official Sponsor
                                                </div>

                                                <div style={{
                                                    width: '250px',
                                                    height: '250px',
                                                    margin: '0 auto 40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {sponsor.logoUrl ? (
                                                        <img
                                                            src={sponsor.logoUrl}
                                                            alt={sponsor.name}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'contain'
                                                            }}
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: '8rem' }}>🤝</span>
                                                    )}
                                                </div>

                                                <h1 style={{
                                                    fontSize: '2.5rem',
                                                    margin: '0 0 10px 0',
                                                    color: '#333'
                                                }}>
                                                    {sponsor.name}
                                                </h1>

                                                <p style={{ fontSize: '1.2rem', color: '#666' }}>
                                                    Official Partner of {auction.name}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Visible Sponsor Card */}
                                        <div
                                            onClick={() => openModal("SPONSOR", sponsor)}
                                            style={{
                                                textAlign: 'center',
                                                padding: '30px',
                                                background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                                                backdropFilter: 'blur(10px)',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                boxShadow: '0 8px 32px rgba(31,38,135,0.15)',
                                                border: '1px solid rgba(255,255,255,0.18)'
                                            }}
                                        >
                                            <div>
                                                <div style={{
                                                    width: '120px',
                                                    height: '120px',
                                                    margin: '0 auto 20px',
                                                    borderRadius: '50%',
                                                    background: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden'
                                                }}>
                                                    {sponsor.logoUrl ? (
                                                        <img
                                                            src={sponsor.logoUrl}
                                                            alt={sponsor.name}
                                                            style={{
                                                                width: '90px',
                                                                height: '90px',
                                                                objectFit: 'contain'
                                                            }}
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: '3.5rem' }}>🤝</span>
                                                    )}
                                                </div>

                                                <h4 style={{
                                                    margin: '10px 0',
                                                    fontSize: '1.4rem',
                                                    fontWeight: '800'
                                                }}>
                                                    {sponsor.name}
                                                </h4>

                                                <p style={{
                                                    fontSize: '0.9rem',
                                                    color: '#718096'
                                                }}>
                                                    Official Partner
                                                </p>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadSponsorCard(sponsor);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    marginTop: '20px',
                                                    padding: '12px',
                                                    background: 'linear-gradient(90deg, #667eea, #764ba2)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                <Download size={16} /> Download Card
                                            </button>
                                        </div>

                                    </div>
                                ))
                            ) : (
                                <div style={{
                                    gridColumn: '1 / -1',
                                    textAlign: 'center',
                                    padding: '60px',
                                    color: '#999'
                                }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🤝</div>
                                    <h3>No sponsors yet</h3>
                                    <p>Sponsors will be displayed here</p>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>

            <DetailsModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                data={modalData}
                type={modalType}
            />
        </div>
    );
}

