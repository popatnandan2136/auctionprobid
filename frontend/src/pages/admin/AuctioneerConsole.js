import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Updated to use useNavigate
import API from "../../api";
import { Play, Pause, CheckCircle, XCircle, Hammer, Users as UsersIcon, ArrowLeft } from "lucide-react"; // Renamed Users to UsersIcon to avoid conflict
import MainLoader from "../../components/MainLoader";
import logo from "../../logo.svg";

export default function AuctioneerConsole() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [auction, setAuction] = useState(null);
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bids, setBids] = useState([]);
    const [customBid, setCustomBid] = useState('');
    const [notification, setNotification] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm, type: 'danger'|'info' }
    const [sessionStarted, setSessionStarted] = useState(false);

    // Reset session state when player changes (Force 0 start for IN_AUCTION stales)
    useEffect(() => {
        setSessionStarted(false);
    }, [currentPlayer?._id]);

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const POLLING_INTERVAL = 2000;

    // Polling Ref
    const intervalRef = useRef(null);
    const sessionStartedRef = useRef(false); // 🔥 Ref to track session state inside intervals

    useEffect(() => {
        sessionStartedRef.current = sessionStarted;
    }, [sessionStarted]);

    useEffect(() => {
        fetchInitialData();
        startPolling();
        return () => stopPolling();
    }, [id]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [auctionRes, playersRes, teamsRes] = await Promise.all([
                API.get(`/auction/${id}`),
                API.get(`/player/auction/${id}`),
                API.get(`/team/auction/${id}`)
            ]);
            setAuction(auctionRes.data);
            setPlayers(playersRes.data);
            setTeams(teamsRes.data);

            // Check URL query param for initial player selection
            const searchParams = new URLSearchParams(window.location.search);
            const initialPlayerId = searchParams.get('playerId');

            if (initialPlayerId) {
                // If ID passes in URL, force select it
                await selectPlayer(initialPlayerId);
            } else if (auctionRes.data.currentPlayerId) {
                // Otherwise check if auction has active player
                fetchCurrentPlayer(auctionRes.data.currentPlayerId);
            }
            setLoading(false);
        } catch (err) {
            console.error("Init Error", err);
        }
    };

    const fetchCurrentPlayer = async (playerId) => { // Separate to be callable
        try {
            /** 
             * For simplicity, using getPlayerById which should return bids if populated or we rely on polling
             * Actually, polling endpoint `getAuctionState` returns bids. 
             * But for Admin, we might want full control.
             * Let's rely on polling for bids updates.
             */
            const res = await API.get(`/player/${playerId}`);
            setCurrentPlayer(res.data);
        } catch (err) { console.error(err); }
    };

    const startPolling = () => {
        intervalRef.current = setInterval(async () => {
            try {
                const res = await API.get(`/bid/${id}/state`);
                // Update Bids/Current Player live state
                if (res.data.currentPlayer) {
                    setCurrentPlayer(prev => {
                        // If it's the same player
                        if (prev && prev._id === res.data.currentPlayer._id) {

                            // 🔥 ABSOLUTE PROTECTION: If locally marked SOLD/UNSOLD, ignore ALL server updates (prices, status, etc) until Saved.
                            if (prev.status === 'SOLD' || prev.status === 'UNSOLD') {
                                return prev;
                            }

                            // 🔥 SESSION PROTECTION: If session started (reset/bidding), ignore status changes from server
                            if (sessionStartedRef.current && res.data.currentPlayer.status !== prev.status) {
                                return prev;
                            }

                            // Protection against Stale Poll: If local has MORE bids than server, ignore server bid data
                            const localBids = prev.bids || [];
                            const serverBids = res.data.currentPlayer.bids || [];

                            if (localBids.length > serverBids.length) {
                                // Keep local bid state, but update other fields if needed (like image/stats)
                                return {
                                    ...res.data.currentPlayer, // Base on new data
                                    bids: localBids,           // Keep local bids
                                    currentTopBid: prev.currentTopBid, // Keep local top bid
                                    status: prev.status,       // Keep local status (IN_AUCTION/SOLD)
                                    teamId: prev.teamId,       // Keep local winner
                                    stats: res.data.currentPlayer.stats || prev.stats,
                                    imageUrl: res.data.currentPlayer.imageUrl || prev.imageUrl
                                };
                            }

                            return {
                                ...prev, // Keep existing fields
                                ...res.data.currentPlayer, // Overwrite with new live data
                                stats: res.data.currentPlayer.stats && Object.keys(res.data.currentPlayer.stats).length > 0
                                    ? res.data.currentPlayer.stats
                                    : prev.stats, // Prefer new stats if present, otherwise keep old
                                imageUrl: res.data.currentPlayer.imageUrl || prev.imageUrl // Preserve image if missing
                            };
                        }
                        return res.data.currentPlayer; // New player, take fully
                    });
                    // setBids(res.data.currentPlayer.bids || []); // We rely on currentPlayer.bids now
                }
            } catch (err) { console.error("Poll Error", err); }
        }, 2000);
    };

    const stopPolling = () => clearInterval(intervalRef.current);

    // Actions
    const selectPlayer = async (playerId) => {
        try {
            await API.put(`/auction/${id}/select-player`, { playerId });
            // Also need to set auction to LIVE if not? Or just player logic.
            // Backend `selectCurrentPlayer` sets `currentPlayerId`.
            fetchCurrentPlayer(playerId);
        } catch (err) { alert("Failed to select player"); }
    };

    const [selectedTeam, setSelectedTeam] = useState(null);

    const startAuction = async () => {
        try {
            await API.put(`/auction/${id}/start`);
            fetchInitialData();
        } catch (err) { alert("Failed to start"); }
    };

    const sellPlayer = async () => {
        if (!currentPlayer) return;

        // Validation: Cannot sell if already marked UNSOLD without reset
        if (currentPlayer.status === 'UNSOLD') {
            showNotification("⚠️ Player marked UNSOLD! Click RESET first.", 'error');
            return;
        }

        const currentBids = currentPlayer.bids || [];

        // Validation: If no bids and not in auction, must have selected team (Base Price Sale)
        if (currentBids.length === 0 && currentPlayer.status !== 'IN_AUCTION' && !sessionStarted) {
            if (!selectedTeam) {
                showNotification("No bids placed and no team selected!", 'error');
                return;
            }
        }

        // Helper to parse potential string numbers (e.g. "50,000" -> 50000)
        const parsePrice = (val) => {
            if (val === null || val === undefined) return 0;
            if (typeof val === 'number') return val;
            // Remove everything except numbers and decimal points
            const cleanStr = String(val).replace(/[^0-9.]/g, '');
            return Number(cleanStr) || 0;
        };

        // Determine Winning Bid Info
        let finalPrice = 0;
        let finalTeam = null;

        if (currentBids.length > 0) {
            // Standard Case: Taking last bid
            const winningBid = currentBids[currentBids.length - 1];
            finalPrice = parsePrice(winningBid.amount);
            finalTeam = winningBid.teamId;
        } else {
            // Fallback Case: Trust Last Visible Bid or Base Price
            // Prevents 0-price sales if 'soldPrice' state was corrupted
            const activeBid = parsePrice(currentPlayer.currentTopBid);
            const basePrice = parsePrice(currentPlayer.basePrice);
            const staleSoldPrice = (currentPlayer.status === 'SOLD') ? parsePrice(currentPlayer.soldPrice) : 0;

            if (activeBid > 0) {
                finalPrice = activeBid;
                finalTeam = selectedTeam || currentPlayer.teamId;
            } else if (sessionStarted || currentPlayer.status === 'IN_AUCTION') {
                // Active Session/Reset but no bids -> Base Price Sale guarantees
                finalPrice = basePrice;
                finalTeam = selectedTeam || currentPlayer.teamId;
            } else if (staleSoldPrice > 0) {
                // Restoration of valid sold state
                finalPrice = staleSoldPrice;
                finalTeam = currentPlayer.teamId;
            } else {
                // Absolute fallback
                finalPrice = basePrice;
                finalTeam = selectedTeam || currentPlayer.teamId;
            }
        }

        // Safety Fallback: Never sell for 0 or negative
        if (finalPrice <= 0) {
            finalPrice = parsePrice(currentPlayer.basePrice);
        }

        // Determine effective team object (handle if only ID is present)
        const effectiveTeam = finalTeam?._id ? finalTeam : (selectedTeam || finalTeam);

        // Optimistic Update
        setCurrentPlayer(prev => ({
            ...prev,
            status: 'SOLD',
            soldPrice: finalPrice,
            currentTopBid: finalPrice, // 🔥 Sync visual state immediately
            teamId: effectiveTeam
        }));

        showNotification(`Marked SOLD to ${effectiveTeam?.name || 'Unknown'} for ₹${(finalPrice || 0).toLocaleString()}. Click SAVE to confirm!`, 'info');

        // API Call Removed for Local-First Workflow
    };

    const placeBid = async (amount) => {
        if (!currentPlayer) return;

        const currentBidValue = (currentPlayer.status === 'SOLD') ? (Number(currentPlayer.soldPrice) || 0) : ((currentPlayer.status === 'IN_AUCTION' && sessionStarted) ? (Number(currentPlayer.currentTopBid) || 0) : 0);
        const isDecrease = amount < currentBidValue;

        // Validation 1: Must Select Team (Only for INCREASES)
        if (!isDecrease && amount > 0 && !selectedTeam) {
            showNotification("⚠️ PLEASE SELECT A TEAM FIRST!", 'error');
            return;
        }

        setSessionStarted(true);
        sessionStartedRef.current = true; // 🔥 Sync Ref immediately

        // Logic for Team Assignment
        // If Decrease & No Team Selected -> Use Last Bidder
        let bidderTeam = selectedTeam;
        if (isDecrease && !bidderTeam) {
            const lastBid = currentPlayer.bids && currentPlayer.bids.length > 0 ? currentPlayer.bids[currentPlayer.bids.length - 1] : null;
            if (lastBid) {
                bidderTeam = lastBid.teamId;
            } else {
                showNotification("⚠️ No previous bidder to deduct from!", 'error');
                return;
            }
        }

        // Validation 2: Budget Check (Only for INCREASES, or check final if needed)
        // If decreasing, we assume they had budget before (or we ignore).
        if (!isDecrease && bidderTeam && amount > 0) {
            const availableBudget = (bidderTeam.totalPoints || 0) - (bidderTeam.spentPoints || 0);
            if (availableBudget < amount) {
                showNotification(`💰 INSUFFICIENT FUNDS! Avail: ₹${availableBudget.toLocaleString()} | Bid: ₹${amount.toLocaleString()}`, 'error');
                return;
            }
        }

        // Mock a bid object
        const newBidMock = {
            amount: amount,
            teamId: bidderTeam || { name: 'Bid', logoUrl: '' }
        };

        // Immediate Local Update
        setCurrentPlayer(prev => ({
            ...prev,
            currentTopBid: amount,
            status: 'IN_AUCTION',
            bids: [...(prev.bids || []), newBidMock]
        }));

        // Reset selection to force explicit choice for next bid
        setSelectedTeam(null);

        // LOCAL ONLY - Commit on SAVE
        // API Call Removed
    };

    const markUnsold = async () => {
        if (!currentPlayer) return;

        // Validation: Cannot mark unsold if already SOLD without reset
        if (currentPlayer.status === 'SOLD') {
            showNotification("⚠️ Player marked SOLD! Click RESET first.", 'error');
            return;
        }

        // Optimization: Local Update
        setCurrentPlayer(prev => ({
            ...prev,
            status: 'UNSOLD',
            soldPrice: 0,
            teamId: null
        }));
        showNotification("Marked UNSOLD. Click SAVE to confirm!", 'info');
    };

    const handleSave = () => {
        if (!currentPlayer) return;

        // Validation
        if (currentPlayer.status !== 'SOLD' && currentPlayer.status !== 'UNSOLD') {
            showNotification("Please Sell or Mark Unsold first!", 'error');
            return;
        }

        const executeSave = async () => {
            if (currentPlayer.status === 'SOLD') {
                try {
                    const payloadTeamId = currentPlayer.teamId?._id || currentPlayer.teamId;
                    if (!payloadTeamId) throw new Error("Missing Team ID");

                    await API.post(`/player/${currentPlayer._id}/sell`, {
                        teamId: payloadTeamId,
                        soldPrice: Number(currentPlayer.soldPrice)
                    });
                    showNotification("Saved Successfully! Redirecting...", 'success');
                    setSessionStarted(false);
                    setTimeout(() => navigate(`/admin/auction/${id}/table?view=PLAYERS`), 1000);
                } catch (err) {
                    console.error("Save Error Detail:", err.response?.data || err.message);
                    showNotification(`Save Failed: ${err.response?.data?.message || err.message}`, 'error');
                }
            } else if (currentPlayer.status === 'UNSOLD') {
                try {
                    await API.post(`/player/${currentPlayer._id}/unsold`, { playerId: currentPlayer._id });
                    showNotification("Saved Successfully! Redirecting...", 'success');
                    setSessionStarted(false);
                    setTimeout(() => navigate(`/admin/auction/${id}/table?view=PLAYERS`), 1000);
                } catch (err) {
                    console.error("Save Error Detail:", err.response?.data || err.message);
                    showNotification(`Save Failed: ${err.response?.data?.message || err.message}`, 'error');
                }
            }
        };

        setConfirmDialog({
            message: `Confirm: Mark ${currentPlayer.name} as ${currentPlayer.status}?`,
            type: 'info',
            onConfirm: executeSave
        });
    };

    const handleClear = () => {
        if (!currentPlayer) return;
        setSessionStarted(true);
        sessionStartedRef.current = true; // 🔥 IMMEDIATE REF UPDATE to block race-condition polling
        // Instant Local Reset to clear watermarks immediately
        setCurrentPlayer(prev => ({
            ...prev,
            status: 'IN_AUCTION', // Resetting to neutral state visually
            soldPrice: 0,
            currentTopBid: 0, // 🔥 Clear top bid
            bids: [], // 🔥 Clear bids locally
            teamId: null
        }));

        // Removed fetchCurrentPlayer to prevent stale server data from overwriting local reset immediately
        showNotification("Session Cleared", 'info');
    };


    if (loading) return <div>Loading Console...</div>;

    const unsoldPlayers = players.filter(p => p.status === 'NOT_IN_AUCTION' || p.status === 'IN_AUCTION' || p.status === 'UNSOLD');

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999,
            display: 'flex', flexDirection: 'column',
            background: 'linear-gradient(135deg, #0f0c29, #302b63, #1c1c2aff)',
            color: 'white', fontFamily: "'Segoe UI', sans-serif", overflow: 'hidden'
        }}>
            {/* Custom Toast Notification */}
            {notification && (
                <div style={{
                    position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)',
                    background: notification.type === 'error' ? 'rgba(255, 23, 68, 0.95)' : 'rgba(0, 230, 118, 0.95)',
                    color: 'white', padding: '15px 25px', borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.6)', zIndex: 20000,
                    display: 'flex', alignItems: 'center', gap: '15px', backdropFilter: 'blur(10px)',
                    animation: 'slideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: '1px solid rgba(255,255,255,0.2)', minWidth: '300px', maxWidth: '90vw', justifyContent: 'center'
                }}>
                    {notification.type === 'error' ? <XCircle size={28} style={{ flexShrink: 0 }} /> : <CheckCircle size={28} style={{ flexShrink: 0 }} />}
                    <span style={{ fontWeight: '700', fontSize: '1.1rem', letterSpacing: '0.5px', whiteSpace: 'pre-wrap', textAlign: 'left', lineHeight: '1.4' }}>{notification.message}</span>
                </div>
            )}

            {/* Custom Modal Dialog */}
            {confirmDialog && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30000
                }}>
                    <div style={{
                        background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px', padding: '30px', maxWidth: '400px', width: '90%',
                        textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
                            {confirmDialog.type === 'danger' ? '⚠️' : '❓'}
                        </div>
                        <h3 style={{ margin: '0 0 10px', color: 'white', fontSize: '1.5rem' }}>Confirmation Required</h3>
                        <p style={{ color: '#bbb', margin: '0 0 30px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '1.1rem' }}>{confirmDialog.message}</p>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button onClick={() => setConfirmDialog(null)} style={{
                                background: 'transparent', border: '1px solid #555', color: '#ccc',
                                padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
                                transition: 'all 0.2s'
                            }}>
                                Cancel
                            </button>
                            <button onClick={() => {
                                confirmDialog.onConfirm();
                                setConfirmDialog(null);
                            }} style={{
                                background: confirmDialog.type === 'danger' ? '#ff1744' : '#00e5ff',
                                color: confirmDialog.type === 'danger' ? 'white' : '#000',
                                border: 'none', padding: '12px 30px', borderRadius: '8px',
                                cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.3)', transition: 'all 0.2s'
                            }}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Header / HUD Top */}
            <div style={{
                background: 'rgba(0,0,0,0.5)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => {
                        if (sessionStarted) {
                            setConfirmDialog({
                                message: "⚠️ Unsaved changes! Are you sure you want to leave?\n(Drafts will be lost)",
                                type: 'danger',
                                onConfirm: () => navigate(`/admin/auction/${id}/table?view=PLAYERS`)
                            });
                        } else {
                            navigate(`/admin/auction/${id}/table?view=PLAYERS`);
                        }
                    }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src="/probid_logo.png" alt="Probid" style={{ height: '40px', marginRight: '15px' }} />
                        <h2 style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', margin: 0, letterSpacing: '2px', textTransform: 'uppercase', color: '#00e5ff', textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }}>
                            {auction?.name} <span style={{ color: '#aaa', fontSize: '0.8em' }}>// LIVE CONSOLE</span>
                        </h2>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#00e5ff', border: '1px solid rgba(0, 229, 255, 0.3)', padding: '5px 15px', borderRadius: '20px', background: 'rgba(0, 229, 255, 0.1)' }}>
                        <div style={{ width: '8px', height: '8px', background: '#00e5ff', borderRadius: '50%', boxShadow: '0 0 10px #00e5ff' }}></div>
                        SYSTEM ONLINE
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT SPLIT - Scale to Fit */}
            <div style={{ flex: 1, display: 'flex', flexFlow: 'row wrap', overflow: 'hidden', position: 'relative', alignContent: 'stretch' }}>
                {/* LEFT PANEL: Player Profile */}
                <div style={{ flex: '1 1 0', minWidth: '300px', padding: '1vh 2vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {currentPlayer ? (
                        <>
                            {/* Player Image - Fluid Height */}
                            <div style={{ position: 'relative', marginBottom: '1vh', height: '40vh', maxHeight: '400px', aspectRatio: '1/1', display: 'flex', justifyContent: 'center' }}>
                                <div style={{
                                    height: '100%', width: 'auto', aspectRatio: '1/1', borderRadius: '20px',
                                    background: 'linear-gradient(to bottom, #00e5ff, #2979ff)', padding: '3px',
                                    boxShadow: '0 0 30px rgba(0, 229, 255, 0.3)'
                                }}>
                                    {/* Watermarks */}
                                    {currentPlayer.status === 'SOLD' && (
                                        <img src="/probidSOLD.png" alt="SOLD"
                                            style={{
                                                position: 'absolute', top: '50%', left: '95%', transform: 'translate(-50%, -50%)',
                                                width: '100%', height: 'auto', zIndex: 10, pointerEvents: 'none',
                                                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))'
                                            }}
                                        />
                                    )}
                                    {currentPlayer.status === 'UNSOLD' && (
                                        <img src="/probidUNSOLD.png" alt="UNSOLD"
                                            style={{
                                                position: 'absolute', top: '50%', left: '95%', transform: 'translate(-50%, -50%)',
                                                width: '100%', height: 'auto', zIndex: 10, pointerEvents: 'none',
                                                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))'
                                            }}
                                        />
                                    )}

                                    <div style={{ width: '100%', height: '100%', background: '#1a1a2e', borderRadius: '17px', overflow: 'hidden', position: 'relative' }}>
                                        {currentPlayer.imageUrl ? (
                                            <img src={currentPlayer.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#555' }}>
                                                <UsersIcon size={80} color="rgba(255,255,255,0.2)" />
                                            </div>
                                        )}
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '30px 10px 10px', textAlign: 'center' }}>
                                            <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 3vw, 2.5rem)', color: 'white', textTransform: 'uppercase', letterSpacing: '1px', textShadow: '2px 2px 0px rgba(0,0,0,0.5)', lineHeight: 1 }}>{currentPlayer.name}</h1>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#00e5ff', color: '#000', padding: '5px 15px', fontWeight: 'bold', fontSize: '0.9rem', borderRadius: '5px', boxShadow: '3px 3px 10px rgba(0,0,0,0.3)', zIndex: 2 }}>
                                    {currentPlayer.role}
                                </div>
                            </div>

                            {/* Player Stats - Compact */}
                            <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '5px' }}>

                                {(() => {
                                    let displayStats = currentPlayer.stats || {};
                                    if (typeof displayStats === 'string') { try { displayStats = JSON.parse(displayStats); } catch (e) { } }
                                    const statKeys = Object.keys(displayStats);
                                    const statLabels = (auction?.enabledStats || []).reduce((acc, curr) => ({ ...acc, [curr.key]: curr.label }), {});

                                    if (statKeys.length > 0) {
                                        return (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '5px' }}>
                                                {statKeys.map(key => (
                                                    <div key={key} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '6px', padding: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <div style={{ color: '#00e5ff', fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 'bold' }}>{statLabels[key] || key}</div>
                                                        <div style={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>{displayStats[key]}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                    return <div style={{ color: '#666', fontSize: '0.8rem', textAlign: 'center' }}>No stats</div>;
                                })()}

                                {/* Info Row: Category & Base Price */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '5px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ color: '#aaa', fontSize: '0.6rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '2px', textTransform: 'uppercase' }}>CATEGORY</div>
                                        <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }}>{currentPlayer.category}</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ color: '#aaa', fontSize: '0.6rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '2px', textTransform: 'uppercase' }}>BASE PRICE</div>
                                        <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }}>₹{(currentPlayer.basePrice || 0).toLocaleString('en-IN')}</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                            <UsersIcon size={60} />
                            <h3 style={{ marginTop: '10px', fontSize: '1rem' }}>WAITING...</h3>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL: Bidding Info - Scalable */}
                <div style={{ flex: '1 1 0', minWidth: '300px', borderLeft: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', padding: '1vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    {currentPlayer ? (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '2vh', width: '100%' }}>
                                <h3 style={{ textTransform: 'uppercase', letterSpacing: '3px', color: '#00e5ff', marginBottom: '5px', fontSize: '0.8rem' }}>Current Bid</h3>
                                <div style={{
                                    background: 'rgba(0,0,0,0.6)', borderRadius: '20px', padding: '20px 40px',
                                    border: '1px solid rgba(255, 215, 0, 0.3)',
                                    boxShadow: '0 0 40px rgba(255, 215, 0, 0.15), inset 0 0 30px rgba(0,0,0,0.8)',
                                    backdropFilter: 'blur(10px)', minWidth: '300px'
                                }}>
                                    <div style={{
                                        fontSize: 'clamp(3rem, 8vw, 6rem)',
                                        fontWeight: '800',
                                        fontFamily: "'Segoe UI', sans-serif",
                                        background: 'linear-gradient(to bottom, #ffd700, #ffa000)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))',
                                        letterSpacing: '-2px'
                                    }}>
                                        ₹{((currentPlayer.status === 'SOLD')
                                            ? Number(currentPlayer.soldPrice || 0)
                                            : (sessionStarted ? Number(currentPlayer.currentTopBid || 0) : (Number(currentPlayer.currentTopBid || 0) > 0 ? Number(currentPlayer.currentTopBid) : 0))
                                        ).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', width: '100%' }}>
                                {currentPlayer.bids && currentPlayer.bids.length > 0 ? (
                                    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                                        <div style={{
                                            width: 'clamp(100px, 12vw, 160px)', height: 'clamp(100px, 12vw, 160px)', margin: '0 auto 10px',
                                            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
                                            borderRadius: '50%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '2px solid rgba(255,255,255,0.05)'
                                        }}>
                                            {currentPlayer.bids[currentPlayer.bids.length - 1].teamId && currentPlayer.bids[currentPlayer.bids.length - 1].teamId.logoUrl ? (
                                                <img src={currentPlayer.bids[currentPlayer.bids.length - 1].teamId.logoUrl} alt="Team" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <span style={{ fontSize: '2rem' }}>🛡️</span>
                                            )}
                                        </div>
                                        <h2 style={{ fontSize: 'clamp(1rem, 2vw, 1.8rem)', color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '300' }}>
                                            {currentPlayer.bids[currentPlayer.bids.length - 1].teamId?.name || "Unknown Team"}
                                        </h2>
                                        <div style={{ color: '#00e5ff', fontSize: '0.7rem', textTransform: 'uppercase' }}>Current Leader</div>
                                    </div>
                                ) : (
                                    <div style={{ opacity: 0.3, textAlign: 'center' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '5px' }}>⏳</div>
                                        <h3 style={{ fontSize: '0.9rem', margin: 0 }}>WAITING...</h3>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>

            {/* BOTTOM CONTROL BAR - Compact & Scalable */}
            <div style={{
                minHeight: '15vh', height: 'auto', background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', padding: '1vh 2vw', justifyContent: 'space-between',
                borderTop: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', gap: '10px', flexWrap: 'wrap'
            }}>
                {/* Left Controls: Status */}
                {/* Left Controls: Transactional */}
                {currentPlayer && (
                    <div style={{ display: 'flex', gap: '10px', flex: '1 1 auto', minWidth: '280px', flexWrap: 'wrap' }}>
                        {/* CLEAR BUTTON */}
                        <button onClick={handleClear} disabled={!sessionStarted && currentPlayer.status !== 'SOLD' && currentPlayer.status !== 'UNSOLD'} style={{
                            background: 'rgba(255,255,255,0.1)', color: '#bbb', border: '1px solid #555',
                            padding: '10px', borderRadius: '4px', fontWeight: 'bold',
                            cursor: (sessionStarted || currentPlayer.status === 'SOLD' || currentPlayer.status === 'UNSOLD') ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', gap: '5px',
                            opacity: (sessionStarted || currentPlayer.status === 'SOLD' || currentPlayer.status === 'UNSOLD') ? 1 : 0.3
                        }}>
                            RESET
                        </button>

                        <button onClick={sellPlayer}
                            disabled={((currentPlayer.status === 'SOLD' || (currentPlayer.status === 'IN_AUCTION' && sessionStarted)) ? Number(currentPlayer.currentTopBid) : (Number(currentPlayer.currentTopBid) > 0 ? Number(currentPlayer.currentTopBid) : 0)) <= 0}
                            style={{
                                background: 'linear-gradient(45deg, #1b5e20, #43a047)', color: 'white', border: 'none', padding: '10px',
                                borderRadius: '4px', fontSize: 'clamp(0.8rem, 2vw, 1rem)', fontWeight: 'bold',
                                cursor: (((currentPlayer.status === 'SOLD' || (currentPlayer.status === 'IN_AUCTION' && sessionStarted)) ? Number(currentPlayer.currentTopBid) : (Number(currentPlayer.currentTopBid) > 0 ? Number(currentPlayer.currentTopBid) : 0)) <= 0) ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', letterSpacing: '1px',
                                boxShadow: '0 4px 15px rgba(67, 160, 71, 0.4)', textTransform: 'uppercase', flex: '1',
                                opacity: (((currentPlayer.status === 'SOLD' || (currentPlayer.status === 'IN_AUCTION' && sessionStarted)) ? Number(currentPlayer.currentTopBid) : (Number(currentPlayer.currentTopBid) > 0 ? Number(currentPlayer.currentTopBid) : 0)) <= 0) ? 0.5 : 1
                            }}>
                            <Hammer size={16} /> SOLD
                        </button>

                        <button onClick={markUnsold}
                            disabled={((currentPlayer.status === 'SOLD' || (currentPlayer.status === 'IN_AUCTION' && sessionStarted)) ? Number(currentPlayer.currentTopBid) : 0) > 0}
                            style={{
                                background: 'rgba(255,255,255,0.05)', color: '#ef5350', border: '1px solid #ef5350', padding: '10px',
                                borderRadius: '4px', fontSize: 'clamp(0.8rem, 2vw, 1rem)', fontWeight: 'bold',
                                cursor: (((currentPlayer.status === 'SOLD' || (currentPlayer.status === 'IN_AUCTION' && sessionStarted)) ? Number(currentPlayer.currentTopBid) : 0) > 0) ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', letterSpacing: '1px', textTransform: 'uppercase', flex: '1',
                                opacity: (((currentPlayer.status === 'SOLD' || (currentPlayer.status === 'IN_AUCTION' && sessionStarted)) ? Number(currentPlayer.currentTopBid) : 0) > 0) ? 0.3 : 1
                            }}>
                            <XCircle size={16} /> UNSOLD
                        </button>

                        {/* SAVE BUTTON */}
                        <button onClick={handleSave} style={{
                            background: 'linear-gradient(45deg, #ff6d00, #ff9100)', color: 'white', border: '2px solid #fff',
                            padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', letterSpacing: '1px',
                            boxShadow: '0 0 20px rgba(255, 145, 0, 0.6)', textTransform: 'uppercase', flex: '1.5',
                            animate: 'pulse'
                        }}>
                            <CheckCircle size={18} /> SAVE
                        </button>
                    </div>
                )}

                {/* Right Controls: Dynamic Bidding */}
                {currentPlayer && (
                    <div style={{ flex: '2 1 auto', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end', overflowX: 'auto', paddingBottom: '2px', flexWrap: 'wrap' }}>

                        {/* Team Select Strip - FLUID & CONTENT-SIZED */}
                        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', maxWidth: '65vw', paddingBottom: '2px', scrollbarWidth: 'none', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', flex: '0 1 auto' }}>
                            {(teams || []).map(team => (
                                <div key={team._id} title={team.name}
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '50%', background: 'white', padding: '2px', cursor: 'pointer',
                                        opacity: selectedTeam?._id === team._id ? 1 : 0.6,
                                        transform: selectedTeam?._id === team._id ? 'scale(1.15)' : 'scale(1)',
                                        border: selectedTeam?._id === team._id ? '3px solid #00e5ff' : '2px solid transparent',
                                        transition: 'all 0.2s', flexShrink: 0,
                                        boxShadow: selectedTeam?._id === team._id ? '0 0 10px rgba(0, 229, 255, 0.5)' : 'none'
                                    }}
                                    onClick={() => setSelectedTeam(team)}>
                                    {team.logoUrl ? <img src={team.logoUrl} alt={team.teamName} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} /> : <span style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#333' }}>T</span>}
                                </div>
                            ))}
                        </div>

                        {/* Increment Buttons Group - COMPACT */}
                        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', padding: '2px', alignItems: 'center' }}>
                            {(auction?.incrementSteps?.length > 0 ? auction.incrementSteps : [50000, 100000, 200000, 500000]).map(inc => {
                                const label = inc.toLocaleString('en-IN');
                                return (
                                    <div key={inc} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                        <button
                                            onClick={() => {
                                                const current = (currentPlayer.status === 'SOLD') ? (Number(currentPlayer.soldPrice) || 0) : ((currentPlayer.status === 'IN_AUCTION' && sessionStarted) ? (Number(currentPlayer.currentTopBid) || 0) : 0);
                                                placeBid(current + inc);
                                            }}
                                            style={{
                                                background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.3)',
                                                color: '#00e5ff', borderRadius: '4px', cursor: 'pointer', padding: '5px 10px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'auto',
                                                fontWeight: 'bold', fontSize: '0.8rem'
                                            }}
                                        >
                                            +{label}
                                        </button>

                                        <button
                                            onClick={() => {
                                                const current = (currentPlayer.status === 'SOLD') ? (Number(currentPlayer.soldPrice) || 0) : ((currentPlayer.status === 'IN_AUCTION' && sessionStarted) ? (Number(currentPlayer.currentTopBid) || 0) : 0);
                                                const newAmount = current - inc;
                                                if (newAmount >= 0) placeBid(newAmount);
                                            }}
                                            style={{
                                                background: 'rgba(255, 82, 82, 0.1)', border: '1px solid rgba(255, 82, 82, 0.3)',
                                                color: '#ff5252', borderRadius: '4px', cursor: 'pointer', padding: '5px 10px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'auto',
                                                fontWeight: 'bold', fontSize: '0.8rem'
                                            }}
                                        >
                                            -{label}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Custom Bid - COMPACT */}
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <button
                                    onClick={() => {
                                        const current = (currentPlayer.status === 'SOLD') ? (Number(currentPlayer.soldPrice) || 0) : ((currentPlayer.status === 'IN_AUCTION' && sessionStarted) ? (Number(currentPlayer.currentTopBid) || 0) : 0);
                                        const amt = parseInt(customBid) || 0;
                                        if (amt > 0) placeBid(current + amt);
                                    }}
                                    style={{
                                        background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.3)',
                                        color: '#00e5ff', borderRadius: '4px', cursor: 'pointer', padding: '2px', width: '100%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', height: '25px'
                                    }}
                                >
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>+</div>
                                </button>

                                <input
                                    type="number"
                                    value={customBid}
                                    onChange={(e) => setCustomBid(e.target.value)}
                                    placeholder="Cust"
                                    style={{
                                        width: '60px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white',
                                        padding: '2px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem'
                                    }}
                                />

                                <button
                                    onClick={() => {
                                        const current = (currentPlayer.status === 'SOLD' || (currentPlayer.status === 'IN_AUCTION' && sessionStarted)) ? (Number(currentPlayer.currentTopBid) || 0) : 0;
                                        const amt = parseInt(customBid) || 0;
                                        const newBid = current - amt;
                                        if (amt > 0 && newBid >= 0) placeBid(newBid);
                                    }}
                                    style={{
                                        background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.3)',
                                        color: '#ff5252', borderRadius: '4px', cursor: 'pointer', padding: '2px', width: '100%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', height: '25px'
                                    }}
                                >
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>-</div>
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div >
    );
}
