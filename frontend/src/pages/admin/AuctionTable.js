import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api";
import { Play, ArrowRight, ArrowLeft, MonitorPlay, Gavel, Users, LayoutGrid, Filter, Search, X } from "lucide-react";
import MainLoader from "../../components/MainLoader";

export default function AuctionTable() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [auction, setAuction] = useState(null);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSponsorModal, setShowSponsorModal] = useState(false);
    const [currentSponsorIndex, setCurrentSponsorIndex] = useState(0);
    const [showTopBuys, setShowTopBuys] = useState(false);
    const [currentTopBuyIndex, setCurrentTopBuyIndex] = useState(0);
    const [bonusModal, setBonusModal] = useState(null); // { type: 'ALL' | 'TEAM', team: teamObj }
    const [viewMode, setViewMode] = useState('TEAMS'); // 'TEAMS' | 'PLAYERS'
    const [playerFilter, setPlayerFilter] = useState('REMAINING'); // 'REMAINING' | 'SOLD' | 'UNSOLD' | 'ALL' | 'TOP_BUYS'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const loadData = () => {
        setLoading(true);
        // Mock data for UI testing if backend fails
        Promise.all([
            API.get(`/auctions/${id}`).catch(() => ({
                data: {
                    name: "Mock Auction",
                    status: "LIVE",
                    maxPlayersPerTeam: 25,
                    pointsPerTeam: 100000000,
                    sponsors: [{ name: "Sponsor 1", logoUrl: "" }],
                    enabledStats: [{ key: "runs", label: "Runs" }, { key: "wickets", label: "Wickets" }]
                }
            })),
            API.get(`/teams/auction/${id}`).catch(() => ({
                data: [
                    { _id: "t1", name: "Team Alpha", ownerName: "Owner A", totalPoints: 100000000, spentPoints: 20000000, availablePoints: 80000000, playersBought: 5 }
                ]
            })),
            API.get(`/players/auction/${id}`).catch(() => ({
                data: [
                    { _id: "p1", name: "Player One", role: "Batsman", basePrice: 2000000, status: "UNSOLD", category: "Batsman" },
                    { _id: "p2", name: "Player Two", role: "Bowler", basePrice: 1500000, status: "SOLD", soldPrice: 5000000, teamId: "t1", category: "Bowler" }
                ]
            }))
        ]).then(([aucRes, teamRes, playerRes]) => {
            setAuction(aucRes.data);
            setTeams(teamRes.data);
            setPlayers(playerRes.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'PLAYERS') {
            setViewMode('PLAYERS');
        }
    }, [id]);

    const [slideDirection, setSlideDirection] = useState('right'); // 'right' means sliding IN from right (Next), 'left' means sliding IN from left (Prev)

    useEffect(() => {
        let interval;
        if (showSponsorModal && auction?.sponsors?.length > 0) {
            interval = setInterval(() => {
                setSlideDirection('right');
                setCurrentSponsorIndex(prev => (prev + 1) % auction.sponsors.length);
            }, 5000); // Slower timing as requested
        }
        return () => clearInterval(interval);
    }, [showSponsorModal, auction]);

    useEffect(() => {
        let interval;
        if (showTopBuys) {
            const topPlayers = players.filter(p => p.status === 'SOLD').sort((a, b) => b.soldPrice - a.soldPrice).slice(0, 5);
            if (topPlayers.length > 0) {
                interval = setInterval(() => {
                    setSlideDirection('right');
                    setCurrentTopBuyIndex(prev => (prev + 1) % topPlayers.length);
                }, 5000);
            }
        }
        return () => clearInterval(interval);
    }, [showTopBuys, players]);

    if (loading) return <MainLoader />;
    if (!auction) return <div>Auction not found</div>;

    const SponsorSlide = () => {
        if (!auction.sponsors || auction.sponsors.length === 0) return null;
        const sponsor = auction.sponsors[currentSponsorIndex];

        const animationName = slideDirection === 'right' ? 'slideInRight' : 'slideInLeft';

        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'black', zIndex: 10000,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontFamily: "'Segoe UI', sans-serif"
            }} onClick={() => setShowSponsorModal(false)}>
                {/* Probid Branding */}
                <div style={{ position: 'absolute', top: '20px', left: '25px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 5 }}>
                    <div style={{
                        width: '40px', height: '40px', background: 'white',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(255, 255, 255, 0.1)'
                    }}>
                        <Gavel size={24} color="#1e3c72" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>PROBID</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Auction Platform</p>
                    </div>
                </div>

                {/* Previous Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setSlideDirection('left');
                        setCurrentSponsorIndex(prev => (prev - 1 + auction.sponsors.length) % auction.sponsors.length);
                    }}
                    style={{
                        position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none',
                        color: 'white', borderRadius: '50%', width: '50px', height: '50px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                        transition: 'background 0.2s', zIndex: 2
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    &lt;
                </button>

                {/* Next Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setSlideDirection('right');
                        setCurrentSponsorIndex(prev => (prev + 1) % auction.sponsors.length);
                    }}
                    style={{
                        position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none',
                        color: 'white', borderRadius: '50%', width: '50px', height: '50px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                        transition: 'background 0.2s', zIndex: 2
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    &gt;
                </button>

                {/* Content Container with Animation Key */}
                <div key={currentSponsorIndex} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    animation: `${animationName} 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both`,
                    width: '100%', maxWidth: '800px'
                }}>
                    <div style={{
                        width: 'min(90vw, 350px)', height: 'min(90vw, 350px)', background: 'white', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px',
                        overflow: 'hidden', border: '5px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        {sponsor.logoUrl ?
                            <img src={sponsor.logoUrl} alt={sponsor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                            <span style={{ fontSize: '6rem', color: 'black' }}>🤝</span>
                        }
                    </div>
                    <h1 style={{ fontSize: '4rem', margin: '0 0 10px 0' }}>{sponsor.name}</h1>
                    <p style={{ fontSize: '1.5rem', opacity: 0.8, margin: '0 0 30px 0', letterSpacing: '2px', textTransform: 'uppercase' }}>Proud Sponsor</p>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        {sponsor.mobile && (
                            <div style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px' }}>📞 Phone</span>
                                <span>{sponsor.mobile}</span>
                            </div>
                        )}
                        {sponsor.address && (
                            <div style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '800px', textAlign: 'center' }}>
                                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px' }}>📍 Address</span>
                                <span>{sponsor.address}</span>
                            </div>
                        )}
                        {sponsor.website && (
                            <div style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px' }}>🌐 Website</span>
                                <span>{sponsor.website}</span>
                            </div>
                        )}
                    </div>
                </div>

                <p style={{ position: 'absolute', bottom: '30px', fontSize: '1rem', opacity: 0.5 }}>Click anywhere to close</p>
                <style>{`
                    @keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                    @keyframes slideInLeft { from { transform: translateX(-100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                `}</style>
            </div>
        );
    };

    const TopBuysSlide = () => {
        const topPlayers = players.filter(p => p.status === 'SOLD').sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0)).slice(0, 5);
        if (topPlayers.length === 0) return null;

        const player = topPlayers[currentTopBuyIndex];
        const team = teams.find(t => t._id === (player.teamId._id || player.teamId));
        const animationName = slideDirection === 'right' ? 'slideInRight' : 'slideInLeft';

        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)', zIndex: 10000,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontFamily: "'Segoe UI', sans-serif"
            }} onClick={() => setShowTopBuys(false)}>
                <div style={{ position: 'absolute', top: '20px', left: '25px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 5 }}>
                    <div style={{
                        width: '40px', height: '40px', background: 'white',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(255, 255, 255, 0.1)'
                    }}>
                        <Gavel size={24} color="#1e3c72" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>TOP BUYS</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#ffeb3b', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Most Expensive Players</p>
                    </div>
                </div>

                <div key={currentTopBuyIndex} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    animation: `${animationName} 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both`,
                    width: '100%', maxWidth: '900px'
                }}>
                    <div style={{ position: 'relative', width: '300px', height: '300px', marginBottom: '30px' }}>
                        <div style={{
                            width: '100%', height: '100%', borderRadius: '50%', background: 'white',
                            overflow: 'hidden', border: '5px solid #ffd700', boxShadow: '0 0 50px rgba(255, 215, 0, 0.3)'
                        }}>
                            {player.imageUrl ?
                                <img src={player.imageUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>👤</div>
                            }
                        </div>
                        {team && (
                            <div style={{
                                position: 'absolute', bottom: '0', right: '-20px', width: '100px', height: '100px',
                                borderRadius: '50%', background: 'white', border: '4px solid white', overflow: 'hidden',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.5)', zIndex: 2
                            }}>
                                {team.logoUrl && <img src={team.logoUrl} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                        )}
                    </div>

                    <h1 style={{ fontSize: '4rem', margin: '0 0 10px 0', textShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>{player.name}</h1>

                    <div style={{ display: 'flex', gap: '30px', margin: '20px 0', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px' }}>Role</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{player.role}</div>
                        </div>
                        <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.2)' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px' }}>Base Price</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{(player.basePrice || 0).toLocaleString('en-IN')}</div>
                        </div>
                        <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.2)' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px' }}>Sold Price</div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#00e676', textShadow: '0 0 20px rgba(0, 230, 118, 0.4)' }}>₹{(player.soldPrice || 0).toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                </div>
                <p style={{ position: 'absolute', bottom: '30px', fontSize: '1rem', opacity: 0.5 }}>Click anywhere to close</p>
                <style>{`
                    @keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                    @keyframes slideInLeft { from { transform: translateX(-100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                `}</style>
            </div>
        );
    };



    const handleBonusSubmit = (amount) => {
        if (!bonusModal) return;

        const payload = {
            teamId: bonusModal.type === 'ALL' ? 'ALL' : bonusModal.team._id,
            amount: parseInt(amount),
            auctionId: id
        };

        API.post('/team/bonus', payload)
            .then(res => {
                // alert(res.data.message); // removed alert as requested, maybe show a toast or just close? 
                // Let's rely on UI update.
                loadData();
                setBonusModal(null);
            })
            .catch(err => console.error(err));
    };

    const BonusModal = () => {
        const [amount, setAmount] = useState('');

        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)', zIndex: 10002,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Segoe UI', sans-serif"
            }} onClick={() => setBonusModal(null)}>
                <div style={{
                    background: 'white', width: 'min(90vw, 400px)', borderRadius: '15px', padding: '25px',
                    animation: 'zoomIn 0.2s ease-out', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }} onClick={e => e.stopPropagation()}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#1a237e' }}>
                        {bonusModal.type === 'ALL' ? '💰 Add Bonus to ALL Teams' : `💰 Add Bonus to ${bonusModal.team.name}`}
                    </h3>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Enter the amount of points to add. This will increase the team's total purse.
                    </p>
                    <input
                        type="number"
                        autoFocus
                        placeholder="Enter Amount (e.g. 1000000)"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        style={{ width: '100%', padding: '12px', fontSize: '1.2rem', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setBonusModal(null)} style={{ padding: '10px 20px', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#666' }}>Cancel</button>
                        <button
                            onClick={() => handleBonusSubmit(amount)}
                            disabled={!amount || isNaN(parseInt(amount))}
                            style={{ padding: '10px 20px', background: '#2e7d32', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: 'white', opacity: amount ? 1 : 0.5 }}
                        >
                            Confirm Add
                        </button>
                    </div>
                </div>
                <style>{`@keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
            </div>
        );
    };

    const TeamPlayersModal = () => {
        const teamPlayers = players.filter(p => p.teamId === selectedTeam._id && p.status === 'SOLD');

        // Calculate Bonus (Total Points - Original Points from Auction)
        // Note: auction.pointsPerTeam might need to be parsed if string, but usually number.
        const originalPoints = auction.pointsPerTeam || 0;
        const bonusPoints = (selectedTeam.totalPoints || 0) - originalPoints;

        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)', zIndex: 10001,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Segoe UI', sans-serif"
            }} onClick={() => setSelectedTeam(null)}>
                <div style={{
                    background: 'white', width: 'min(90vw, 600px)', borderRadius: '15px', overflow: 'hidden',
                    maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease-out'
                }} onClick={e => e.stopPropagation()}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f5' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #ddd' }}>
                                {selectedTeam.logoUrl ? <img src={selectedTeam.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛡️'}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, color: '#1a237e' }}>{selectedTeam.name}</h2>
                                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    <span>Squad: <strong>{teamPlayers.length} / {auction.maxPlayersPerTeam}</strong></span>
                                    <span>Purse: <strong>{(selectedTeam.totalPoints || 0).toLocaleString('en-IN')}</strong></span>
                                    {bonusPoints > 0 && (
                                        <span style={{ color: '#2e7d32' }}>Bonus: <strong>+{(bonusPoints || 0).toLocaleString('en-IN')}</strong></span>
                                    )}
                                    <span style={{ color: '#d32f2f' }}>Avail: <strong>{(selectedTeam.availablePoints || 0).toLocaleString('en-IN')}</strong></span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setBonusModal({ type: 'TEAM', team: selectedTeam })}
                                style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                + Bonus
                            </button>
                            <button onClick={() => setSelectedTeam(null)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>&times;</button>
                        </div>
                    </div>

                    <div style={{ padding: '20px', overflowY: 'auto' }}>
                        {teamPlayers.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f9f9f9', color: '#666', fontSize: '0.85rem', textAlign: 'left' }}>
                                        <th style={{ padding: '12px', borderRadius: '5px 0 0 5px' }}>Player</th>
                                        <th style={{ padding: '12px' }}>Role</th>
                                        <th style={{ padding: '12px', textAlign: 'right', borderRadius: '0 5px 5px 0' }}>Sold Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamPlayers.map(player => (
                                        <tr key={player._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#eee', overflow: 'hidden' }}>
                                                    {player.imageUrl ? <img src={player.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                                                </div>
                                                <span style={{ fontWeight: '600', color: '#333' }}>{player.name}</span>
                                            </td>
                                            <td style={{ padding: '12px', color: '#555' }}>
                                                <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '3px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold' }}>{player.role}</span>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#2e7d32' }}>
                                                {player.status === 'SOLD' ? `₹${(player.soldPrice || 0).toLocaleString('en-IN')}` : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                No players bought yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };


    const PlayerDetailsModal = () => {
        if (!selectedPlayer) return null;
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)', zIndex: 10005,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Segoe UI', sans-serif"
            }} onClick={() => setSelectedPlayer(null)}>
                <div style={{
                    background: 'white', width: 'min(90vw, 500px)', borderRadius: '15px', overflow: 'hidden',
                    animation: 'zoomIn 0.2s ease-out', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    position: 'relative'
                }} onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => setSelectedPlayer(null)}
                        style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                    >
                        <X size={20} color="#666" />
                    </button>

                    <div style={{ height: '300px', background: '#1a1a2e', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {/* Blurred Background Layer */}
                        {selectedPlayer.imageUrl && (
                            <img src={selectedPlayer.imageUrl} alt="" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(20px) brightness(0.5)', transform: 'scale(1.1)' }} />
                        )}

                        {/* Main Proper Image */}
                        {selectedPlayer.imageUrl ? (
                            <img src={selectedPlayer.imageUrl} alt="" style={{ height: '90%', width: 'auto', objectFit: 'contain', position: 'relative', zIndex: 1, borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e0e0', color: '#999', fontSize: '4rem', zIndex: 1 }}>👤</div>
                        )}

                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '20px', zIndex: 2 }}>
                            <h2 style={{ margin: 0, color: 'white', fontSize: '1.8rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{selectedPlayer.name}</h2>
                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: 'bold' }}>{selectedPlayer.category}</span>
                        </div>
                    </div>

                    <div style={{ padding: '25px' }}>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                            {getStatusBadge(selectedPlayer.status)}
                            <span style={{ background: '#f5f5f5', padding: '4px 12px', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>
                                {selectedPlayer.role}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', border: '1px solid #ccc', padding: '5px', borderRadius: '5px' }}>₹{(selectedPlayer.basePrice || 0).toLocaleString('en-IN')}</div>
                            </div>
                            {selectedPlayer.status === 'SOLD' && (
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Sold Price</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2e7d32', border: '1px solid #2e7d32', padding: '5px', borderRadius: '5px' }}>₹{(selectedPlayer.soldPrice || 0).toLocaleString('en-IN')}</div>
                                </div>
                            )}
                        </div>

                        {selectedPlayer.teamId && (
                            <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                {/* Team Logo Lookup */}
                                {(() => {
                                    const team = teams.find(t => t._id === (selectedPlayer.teamId._id || selectedPlayer.teamId));
                                    return team ? (
                                        <>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', overflow: 'hidden' }}>
                                                {team.logoUrl && <img src={team.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Sold To</div>
                                                <div style={{ fontWeight: 'bold', color: '#1a237e' }}>{team.name}</div>
                                            </div>
                                        </>
                                    ) : <span style={{ color: '#888' }}>Team Info Unavailable</span>;
                                })()}
                            </div>
                        )}

                        {/* Stats Section */}
                        {(() => {
                            let displayStats = selectedPlayer.stats || {};
                            if (typeof displayStats === 'string') {
                                try { displayStats = JSON.parse(displayStats); } catch (e) { }
                            }
                            const statConfig = auction?.enabledStats || [];
                            const keys = Object.keys(displayStats);

                            if (keys.length > 0) {
                                return (
                                    <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '10px' }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Stats</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                                            {keys.map(k => {
                                                const label = statConfig.find(s => s.key === k)?.label || k;
                                                const value = displayStats[k];
                                                if (!value) return null;
                                                return (
                                                    <div key={k} style={{ background: 'white', padding: '8px', borderRadius: '5px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                                                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333' }}>{value}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={() => {
                                    navigate(`/admin/auction/${id}/console?playerId=${selectedPlayer._id}`);
                                }}
                                style={{
                                    background: '#1a237e', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px',
                                    fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                                    boxShadow: '0 4px 10px rgba(26, 35, 126, 0.3)'
                                }}
                            >
                                <Gavel size={20} /> {selectedPlayer.status === 'SOLD' || selectedPlayer.status === 'UNSOLD' ? 'MANAGE / RE-AUCTION' : 'START BID'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const getFilteredPlayers = () => {
        let filtered = players;

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(lower) || p.category?.toLowerCase().includes(lower));
        }

        switch (playerFilter) {
            case 'SOLD':
                filtered = filtered.filter(p => p.status === 'SOLD');
                break;
            case 'UNSOLD':
                filtered = filtered.filter(p => p.status === 'UNSOLD');
                break;
            case 'ALL':
                // No status filter
                break;
            case 'TOP_BUYS':
                return filtered.filter(p => p.status === 'SOLD').sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0)).slice(0, 10);
            case 'REMAINING':
            default:
                filtered = filtered.filter(p => p.status !== 'SOLD' && p.status !== 'UNSOLD');
                break;
        }
        return filtered;
    };

    const handleExportExcel = async () => {
        try {
            const XLSX = (await import('xlsx'));

            // Helper to format player for Excel
            const formatPlayer = (p, type) => {
                const teamName = type === 'SOLD'
                    ? (teams.find(t => t._id === (p.teamId?._id || p.teamId))?.name || "Unknown")
                    : (p.teamId ? (teams.find(t => t._id === (p.teamId?._id || p.teamId))?.name || "Linked") : "-");

                let stats = {};
                if (p.stats) {
                    try {
                        stats = typeof p.stats === 'string' ? JSON.parse(p.stats) : p.stats;
                    } catch (e) { }
                }

                return {
                    Name: p.name,
                    Category: p.category,
                    Role: p.role,
                    Status: p.status,
                    Team: teamName,
                    "Base Price": p.basePrice || 0,
                    "Sold Price": p.soldPrice || (type === 'SOLD' ? p.soldPrice : '-'),
                    Mobile: p.mobile || "N/A",
                    ...stats // Spread stats into columns
                };
            };

            const soldPlayers = players.filter(p => p.status === 'SOLD').map(p => formatPlayer(p, 'SOLD'));
            const unsoldPlayers = players.filter(p => p.status === 'UNSOLD').map(p => formatPlayer(p, 'UNSOLD'));
            const remainingPlayers = players.filter(p => p.status === 'IN_AUCTION').map(p => formatPlayer(p, 'REMAINING'));
            const allPlayers = players.map(p => formatPlayer(p, 'ALL'));

            const wb = XLSX.utils.book_new();

            // Add Sheets
            if (soldPlayers.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(soldPlayers), "Sold Players");
            if (unsoldPlayers.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(unsoldPlayers), "Unsold Players");
            if (remainingPlayers.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(remainingPlayers), "Remaining Players");
            if (allPlayers.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allPlayers), "All Players");

            // Summary Sheet
            const summary = [
                { Info: "Auction Name", Value: auction.name },
                { Info: "Date", Value: new Date().toLocaleDateString() },
                { Info: "Total Players", Value: allPlayers.length },
                { Info: "Total Sold", Value: soldPlayers.length },
                { Info: "Total Unsold", Value: unsoldPlayers.length },
                { Info: "Remaining", Value: remainingPlayers.length }
            ];
            const wsSummary = XLSX.utils.json_to_sheet(summary);
            XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

            XLSX.writeFile(wb, `${auction.name}_Full_Data.xlsx`);

        } catch (err) {
            console.error("Excel export failed", err);
            alert("Failed to export Excel");
        }
    };

    const getStatusBadge = (status) => {
        const style = { padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold' };
        switch (status) {
            case 'SOLD': return <span style={{ ...style, background: '#e8f5e9', color: '#2e7d32' }}>SOLD</span>;
            case 'UNSOLD': return <span style={{ ...style, background: '#ffebee', color: '#c62828' }}>UNSOLD</span>;
            case 'IN_AUCTION': return <span style={{ ...style, background: '#fff3e0', color: '#ef6c00' }}>IN AUCTION</span>;
            default: return <span style={{ ...style, background: '#e3f2fd', color: '#1565c0' }}>AVAILABLE</span>;
        }
    };

    return (
        <div style={{ padding: '20px', minHeight: '100vh', background: '#e0e0e0' }}>
            {showSponsorModal && <SponsorSlide />}
            {showTopBuys && <TopBuysSlide />}
            {selectedTeam && <TeamPlayersModal />}

            <button
                onClick={() => navigate(`/admin/auction/${id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '15px', fontSize: '1rem', color: '#555', fontWeight: 'bold' }}
            >
                <ArrowLeft size={20} /> Back to Details
            </button>



            {/* Header Card */}
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '60px', height: '60px', background: '#f5f5f5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                            {auction.logoUrl ? <img src={auction.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} /> : '🏆'}
                        </div>
                        <div>
                            <h1 style={{ margin: 0, color: '#1a237e' }}>{auction.name}</h1>
                            <span style={{ background: '#e8eaf6', color: '#1a237e', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                STATUS: {auction.status}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            onClick={() => { setShowTopBuys(true); setCurrentTopBuyIndex(0); }}
                            style={{ padding: '12px 25px', background: '#ffd700', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '1rem' }}
                        >
                            🌟 Top Buys Preview
                        </button>
                        <button
                            onClick={() => { setShowSponsorModal(true); setCurrentSponsorIndex(0); }}
                            style={{ padding: '12px 25px', background: '#ff6f00', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '1rem' }}
                        >
                            <MonitorPlay size={20} /> Sponsor Preview
                        </button>
                        <button
                            onClick={() => setBonusModal({ type: 'ALL' })}
                            style={{ padding: '12px 25px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '1rem' }}
                        >
                            💰 Bonus All
                        </button>
                        <button
                            onClick={handleExportExcel}
                            style={{ padding: '12px 25px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '1rem' }}
                        >
                            📥 Export Excel
                        </button>

                    </div>
                </div>

                {/* Sponsor Marquee / List */}
                {auction.sponsors && auction.sponsors.length > 0 && (
                    <div style={{ borderTop: '1px solid #eee', marginTop: '20px', paddingTop: '15px', display: 'flex', alignItems: 'center', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: '#666', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>SPONSORED BY:</span>
                        {auction.sponsors.map(sponsor => (
                            <div key={sponsor._id} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 20px', background: 'white', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                {sponsor.logoUrl && <img src={sponsor.logoUrl} alt="" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />}
                                <span style={{ fontWeight: '600', color: '#333', fontSize: '1.1rem' }}>{sponsor.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {bonusModal && <BonusModal />}
            {selectedPlayer && <PlayerDetailsModal />}

            {/* View Toggle */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setViewMode('TEAMS')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: viewMode === 'TEAMS' ? '#1a237e' : 'white',
                        color: viewMode === 'TEAMS' ? 'white' : '#555',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <LayoutGrid size={18} /> Teams
                </button>
                <button
                    onClick={() => setViewMode('PLAYERS')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: viewMode === 'PLAYERS' ? '#1a237e' : 'white',
                        color: viewMode === 'PLAYERS' ? 'white' : '#555',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Users size={18} /> Players
                </button>

                {viewMode === 'PLAYERS' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginLeft: 'auto', width: '100%', maxWidth: '600px' }}>
                        {/* Search Bar at top of filters mobile, or right side desktop */}
                        <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '5px 10px', borderRadius: '8px', flex: 1 }}>
                            <Search size={16} color="#888" />
                            <input
                                type="text"
                                placeholder="Search players..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ border: 'none', outline: 'none', padding: '5px 10px', width: '100%', fontSize: '0.9rem' }}
                            />
                            {searchTerm && <button onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={14} color="#888" /></button>}
                        </div>

                        <div style={{ display: 'flex', gap: '5px', background: 'white', padding: '5px', borderRadius: '8px', overflowX: 'auto' }}>
                            {['REMAINING', 'SOLD', 'UNSOLD', 'ALL', 'TOP_BUYS'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setPlayerFilter(filter)}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: playerFilter === filter ? '#eee' : 'transparent',
                                        color: playerFilter === filter ? '#333' : '#888',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {filter === 'TOP_BUYS' ? 'TOP BUYS 🌟' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {viewMode === 'TEAMS' ? (
                /* Teams Table */
                <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                        <h2 style={{ margin: 0, color: '#333' }}>Team Standings</h2>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead style={{ background: '#f5f5f5', color: '#555', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                                <tr>
                                    <th style={{ padding: '15px', textAlign: 'left', width: '60px' }}>#</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Team</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Owner</th>
                                    <th style={{ padding: '15px', textAlign: 'right' }}>Total Purse</th>
                                    <th style={{ padding: '15px', textAlign: 'right', color: '#d32f2f' }}>Spent</th>
                                    <th style={{ padding: '15px', textAlign: 'right', color: '#2e7d32' }}>Remaining</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Squad Size</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((team, index) => (
                                    <tr
                                        key={team._id}
                                        style={{ borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onClick={() => setSelectedTeam(team)}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fcfcfc'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <td style={{ padding: '15px', color: '#888', fontWeight: 'bold' }}>{index + 1}</td>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {team.logoUrl ? <img src={team.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛡️'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1a237e' }}>{team.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px', color: '#555' }}>
                                            {team.ownerName}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                                            {(team.totalPoints || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#d32f2f' }}>
                                            {(team.spentPoints || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#2e7d32', fontSize: '1.1rem' }}>
                                            {(team.availablePoints || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <span style={{ padding: '4px 12px', background: '#e3f2fd', color: '#1565c0', borderRadius: '15px', fontWeight: 'bold' }}>
                                                {team.playersBought} / {auction.maxPlayersPerTeam}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {teams.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                                            No teams registered yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Players Table */
                <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                        <h2 style={{ margin: 0, color: '#333' }}>Player List ({playerFilter.toLowerCase()})</h2>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead style={{ background: '#f5f5f5', color: '#555', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                                <tr>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Player</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Role</th>
                                    <th style={{ padding: '15px', textAlign: 'right' }}>Base Price</th>
                                    <th style={{ padding: '15px', textAlign: 'right' }}>Sold Price</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Team</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getFilteredPlayers().map(player => (
                                    <tr
                                        key={player._id}
                                        onClick={() => setSelectedPlayer(player)}
                                        style={{ borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fcfcfc'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                    >
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {player.imageUrl ? <img src={player.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', color: '#333' }}>{player.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>{player.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px', color: '#555' }}>
                                            <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '4px 12px', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                                {player.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                            ₹{(player.basePrice || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: player.status === 'SOLD' ? '#2e7d32' : '#aaa' }}>
                                            {player.status === 'SOLD' ? `₹${(player.soldPrice || 0).toLocaleString('en-IN')}` : '-'}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            {getStatusBadge(player.status)}
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            {player.teamId ? (
                                                <div style={{ fontWeight: 'bold', color: '#1a237e' }}>
                                                    {teams.find(t => t._id === (player.teamId._id || player.teamId))?.name || 'Unknown'}
                                                </div>
                                            ) : <span style={{ color: '#aaa' }}>-</span>}
                                        </td>
                                    </tr>
                                ))}
                                {getFilteredPlayers().length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                                            No players found in this category.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}



