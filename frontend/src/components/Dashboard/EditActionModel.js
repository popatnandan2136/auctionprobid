import React, { useState, useEffect } from "react";
import { X, Save, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import API from "../../api";
import ActionModal from "../ActionModal";
import ImageCropper from "../ImageCropper";

export default function EditAuctionModal({ isOpen, onClose, auction, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [cropSrc, setCropSrc] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        logoUrl: "",
        pointsPerTeam: 0,
        maxPlayersPerTeam: 0,
        minPlayersPerTeam: 0,
        incrementSteps: "",
        auctionDate: "",
        totalTeams: 0,
        auctionType: "WITHOUT_STATS",
        enabledStats: []
    });

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

    useEffect(() => {
        if (auction) {
            setFormData({
                name: auction.name || "",
                logoUrl: auction.logoUrl || "",
                pointsPerTeam: auction.pointsPerTeam || 0,
                maxPlayersPerTeam: auction.maxPlayersPerTeam || 0,
                minPlayersPerTeam: auction.minPlayersPerTeam || 0,
                incrementSteps: auction.incrementSteps ? auction.incrementSteps.join(",") : "",
                auctionDate: auction.auctionDate ? new Date(auction.auctionDate).toISOString().slice(0, 16) : "",
                totalTeams: auction.totalTeams || 0,
                auctionType: auction.auctionType || "WITHOUT_STATS",
                enabledStats: auction.enabledStats || []
            });
            setImageFile(null);
        }
    }, [auction]);

    if (!isOpen || !auction) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'File size exceeds 5MB limit', confirmText: 'Close' });
                return;
            }
            const reader = new FileReader();
            reader.onload = () => setCropSrc(reader.result);
            reader.readAsDataURL(file);
            e.target.value = null;
        }
    };

    const onCropComplete = (croppedBlob) => {
        const file = new File([croppedBlob], "auction_logo.jpg", { type: "image/jpeg" });
        setImageFile(file);
        setCropSrc(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("pointsPerTeam", formData.pointsPerTeam);
            data.append("totalTeams", formData.totalTeams);
            data.append("minPlayersPerTeam", formData.minPlayersPerTeam);
            data.append("maxPlayersPerTeam", formData.maxPlayersPerTeam);

            // Handle Arrays
            const steps = formData.incrementSteps.split(",").map(s => Number(s.trim())).filter(s => !isNaN(s));
            data.append("incrementSteps", JSON.stringify(steps));

            if (formData.auctionDate) data.append("auctionDate", formData.auctionDate);

            data.append("auctionType", formData.auctionType);
            data.append("enabledStats", JSON.stringify(formData.enabledStats));

            // Handle Logo
            if (imageFile) {
                data.append("logo", imageFile);
            } else if (formData.logoUrl) {
                data.append("logoUrl", formData.logoUrl);
            }

            await API.put(`/auction/${auction._id}`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setModalConfig({
                isOpen: true,
                type: 'success',
                title: 'Success',
                message: 'Auction updated successfully!',
                confirmText: 'Great',
                onConfirm: () => {
                    onUpdate();
                    onClose();
                }
            });
        } catch (err) {
            console.error("Failed to update auction", err);
            setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: "Failed to update auction: " + (err.response?.data?.message || err.message), confirmText: 'Close' });
        }
        setLoading(false);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
            <ActionModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            {cropSrc && (
                <ImageCropper
                    image={cropSrc}
                    onCropComplete={onCropComplete}
                    onCancel={() => setCropSrc(null)}
                    aspect={1}
                />
            )}

            <div style={{
                background: 'white', borderRadius: '15px', padding: '30px', width: '90%', maxWidth: '500px',
                position: 'relative', overflowY: 'auto', maxHeight: '90vh',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ marginBottom: '20px', color: '#1e3c72' }}>Edit Auction</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Name</label>
                        <input
                            name="name"
                            className="input-field"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    {/* Logo Upload Section */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Auction Logo</label>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                            {/* Preview */}
                            <div style={{
                                width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden',
                                border: '1px solid #eee', background: '#f9f9f9', flexShrink: 0
                            }}>
                                {(imageFile || formData.logoUrl) ? (
                                    <img
                                        src={imageFile ? URL.createObjectURL(imageFile) : formData.logoUrl}
                                        alt="Current Logo"
                                        onError={(e) => { e.target.onerror = null; e.target.src = ""; }}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏆</div>
                                )}
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                    background: '#e3f2fd', padding: '8px 12px', borderRadius: '5px',
                                    color: '#1565c0', fontSize: '0.9rem', fontWeight: 'bold', width: 'fit-content'
                                }}>
                                    <ImageIcon size={16} /> {imageFile ? "Change File" : "Upload New Logo"}
                                    <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                                </label>

                                {imageFile ? (
                                    <span style={{ fontSize: '0.8rem', color: 'green' }}>Selected: {imageFile.name}</span>
                                ) : (
                                    <input
                                        name="logoUrl"
                                        value={formData.logoUrl}
                                        onChange={handleChange}
                                        placeholder="Or paste URL..."
                                        style={{ ...inputStyle, padding: '8px', fontSize: '0.9rem' }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={labelStyle}>Points Per Team</label>
                            <input name="pointsPerTeam" type="number" value={formData.pointsPerTeam} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Total Teams</label>
                            <input name="totalTeams" type="number" value={formData.totalTeams} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={labelStyle}>Min Players</label>
                            <input name="minPlayersPerTeam" type="number" value={formData.minPlayersPerTeam} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Max Players</label>
                            <input name="maxPlayersPerTeam" type="number" value={formData.maxPlayersPerTeam} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Date & Time</label>
                        <input
                            type="datetime-local"
                            name="auctionDate"
                            value={formData.auctionDate}
                            onChange={handleChange}
                            required // 🔥
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Increment Steps (comma separated)</label>
                        <input
                            name="incrementSteps"
                            value={formData.incrementSteps}
                            onChange={handleChange}
                            placeholder="10000, 50000, 100000"
                            style={inputStyle}
                        />
                    </div>

                    {/* Auction Type & Stats Config */}
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
                        <label style={{ ...labelStyle, marginBottom: '10px' }}>Auction Structure</label>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="auctionType"
                                    value="WITHOUT_STATS"
                                    checked={formData.auctionType === "WITHOUT_STATS"}
                                    onChange={handleChange}
                                />
                                Simple (No Stats)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="auctionType"
                                    value="WITH_STATS"
                                    checked={formData.auctionType === "WITH_STATS"}
                                    onChange={handleChange}
                                />
                                Advanced (With Player Stats)
                            </label>
                        </div>

                        {formData.auctionType === "WITH_STATS" && (
                            <div style={{ marginTop: "10px" }}>
                                <label style={{ fontSize: "0.85rem", color: "#666", display: 'block', marginBottom: '8px' }}>Enabled Player Statistics:</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "15px" }}>
                                    {["Matches", "Runs", "Wickets", "Batting Avg", "Bowling Avg", "Strike Rate", "Economy", "Centuries", "Fifties", "Achievements"].map(stat => (
                                        <label key={stat} style={{
                                            display: "flex", alignItems: "center", gap: "5px",
                                            background: "white", padding: "5px 10px", borderRadius: "15px",
                                            border: formData.enabledStats.find(s => s.key === stat) ? "1px solid #2e7d32" : "1px solid #ccc",
                                            cursor: "pointer",
                                            color: formData.enabledStats.find(s => s.key === stat) ? "#2e7d32" : "#333",
                                            fontSize: '0.85rem', fontWeight: formData.enabledStats.find(s => s.key === stat) ? "bold" : "normal"
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={!!formData.enabledStats.find(s => s.key === stat)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        const isText = stat === "Achievements";
                                                        setFormData({ ...formData, enabledStats: [...formData.enabledStats, { key: stat, label: stat, dataType: isText ? "String" : "Number", required: false }] });
                                                    } else {
                                                        setFormData({ ...formData, enabledStats: formData.enabledStats.filter(s => s.key !== stat) });
                                                    }
                                                }}
                                                style={{ display: "none" }}
                                            />
                                            {stat}
                                        </label>
                                    ))}
                                </div>

                                {/* Custom Stat Input */}
                                <div style={{ display: "flex", gap: "5px" }}>
                                    <input id="editCustomStat" placeholder="Add Custom (e.g. Catches)" style={{ ...inputStyle, padding: '6px', fontSize: '0.9rem' }} />
                                    <button type="button" onClick={() => {
                                        const val = document.getElementById("editCustomStat").value;
                                        if (val && !formData.enabledStats.find(s => s.key === val)) {
                                            setFormData({ ...formData, enabledStats: [...formData.enabledStats, { key: val, label: val, dataType: "Number", required: false }] });
                                            document.getElementById("editCustomStat").value = "";
                                        }
                                    }} style={{ background: "#1e3c72", color: "white", border: "none", padding: "0 15px", borderRadius: "5px", cursor: "pointer" }}><Plus size={16} /></button>
                                </div>

                                {formData.enabledStats.length > 0 && (
                                    <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                        {formData.enabledStats.filter(s => !["Matches", "Runs", "Wickets", "Batting Avg", "Bowling Avg", "Strike Rate", "Economy", "Centuries", "Fifties", "Achievements"].includes(s.key)).map((stat, idx) => (
                                            <span key={idx} style={{ background: "#e3f2fd", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px", color: "#1565c0" }}>
                                                {stat.label}
                                                <Trash2 size={10} style={{ cursor: "pointer" }} onClick={() => setFormData({ ...formData, enabledStats: formData.enabledStats.filter(s => s.key !== stat.key) })} />
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '10px',
                            background: '#1e3c72', color: 'white', border: 'none', padding: '12px',
                            borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                        }}
                    >
                        {loading ? 'Updating...' : <><Save size={18} /> Update Auction</>}
                    </button>
                </form>
            </div>
            <style>{`
                @keyframes popIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.9em', color: '#666' };
const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem'
};
