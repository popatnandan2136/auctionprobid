import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api";
import { Users, UserPlus, DollarSign, Award, ArrowLeft, Plus, XCircle, Play, Edit, CheckCircle, MonitorPlay, Gavel } from "lucide-react";
import PlayerForm from "./PlayerForm";
import MainLoader from "../../components/MainLoader";
import ActionModal from "../../components/ActionModal";
import DetailsModal from "../../components/DetailsModal";
import ImageCropper from "../../components/ImageCropper";
import TeamExportCard from "../../components/TeamExportCard";
import SponsorExportCard from "../../components/SponsorExportCard";

export default function AuctionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [auction, setAuction] = useState(null);
    const [activeTab, setActiveTab] = useState("TEAMS"); // TEAMS, SPONSORS, PLAYERS
    const [loading, setLoading] = useState(true);

    // Forms State
    const [showTeamForm, setShowTeamForm] = useState(false);
    const [showPlayerForm, setShowPlayerForm] = useState(false);
    const [showSponsorForm, setShowSponsorForm] = useState(false); // New state for Sponsor Form
    const [teamForm, setTeamForm] = useState({ name: "", logoUrl: "", ownerName: "", ownerMobile: "", ownerEmail: "" });
    const [editingTeam, setEditingTeam] = useState(null);
    const [editingSponsor, setEditingSponsor] = useState(null);
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [showBonusModal, setShowBonusModal] = useState(false);
    const [viewItem, setViewItem] = useState(null); // New state for Viewing Details
    const [bonusForm, setBonusForm] = useState({ teamId: "ALL", amount: "" });

    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);

    // Modal State for Action Feedback
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

    const [sponsorForm, setSponsorForm] = useState({ name: "", logoUrl: "", mobile: "", address: "", website: "" });
    const [teamFile, setTeamFile] = useState(null);
    const [sponsorFile, setSponsorFile] = useState(null);

    // Cropper State
    const [teamCropSrc, setTeamCropSrc] = useState(null);
    const [sponsorCropSrc, setSponsorCropSrc] = useState(null);

    const formRef = useRef(null);

    const scrollToForm = () => {
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // ... (handleViewItem and other effects remain same)

    // Handlers for File Selection
    const handleTeamFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds 5MB limit.");
                e.target.value = null;
                return;
            }
            const reader = new FileReader();
            reader.onload = () => setTeamCropSrc(reader.result);
            reader.readAsDataURL(file);
            e.target.value = null;
        }
    };

    const handleSponsorFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds 5MB limit.");
                e.target.value = null;
                return;
            }
            const reader = new FileReader();
            reader.onload = () => setSponsorCropSrc(reader.result);
            reader.readAsDataURL(file);
            e.target.value = null;
        }
    };

    const onTeamCropComplete = (croppedBlob) => {
        const croppedFile = new File([croppedBlob], "team_logo_cropped.jpg", { type: "image/jpeg" });
        setTeamFile(croppedFile);
        setTeamCropSrc(null);
    };

    const onSponsorCropComplete = (croppedBlob) => {
        const croppedFile = new File([croppedBlob], "sponsor_logo_cropped.jpg", { type: "image/jpeg" });
        setSponsorFile(croppedFile);
        setSponsorCropSrc(null);
    };

    // ... (rest of the component until return)



    const handleViewItem = async (type, data) => {
        if (type === 'PLAYER') {
            try {
                // Fetch full player details specifically to get stats
                const res = await API.get(`/player/${data._id}`);
                const fullPlayerData = res.data;

                // Also resolve Team Name locally if not in backend response (though backend might populate it, our local teams list is reliable)
                const teamName = teams.find(t => t._id === fullPlayerData.teamId)?.name || teams.find(t => t._id === data.teamId)?.name;

                setViewItem({ type: 'PLAYER', data: { ...fullPlayerData, teamName } });
            } catch (err) {
                console.error("Failed to fetch full player stats", err);
                // Fallback to existing data
                const teamName = teams.find(t => t._id === data.teamId)?.name;
                setViewItem({ type: 'PLAYER', data: { ...data, teamName } });
            }
        } else {
            setViewItem({ type, data });
        }
    };

    const loadData = () => {
        setLoading(true);
        Promise.all([
            fetchAuctionDetails(),
            fetchTeams(),
            fetchPlayers()
        ]).then(() => setLoading(false))
            .catch(err => {
                console.error(err);
                // Note: MainLoader handles the stuck loading state, we just need to ensure we don't infinitely load if it crashes immediately.
                // For now, we keep loading=true so MainLoader's timeout can trigger if it hangs, 
                // or if it errors efficiently, we might want to show error.
            });
    };

    useEffect(() => {
        loadData();
    }, [id]);

    // Preview States
    const [showSponsorPreview, setShowSponsorPreview] = useState(false);
    const [currentSponsorIndex, setCurrentSponsorIndex] = useState(0);
    const [showTeamPreview, setShowTeamPreview] = useState(false);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState('right');

    const toggleSponsorPreview = () => {
        if (!auction.sponsors || auction.sponsors.length === 0) return alert("No sponsors to preview");
        setShowSponsorPreview(true);
        setCurrentSponsorIndex(0);
    };

    const toggleTeamPreview = () => {
        if (!teams || teams.length === 0) return alert("No teams to preview");
        setShowTeamPreview(true);
        setCurrentTeamIndex(0);
    };

    // Auto-advance Slides
    useEffect(() => {
        let interval;
        if (showSponsorPreview && auction?.sponsors?.length > 0) {
            interval = setInterval(() => {
                setSlideDirection('right');
                setCurrentSponsorIndex(prev => (prev + 1) % auction.sponsors.length);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [showSponsorPreview, auction]);

    useEffect(() => {
        let interval;
        if (showTeamPreview && teams.length > 0) {
            interval = setInterval(() => {
                setSlideDirection('right');
                setCurrentTeamIndex(prev => (prev + 1) % teams.length);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [showTeamPreview, teams]);

    // Slideshow Components
    const SponsorSlide = () => {
        const sponsor = auction.sponsors[currentSponsorIndex];
        const animationName = slideDirection === 'right' ? 'slideInRight' : 'slideInLeft';
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'black', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }} onClick={() => setShowSponsorPreview(false)}>
                <div style={{ position: 'absolute', top: '20px', left: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Gavel size={24} color="#1e3c72" /></div>
                    <div><h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>PROBID</h2><p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>OFFICIAL SPONSOR</p></div>
                </div>
                {/* Nav Buttons */}
                <button onClick={(e) => { e.stopPropagation(); setSlideDirection('left'); setCurrentSponsorIndex(prev => (prev - 1 + auction.sponsors.length) % auction.sponsors.length); }} style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '50px', height: '50px', borderRadius: '50%', fontSize: '2rem', cursor: 'pointer' }}>&lt;</button>
                <button onClick={(e) => { e.stopPropagation(); setSlideDirection('right'); setCurrentSponsorIndex(prev => (prev + 1) % auction.sponsors.length); }} style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '50px', height: '50px', borderRadius: '50%', fontSize: '2rem', cursor: 'pointer' }}>&gt;</button>

                <div key={currentSponsorIndex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: `${animationName} 0.5s ease-out` }}>
                    <div style={{ width: '350px', height: '350px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', border: '5px solid white' }}>
                        {sponsor.logoUrl ? <img src={sponsor.logoUrl} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} /> : <span style={{ fontSize: '5rem' }}>🤝</span>}
                    </div>
                    <h1 style={{ fontSize: '4rem', margin: '0 0 10px 0' }}>{sponsor.name}</h1>
                    <p style={{ fontSize: '1.5rem', opacity: 0.8, letterSpacing: '2px' }}>PROUD PARTNER</p>
                </div>
                <style>{`@keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideInLeft { from { transform: translateX(-100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
            </div>
        );
    };

    const TeamSlide = () => {
        const team = teams[currentTeamIndex];
        const animationName = slideDirection === 'right' ? 'slideInRight' : 'slideInLeft';
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }} onClick={() => setShowTeamPreview(false)}>
                <div style={{ position: 'absolute', top: '20px', left: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Gavel size={24} color="#1e3c72" /></div>
                    <div><h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>PROBID</h2><p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>TEAM SHOWCASE</p></div>
                </div>
                {/* Nav Buttons */}
                <button onClick={(e) => { e.stopPropagation(); setSlideDirection('left'); setCurrentTeamIndex(prev => (prev - 1 + teams.length) % teams.length); }} style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '50px', height: '50px', borderRadius: '50%', fontSize: '2rem', cursor: 'pointer' }}>&lt;</button>
                <button onClick={(e) => { e.stopPropagation(); setSlideDirection('right'); setCurrentTeamIndex(prev => (prev + 1) % teams.length); }} style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '50px', height: '50px', borderRadius: '50%', fontSize: '2rem', cursor: 'pointer' }}>&gt;</button>

                <div key={currentTeamIndex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: `${animationName} 0.5s ease-out` }}>
                    <div style={{ width: '350px', height: '350px', background: 'white', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}>
                        {team.logoUrl ? <img src={team.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '40px' }} /> : <span style={{ fontSize: '5rem' }}>🛡️</span>}
                    </div>
                    <h1 style={{ fontSize: '4rem', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{team.name}</h1>
                    <div style={{ fontSize: '1.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ opacity: 0.7 }}>OWNER:</span>
                        <span style={{ fontWeight: 'bold', color: '#4ade80' }}>{team.ownerName}</span>
                    </div>
                </div>
            </div>
        );
    };

    const fetchAuctionDetails = async () => API.get(`/auction/${id}`).then(res => setAuction(res.data));
    const fetchTeams = async () => API.get(`/team/auction/${id}`).then(res => setTeams(res.data));
    const fetchPlayers = async () => API.get(`/player/auction/${id}`).then(res => setPlayers(res.data));

    // Export Logic
    const [exportingTeam, setExportingTeam] = useState(null);
    const [exportingSponsor, setExportingSponsor] = useState(null);
    const exportRef = useRef(null);
    const sponsorExportRef = useRef(null);

    const handleDownloadTeamCard = async (team) => {
        const teamPlayers = players.filter(p => p.teamId === team._id || (p.teamId?._id === team._id));
        setExportingTeam({ team, players: teamPlayers });

        // Wait for render
        setTimeout(async () => {
            if (exportRef.current) {
                try {
                    const html2canvas = (await import('html2canvas')).default;
                    const canvas = await html2canvas(exportRef.current, {
                        backgroundColor: "#0f172a",
                        useCORS: true,
                        scale: 2 // High res
                    });
                    const link = document.createElement('a');
                    link.download = `${team.name}_Squad.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                } catch (err) {
                    console.error("Export failed", err);
                    alert("Failed to download image");
                }
                setExportingTeam(null);
            }
        }, 1000); // Give it a sec to load images
    };

    const handleDownloadSponsorCard = async (sponsor) => {
        setExportingSponsor(sponsor);

        setTimeout(async () => {
            if (sponsorExportRef.current) {
                try {
                    const html2canvas = (await import('html2canvas')).default;
                    const canvas = await html2canvas(sponsorExportRef.current, {
                        backgroundColor: "#0f172a",
                        useCORS: true,
                        scale: 2
                    });
                    const link = document.createElement('a');
                    link.download = `${sponsor.name}_Sponsor.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                } catch (err) {
                    console.error("Sponsor Export failed", err);
                    alert("Failed to download sponsor card");
                }
                setExportingSponsor(null);
            }
        }, 1000);
    };

    const handleExportExcel = async () => {
        try {
            const XLSX = (await import('xlsx'));

            // Helper to format player for Excel
            const formatPlayer = (p, type) => ({
                Name: p.name,
                Category: p.category,
                Role: p.role,
                Status: p.status,
                "Base Price": p.basePrice || 0,
                "Sold Price": p.soldPrice || (type === 'SOLD' ? p.soldPrice : '-'),
                Team: type === 'SOLD' ? (teams.find(t => t._id === p.teamId)?.name || "Unknown") : (p.teamId ? (teams.find(t => t._id === p.teamId)?.name || "Linked") : "-"),
                Mobile: p.mobile || "N/A"
            });

            const soldPlayers = players.filter(p => p.status === 'SOLD').map(p => formatPlayer(p, 'SOLD'));
            const unsoldPlayers = players.filter(p => p.status === 'UNSOLD').map(p => formatPlayer(p, 'UNSOLD'));
            const remainingPlayers = players.filter(p => p.status === 'IN_AUCTION').map(p => formatPlayer(p, 'REMAINING'));
            const allPlayers = players.map(p => formatPlayer(p, 'ALL')); // NEW All Players Sheet

            const wb = XLSX.utils.book_new();

            // Add Sheets
            if (soldPlayers.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(soldPlayers), "Sold Players");
            if (unsoldPlayers.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(unsoldPlayers), "Unsold Players");
            if (remainingPlayers.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(remainingPlayers), "Remaining Players");
            if (allPlayers.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allPlayers), "All Players");

            // Disclaimer / Summary Sheet
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

            XLSX.writeFile(wb, `${auction.name}_Data.xlsx`);

        } catch (err) {
            console.error("Excel export failed", err);
            alert("Failed to export Excel");
        }
    };


    if (!auction && loading) return <MainLoader loading={true} onRetry={loadData} />;
    if (!auction) return <MainLoader loading={true} onRetry={loadData} />; // Fallback if data missing



    const handleAddSponsor = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append("name", sponsorForm.name);

            if (sponsorFile) {
                data.append("logo", sponsorFile);
            } else if (sponsorForm.logoUrl) {
                data.append("logoUrl", sponsorForm.logoUrl);
            }

            if (sponsorForm.mobile) data.append("mobile", sponsorForm.mobile);
            if (sponsorForm.address) data.append("address", sponsorForm.address);
            if (sponsorForm.website) data.append("website", sponsorForm.website);

            if (editingSponsor) {
                await API.put(`/sponsor/${id}/${editingSponsor._id}`, data);
                setModalConfig({ isOpen: true, type: 'success', title: 'Success', message: 'Sponsor information updated successfully!', confirmText: 'Okay' });
            } else {
                await API.post(`/sponsor/${id}/add`, data);
                setModalConfig({ isOpen: true, type: 'success', title: 'Success', message: 'New sponsor added successfully!', confirmText: 'Awesome' });
            }

            fetchAuctionDetails();
            setEditingSponsor(null);
            setSponsorForm({ name: "", logoUrl: "", mobile: "", address: "", website: "" });
            setSponsorFile(null);
            setShowSponsorForm(false);
        } catch (err) {
            setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'Failed to save sponsor. Please try again.', confirmText: 'Close' });
        }
    };

    const handleAddTeam = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append("name", teamForm.name);
            data.append("ownerName", teamForm.ownerName);
            data.append("ownerMobile", teamForm.ownerMobile);
            data.append("ownerEmail", teamForm.ownerEmail);
            data.append("auctionId", id);

            if (teamFile) {
                data.append("logo", teamFile);
            } else if (teamForm.logoUrl) {
                data.append("logoUrl", teamForm.logoUrl);
            }

            if (editingTeam) {
                await API.put(`/team/${editingTeam._id}`, data);
                setModalConfig({ isOpen: true, type: 'success', title: 'Team Updated', message: 'Team details updated successfully!', confirmText: 'Okay' });
            } else {
                await API.post("/team", data);
                setModalConfig({ isOpen: true, type: 'success', title: 'Team Added', message: 'New team added to the auction!', confirmText: 'Great' });
            }

            setShowTeamForm(false);
            setEditingTeam(null);
            setTeamForm({ name: "", logoUrl: "", ownerName: "", ownerMobile: "", ownerEmail: "" });
            setTeamFile(null);
            fetchTeams();
        } catch (err) {
            setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: "Failed to save team: " + (err.response?.data?.message || err.message), confirmText: 'Close' });
        }
    };

    const handleAddBonus = async (e) => {
        e.preventDefault();
        try {
            await API.post("/team/bonus", { ...bonusForm, auctionId: id });
            setModalConfig({ isOpen: true, type: 'success', title: 'Bonus Added', message: 'Bonus points distributed successfully!', confirmText: 'Excellent' });
            setShowBonusModal(false);
            setBonusForm({ teamId: "ALL", amount: "" });
            fetchTeams();
        } catch (err) {
            setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: "Failed to add bonus: " + (err.response?.data?.message || err.message), confirmText: 'Close' });
        }
    };

    const openEditTeam = (team) => {
        setEditingTeam(team);
        setTeamForm({
            name: team.name,
            logoUrl: team.logoUrl || "",
            ownerName: team.ownerName,
            ownerMobile: team.ownerMobile,
            ownerEmail: team.ownerEmail
        });
        setShowTeamForm(true);
    };

    if (loading) return <div>Loading...</div>;
    if (!auction) return <div>Auction not found</div>;

    return (
        <div style={{ padding: '20px', background: '#f4f6f8', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>
            <MainLoader loading={loading} onRetry={loadData} />
            {showSponsorPreview && <SponsorSlide />}
            {showTeamPreview && <TeamSlide />}

            {/* Hidden Export Container */}
            <div style={{ position: "absolute", top: "-10000px", left: "-10000px" }}>
                {exportingTeam && (
                    <TeamExportCard
                        team={exportingTeam.team}
                        players={exportingTeam.players}
                        auctionName={auction.name}
                        refProp={exportRef}
                    />
                )}
                {exportingSponsor && (
                    <SponsorExportCard
                        sponsor={exportingSponsor}
                        auctionName={auction.name}
                        refProp={sponsorExportRef}
                    />
                )}
            </div>

            {/* Croppers */}
            {teamCropSrc && (
                <ImageCropper
                    image={teamCropSrc}
                    onCropComplete={onTeamCropComplete}
                    onCancel={() => setTeamCropSrc(null)}
                    aspect={1}
                />
            )}
            {sponsorCropSrc && (
                <ImageCropper
                    image={sponsorCropSrc}
                    onCropComplete={onSponsorCropComplete}
                    onCancel={() => setSponsorCropSrc(null)}
                    aspect={1}
                />
            )}

            <ActionModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            {/* Header */}
            <button onClick={() => navigate("/admin/auctions")} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontSize: '1rem', color: '#666' }}>
                <ArrowLeft size={20} /> Back to Auctions
            </button>

            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '300px' }}>
                    <div style={{ width: '80px', height: '80px', background: '#f5f7fa', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', overflow: 'hidden', border: '1px solid #eee' }}>
                        {auction.logoUrl ? <img src={auction.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : '🏆'}
                    </div>
                    <div>
                        <h1 style={{ margin: 0, color: '#1e3c72' }}>{auction.name}</h1>
                        <div style={{ margin: '5px 0', color: '#666', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span>Date: {new Date(auction.auctionDate || Date.now()).toLocaleDateString()}</span>

                            {/* Status Controls */}
                            {auction.status === 'COMPLETED' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{
                                        background: '#4caf50', color: 'white', padding: '5px 12px', borderRadius: '15px',
                                        fontSize: '0.85rem', fontWeight: 'bold'
                                    }}>
                                        COMPLETED
                                    </span>
                                    <button
                                        onClick={async () => {
                                            if (!window.confirm("Re-open this auction? Status will be set to UPCOMING.")) return;
                                            try {
                                                await API.put(`/auction/${id}`, { status: 'UPCOMING' });
                                                setAuction(prev => ({ ...prev, status: 'UPCOMING' }));
                                            } catch (e) {
                                                alert("Failed to re-open auction");
                                            }
                                        }}
                                        style={{ fontSize: '0.8rem', color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        Re-open
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    {/* Toggle Switch (Upcoming <-> Live) */}
                                    <label
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                            fontSize: '1rem', fontWeight: 'bold',
                                            color: auction.status === 'LIVE' ? '#d32f2f' : '#333'
                                        }}
                                        title="Click to Toggle LIVE status"
                                    >
                                        <div style={{ position: 'relative', width: '40px', height: '22px', background: auction.status === 'LIVE' ? '#ffcdd2' : '#e0e0e0', borderRadius: '20px', transition: 'background 0.3s' }}>
                                            <div style={{
                                                position: 'absolute', top: '3px', left: auction.status === 'LIVE' ? '21px' : '3px',
                                                width: '16px', height: '16px', background: auction.status === 'LIVE' ? '#d32f2f' : '#757575',
                                                borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                            }} />
                                        </div>
                                        {auction.status}
                                        <input
                                            type="checkbox"
                                            checked={auction.status === 'LIVE'}
                                            onChange={async () => {
                                                const newStatus = auction.status === 'LIVE' ? 'UPCOMING' : 'LIVE';
                                                if (!window.confirm(`Change status to ${newStatus}?`)) return;

                                                try {
                                                    setAuction(prev => ({ ...prev, status: newStatus }));
                                                    await API.put(`/auction/${id}`, { status: newStatus });
                                                } catch (e) {
                                                    console.error(e);
                                                    alert("Failed to update status");
                                                    fetchAuctionDetails(); // Revert
                                                }
                                            }}
                                            style={{ display: 'none' }}
                                        />
                                    </label>

                                    {/* End Auction Button */}
                                    <button
                                        onClick={async () => {
                                            if (!window.confirm("Are you sure you want to END this auction? It will be marked as COMPLETED.")) return;
                                            try {
                                                await API.put(`/auction/${id}`, { status: 'COMPLETED' });
                                                setAuction(prev => ({ ...prev, status: 'COMPLETED' }));
                                            } catch (e) {
                                                alert("Failed to end auction");
                                            }
                                        }}
                                        title="Finish Auction"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            padding: '5px 10px', background: '#333', color: 'white',
                                            borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.85rem'
                                        }}
                                    >
                                        <CheckCircle size={14} /> End
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                    <button
                        onClick={toggleTeamPreview}
                        style={{ background: '#0288d1', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <MonitorPlay size={20} /> Team Preview
                    </button>
                    <button
                        onClick={toggleSponsorPreview}
                        style={{ background: '#ff6f00', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <MonitorPlay size={20} /> Partner Preview
                    </button>
                    <button
                        onClick={() => navigate(`/admin/auction/${id}/table`)}
                        style={{ background: '#d81b60', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <Play size={20} /> Go to Auction Table
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                {['TEAMS', 'SPONSORS', 'PLAYERS'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 30px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                            background: activeTab === tab ? '#1e3c72' : '#e0e0e0',
                            color: activeTab === tab ? 'white' : '#333'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div ref={formRef} style={{ background: 'white', padding: '20px', borderRadius: '10px', minHeight: '400px' }}>

                {/* TEAMS TAB */}
                {activeTab === 'TEAMS' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Participating Teams ({teams.length})</h3>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setShowBonusModal(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fbc02d', color: 'black', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    <DollarSign size={18} /> Bonus Points
                                </button>
                                <button
                                    onClick={() => { setEditingTeam(null); setTeamForm({ name: "", logoUrl: "", ownerName: "", ownerMobile: "", ownerEmail: "" }); setShowTeamForm(true); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#2e7d32', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                >
                                    <Plus size={18} /> Add Team
                                </button>
                            </div>
                        </div>

                        {/* Bonus Modal */}
                        {showBonusModal && (
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', width: '400px' }}>
                                    <h3>Add Bonus Points</h3>
                                    <form onSubmit={handleAddBonus} style={{ display: 'grid', gap: '15px' }}>
                                        <div>
                                            <label style={{ display: "block", marginBottom: "5px" }}>Select Team</label>
                                            <select
                                                value={bonusForm.teamId}
                                                onChange={e => setBonusForm({ ...bonusForm, teamId: e.target.value })}
                                                style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                                            >
                                                <option value="ALL">ALL TEAMS</option>
                                                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: "block", marginBottom: "5px" }}>Bonus Amount</label>
                                            <input
                                                type="number"
                                                value={bonusForm.amount}
                                                onChange={e => setBonusForm({ ...bonusForm, amount: e.target.value })}
                                                required
                                                style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                            <button type="button" onClick={() => setShowBonusModal(false)} style={{ padding: '8px 20px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                                            <button type="submit" style={{ padding: '8px 20px', background: '#1e3c72', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Add Bonus</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {showTeamForm && (
                            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #eee' }}>
                                <h4>{editingTeam ? "Edit Team Details" : "New Team Details"}</h4>
                                <form onSubmit={handleAddTeam} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <input type="text" placeholder="Team Name" value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', gridColumn: 'span 2' }}>
                                        {/* Team Logo Preview */}
                                        {(teamFile || teamForm.logoUrl) && (
                                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #ccc', alignSelf: 'center', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <img
                                                    src={teamFile ? URL.createObjectURL(teamFile) : teamForm.logoUrl}
                                                    alt="Team Preview"
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <label style={{ cursor: 'pointer', background: 'white', border: '1px solid #ccc', padding: '8px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                                                <Plus size={16} /> {teamFile ? teamFile.name.substring(0, 10) + "... (Cropped)" : "Upload Logo"}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleTeamFileSelect}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>OR</span>
                                            <input type="text" placeholder="Logo URL" value={teamForm.logoUrl} onChange={e => setTeamForm({ ...teamForm, logoUrl: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: 1 }} />
                                        </div>
                                    </div>

                                    <input type="text" placeholder="Owner Name" value={teamForm.ownerName} onChange={e => setTeamForm({ ...teamForm, ownerName: e.target.value })} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                    <input type="text" placeholder="Owner Mobile" value={teamForm.ownerMobile} onChange={e => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setTeamForm({ ...teamForm, ownerMobile: val }); }} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                    <input type="email" placeholder="Owner Email" value={teamForm.ownerEmail} onChange={e => setTeamForm({ ...teamForm, ownerEmail: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />

                                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <button type="button" onClick={() => setShowTeamForm(false)} style={{ padding: '8px 20px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                                        <button type="submit" style={{ padding: '8px 20px', background: '#1e3c72', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{editingTeam ? "Update Team" : "Save Team"}</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {teams.map(team => (
                                <div
                                    key={team._id}
                                    onClick={() => handleViewItem('TEAM', team)}
                                    style={{ border: '1px solid #eee', borderRadius: '10px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }} onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownloadTeamCard(team); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                                            title="Download Team Card"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        </button>
                                        <button
                                            onClick={() => { openEditTeam(team); scrollToForm(); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1976d2' }}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                setModalConfig({
                                                    isOpen: true,
                                                    type: 'confirm',
                                                    title: 'Delete Team?',
                                                    message: `Are you sure you want to delete "${team.name}"? This action cannot be undone.`,
                                                    confirmText: 'Yes, Delete',
                                                    cancelText: 'No, Keep',
                                                    onConfirm: async () => {
                                                        try {
                                                            await API.delete(`/team/${team._id}`);
                                                            setModalConfig({ isOpen: true, type: 'success', title: 'Deleted', message: 'Team has been deleted successfully.', confirmText: 'Okay' });
                                                            fetchTeams();
                                                        } catch (err) {
                                                            setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'Failed to delete team.', confirmText: 'Close' });
                                                        }
                                                    }
                                                });
                                            }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f' }}
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </div>

                                    <div style={{ width: '60px', height: '60px', background: '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', overflow: 'hidden' }}>
                                        {team.logoUrl ? <img src={team.logoUrl} alt="T" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '🛡️'}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0' }}>{team.name}</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Owner: {team.ownerName}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Points: {team.totalPoints}</p>
                                    </div>
                                </div>
                            ))}
                            {teams.length === 0 && <p style={{ color: '#666' }}>No teams added yet.</p>}
                        </div>
                    </div>
                )}

                {/* SPONSORS TAB */}
                {activeTab === 'SPONSORS' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Sponsors ({auction.sponsors ? auction.sponsors.length : 0})</h3>
                            <button
                                onClick={() => { setEditingSponsor(null); setSponsorForm({ name: "", logoUrl: "", mobile: "", address: "", website: "" }); setShowSponsorForm(true); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#2e7d32', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                            >
                                <Plus size={18} /> Add Sponsor
                            </button>
                        </div>

                        {showSponsorForm && (
                            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #eee' }}>
                                <h4>{editingSponsor ? "Edit Sponsor" : "New Sponsor"}</h4>
                                <form onSubmit={handleAddSponsor} style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <input
                                        name="name"
                                        placeholder="Sponsor Name"
                                        value={sponsorForm.name}
                                        onChange={e => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                                        required
                                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: 1 }}
                                    />

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                                        {/* Sponsor Logo Preview */}
                                        {(sponsorFile || sponsorForm.logoUrl) && (
                                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #ccc', alignSelf: 'center', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <img
                                                    src={sponsorFile ? URL.createObjectURL(sponsorFile) : sponsorForm.logoUrl}
                                                    alt="Sponsor Preview"
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                            <label style={{ cursor: 'pointer', background: 'white', border: '1px solid #ccc', padding: '8px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px', width: '100%' }}>
                                                <Plus size={16} /> {sponsorFile ? "File Selected (Cropped)" : "Upload Logo"}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={handleSponsorFileSelect}
                                                />
                                            </label>
                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>OR</span>
                                            <input
                                                name="logoUrl"
                                                placeholder="Logo URL"
                                                value={sponsorForm.logoUrl}
                                                onChange={e => setSponsorForm({ ...sponsorForm, logoUrl: e.target.value })}
                                                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
                                            />
                                        </div>
                                    </div>
                                    <input
                                        name="mobile"
                                        placeholder="Mobile Number"
                                        value={sponsorForm.mobile}
                                        onChange={e => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setSponsorForm({ ...sponsorForm, mobile: val }); }}
                                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
                                    />
                                    <input
                                        name="address"
                                        placeholder="Address"
                                        value={sponsorForm.address}
                                        onChange={e => setSponsorForm({ ...sponsorForm, address: e.target.value })}
                                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
                                    />
                                    <input
                                        name="website"
                                        placeholder="Website (e.g., https://...)"
                                        value={sponsorForm.website}
                                        onChange={e => setSponsorForm({ ...sponsorForm, website: e.target.value })}
                                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
                                    />

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button type="button" onClick={() => setShowSponsorForm(false)} style={{ padding: '8px 20px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                                        <button type="submit" style={{ padding: '8px 20px', background: '#1e3c72', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{editingSponsor ? "Update" : "Add"}</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                            {auction.sponsors && auction.sponsors.map(sponsor => (
                                <div
                                    key={sponsor._id}
                                    onClick={() => handleViewItem('SPONSOR', sponsor)}
                                    style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', position: 'relative', cursor: 'pointer', transition: 'transform 0.1s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <div style={{ position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '5px' }} onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownloadSponsorCard(sponsor); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                                            title="Download Sponsor Card"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        </button>
                                        <button onClick={() => { setEditingSponsor(sponsor); setSponsorForm({ name: sponsor.name, logoUrl: sponsor.logoUrl || "", mobile: sponsor.mobile || "", address: sponsor.address || "", website: sponsor.website || "" }); setShowSponsorForm(true); scrollToForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1976d2' }}><Edit size={16} /></button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setModalConfig({
                                                    isOpen: true,
                                                    type: 'confirm',
                                                    title: 'Remove Sponsor?',
                                                    message: `Are you sure you want to remove "${sponsor.name}"?`,
                                                    confirmText: 'Remove',
                                                    cancelText: 'Cancel',
                                                    onConfirm: async () => {
                                                        try {
                                                            await API.delete(`/sponsor/${id}/${sponsor._id}`);
                                                            fetchAuctionDetails();
                                                            setModalConfig({ isOpen: true, type: 'success', title: 'Removed', message: 'Sponsor removed successfully.', confirmText: 'Okay' });
                                                        } catch (err) {
                                                            setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'Failed to remove sponsor.', confirmText: 'Close' });
                                                        }
                                                    }
                                                });
                                            }}
                                            style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                    <div style={{ width: '80px', height: '80px', background: '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {sponsor.logoUrl ? <img src={sponsor.logoUrl} alt="S" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <Award size={32} color="#999" />}
                                    </div>
                                    <h4 style={{ margin: '10px 0 5px 0' }}>{sponsor.name}</h4>

                                    {/* Detailed Info on Card */}
                                    <div style={{ width: '100%', fontSize: '0.85rem', color: '#555', marginTop: '10px', display: 'grid', gap: '5px' }}>
                                        {sponsor.mobile && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ fontWeight: 'bold' }}>Phone:</span> {sponsor.mobile}
                                            </div>
                                        )}
                                        {sponsor.address && (
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                                                <span style={{ fontWeight: 'bold' }}>Addr:</span> <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={sponsor.address}>{sponsor.address}</span>
                                            </div>
                                        )}
                                        {sponsor.website && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ fontWeight: 'bold' }}>Web:</span>
                                                <a href={sponsor.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#1976d2', textDecoration: 'none', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                    {sponsor.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!auction.sponsors || auction.sponsors.length === 0) && <p>No sponsors added yet.</p>}
                        </div>
                    </div>
                )}



                {activeTab === 'PLAYERS' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Auction Players ({players.length})</h3>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleExportExcel}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#1976d2', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                                    Export Excel
                                </button>
                                <button
                                    onClick={() => { setEditingPlayer(null); setShowPlayerForm(true); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#2e7d32', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                >
                                    <Plus size={18} /> Add Player
                                </button>
                            </div>
                        </div>

                        {showPlayerForm && (
                            <PlayerForm
                                key={editingPlayer ? editingPlayer._id : 'new'}
                                auctionId={id}
                                initialData={editingPlayer}
                                onSuccess={() => { setShowPlayerForm(false); fetchPlayers(); }}
                                onCancel={() => setShowPlayerForm(false)}
                            />
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginTop: '20px' }}>
                            {players.map(player => (
                                <div
                                    key={player._id}
                                    onClick={() => handleViewItem('PLAYER', player)}
                                    style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', display: 'flex', gap: '15px', background: player.status === 'SOLD' ? '#e8f5e9' : 'white', position: 'relative', cursor: 'pointer', transition: 'transform 0.1s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <div style={{ position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '5px' }} onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => { setEditingPlayer(player); setShowPlayerForm(true); scrollToForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1976d2' }}><Edit size={16} /></button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setModalConfig({
                                                    isOpen: true,
                                                    type: 'confirm',
                                                    title: 'Delete Player?',
                                                    message: `Are you sure you want to delete "${player.name}"?`,
                                                    confirmText: 'Yes, Delete',
                                                    cancelText: 'No, Keep',
                                                    onConfirm: async () => {
                                                        try {
                                                            await API.delete(`/player/${player._id}`);
                                                            fetchPlayers();
                                                            setModalConfig({ isOpen: true, type: 'success', title: 'Deleted', message: 'Player has been permanently removed.', confirmText: 'Okay' });
                                                        } catch (err) {
                                                            setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'Failed to delete player.', confirmText: 'Close' });
                                                        }
                                                    }
                                                });
                                            }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#d32f2f' }}
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                    <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {player.imageUrl ? <img src={player.imageUrl} alt="P" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <Users size={24} color="#999" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 5px 0' }}>{player.name}</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{player.category} - {player.role}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem' }}>
                                            <span style={{ fontWeight: 'bold' }}>
                                                {player.status === 'SOLD' ? (
                                                    <>
                                                        Sold: ₹{player.soldPrice || 0}
                                                        <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'normal' }}>
                                                            To: {teams.find(t => t._id === player.teamId)?.name || 'Unknown Team'}
                                                        </div>
                                                    </>
                                                ) :
                                                    player.status === 'UNSOLD' ? 'Unsold' :
                                                        `BP: ₹${player.basePrice}`}
                                            </span>
                                            <span style={{
                                                color: player.status === 'SOLD' ? 'green' :
                                                    player.status === 'UNSOLD' ? 'red' :
                                                        player.status === 'IN_AUCTION' ? '#f57c00' : '#666',
                                                fontWeight: 'bold',
                                                alignSelf: 'flex-start'
                                            }}>
                                                {player.status === 'IN_AUCTION' ? 'Remaining In Auction' :
                                                    player.status === 'NOT_IN_AUCTION' ? 'New / Not in Auction' :
                                                        player.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {players.length === 0 && <p>No players added yet.</p>}
                        </div>
                    </div>
                )}
            </div>
            {/* View Details Modal */}
            {/* View Details Modal using Reusable Component */}
            {viewItem && (
                <DetailsModal
                    isOpen={!!viewItem}
                    onClose={() => setViewItem(null)}
                    type={viewItem.type}
                    data={viewItem.data}
                    auction={auction}
                    teams={teams}
                />
            )}

        </div>
    );
}
