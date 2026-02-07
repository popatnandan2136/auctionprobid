import React, { useState, useEffect } from "react";
import API from "../../api";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import ActionModal from "../../components/ActionModal";
import ImageCropper from "../../components/ImageCropper";

export default function CreateAuction({ onCancel, onSuccess, initialData = null }) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        logoUrl: initialData?.logoUrl || "",
        auctionDate: initialData?.auctionDate ? new Date(initialData.auctionDate).toISOString().slice(0, 16) : "",
        pointsPerTeam: initialData?.pointsPerTeam || 0,
        totalTeams: initialData?.totalTeams || 0,
        minPlayersPerTeam: initialData?.minPlayersPerTeam || 0,
        maxPlayersPerTeam: initialData?.maxPlayersPerTeam || 0,
        auctionType: initialData?.auctionType || "WITHOUT_STATS",
        incrementSteps: Array.isArray(initialData?.incrementSteps) ? initialData.incrementSteps : [],
        enabledStats: Array.isArray(initialData?.enabledStats) ? initialData.enabledStats : [],
        customCategories: Array.isArray(initialData?.customCategories) && initialData.customCategories.length > 0 ? initialData.customCategories : ["Batsman", "Bowler", "All-Rounder", "Wicket Keeper"],
        customRoles: Array.isArray(initialData?.customRoles) && initialData.customRoles.length > 0 ? initialData.customRoles : ["Opener", "Middle Order", "Finisher", "Spinner", "Fast Bowler"]
    });

    const [imageFile, setImageFile] = useState(null);
    const [cropSrc, setCropSrc] = useState(null); // For Image Cropper
    const [newStep, setNewStep] = useState(10000);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

    const isEditMode = !!initialData;

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                logoUrl: initialData.logoUrl || "",
                auctionDate: initialData.auctionDate ? new Date(initialData.auctionDate).toISOString().slice(0, 16) : "",
                pointsPerTeam: initialData.pointsPerTeam || 0,
                totalTeams: initialData.totalTeams || 0,
                minPlayersPerTeam: initialData.minPlayersPerTeam || 0,
                maxPlayersPerTeam: initialData.maxPlayersPerTeam || 0,
                auctionType: initialData.auctionType || "WITHOUT_STATS",
                incrementSteps: Array.isArray(initialData.incrementSteps) ? initialData.incrementSteps : [],
                enabledStats: Array.isArray(initialData.enabledStats) ? initialData.enabledStats : [],
                customCategories: Array.isArray(initialData.customCategories) && initialData.customCategories.length > 0 ? initialData.customCategories : ["Batsman", "Bowler", "All-Rounder", "Wicket Keeper"],
                customRoles: Array.isArray(initialData.customRoles) && initialData.customRoles.length > 0 ? initialData.customRoles : ["Opener", "Middle Order", "Finisher", "Spinner", "Fast Bowler"]
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB Limit
                setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'File size exceeds 5MB', confirmText: 'Close' });
                return;
            }
            const reader = new FileReader();
            reader.onload = () => setCropSrc(reader.result);
            reader.readAsDataURL(file);
            e.target.value = null; // Reset input
        }
    };

    const onCropComplete = (croppedBlob) => {
        const file = new File([croppedBlob], "auction_logo.jpg", { type: "image/jpeg" });
        setImageFile(file);
        setCropSrc(null);
    };

    const addIncrementStep = () => {
        setFormData({ ...formData, incrementSteps: [...formData.incrementSteps, parseInt(newStep)].sort((a, b) => a - b) });
    };

    const removeIncrementStep = (idx) => {
        const newSteps = formData.incrementSteps.filter((_, i) => i !== idx);
        setFormData({ ...formData, incrementSteps: newSteps });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation: Enforce all fields
        if (!formData.name || !formData.pointsPerTeam || !formData.totalTeams || !formData.minPlayersPerTeam || !formData.maxPlayersPerTeam || !formData.auctionDate) {
            setModalConfig({ isOpen: true, type: 'danger', title: 'Missing Fields', message: 'All fields are required.', confirmText: 'Close' });
            setLoading(false);
            return;
        }

        if (!isEditMode && !imageFile && !formData.logoUrl) {
            setModalConfig({ isOpen: true, type: 'danger', title: 'Missing Logo', message: 'Auction Logo is required (Upload file or provide URL).', confirmText: 'Close' });
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("pointsPerTeam", formData.pointsPerTeam);
            data.append("totalTeams", formData.totalTeams);
            data.append("minPlayersPerTeam", formData.minPlayersPerTeam);
            data.append("maxPlayersPerTeam", formData.maxPlayersPerTeam);
            data.append("auctionType", formData.auctionType);

            // Serialize Arrays/Objects
            data.append("incrementSteps", JSON.stringify(formData.incrementSteps));
            data.append("enabledStats", JSON.stringify(formData.enabledStats));
            data.append("customCategories", JSON.stringify(formData.customCategories));
            data.append("customRoles", JSON.stringify(formData.customRoles));

            if (formData.auctionDate) data.append("auctionDate", formData.auctionDate);

            // Image Handling
            if (imageFile) {
                data.append("logo", imageFile); // 'logo' key expected by backend multer
            } else if (formData.logoUrl) {
                data.append("logoUrl", formData.logoUrl);
            }

            if (isEditMode) {
                await API.put(`/auction/${initialData._id}`, data);
                setModalConfig({
                    isOpen: true,
                    type: 'success',
                    title: 'Success',
                    message: 'Auction Updated Successfully!',
                    confirmText: 'Okay',
                    onConfirm: onSuccess
                });
            } else {
                await API.post("/auction/create", data);
                setModalConfig({
                    isOpen: true,
                    type: 'success',
                    title: 'Success',
                    message: 'Auction Created Successfully!',
                    confirmText: 'Okay',
                    onConfirm: onSuccess
                });
            }
        } catch (err) {
            console.error("Submission Error", err);
            setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} auction`, confirmText: 'Close' });
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}>
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

            <h2 style={{ color: "#1e3c72", marginBottom: "20px" }}>{isEditMode ? "Edit Auction" : "Create New Auction"}</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Auction Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
                    </div>

                    {/* Logo Section */}
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Auction Logo</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Preview */}
                            {(imageFile || formData.logoUrl) && (
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #eee', background: '#f9f9f9' }}>
                                    <img
                                        src={imageFile ? URL.createObjectURL(imageFile) : formData.logoUrl}
                                        alt="Logo Preview"
                                        onError={(e) => { e.target.onerror = null; e.target.src = ""; }}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', background: '#e3f2fd', padding: '8px 12px', borderRadius: '5px', color: '#1565c0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    <ImageIcon size={16} /> {imageFile ? "Change File" : (isEditMode ? "Change Logo" : "Upload Logo")}
                                    <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                                </label>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>OR</span>
                                <input
                                    type="text"
                                    name="logoUrl"
                                    value={formData.logoUrl}
                                    onChange={handleChange}
                                    placeholder="Paste Image URL"
                                    style={{ flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "5px" }}
                                />
                            </div>
                            {imageFile && <span style={{ fontSize: '0.8rem', color: 'green' }}>Selected: {imageFile.name}</span>}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Total Teams</label>
                        <input type="number" name="totalTeams" value={formData.totalTeams} onChange={handleChange} required style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Min Players/Team</label>
                        <input type="number" name="minPlayersPerTeam" value={formData.minPlayersPerTeam} onChange={handleChange} required style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Max Players/Team</label>
                        <input type="number" name="maxPlayersPerTeam" value={formData.maxPlayersPerTeam} onChange={handleChange} required style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
                    </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Total Budget Per Team</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: "1px solid #ccc", borderRadius: "5px" }}>
                        <span style={{ padding: "10px", background: "#f0f0f0", borderRight: "1px solid #ccc" }}>₹</span>
                        <input type="number" name="pointsPerTeam" value={formData.pointsPerTeam} onChange={handleChange} required style={{ border: "none", width: "100%", padding: "10px" }} />
                    </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Increment Steps</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {formData.incrementSteps.map((step, idx) => (
                            <span key={idx} style={{ background: "#e8f5e9", padding: "5px 10px", borderRadius: "15px", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem" }}>
                                ₹{step} <Trash2 size={14} style={{ cursor: "pointer", color: "red" }} onClick={() => removeIncrementStep(idx)} />
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="number" value={newStep} onChange={(e) => setNewStep(e.target.value)} style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "5px", width: "150px" }} />
                        <button type="button" onClick={addIncrementStep} style={{ background: "#1e3c72", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }}><Plus size={16} /></button>
                    </div>
                </div>

                {/* Auction Date - Ensure Required */}
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Auction Date & Time</label>
                    <input
                        type="datetime-local"
                        name="auctionDate"
                        value={formData.auctionDate}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
                    />
                </div>

                {/* Categories & Roles Config */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

                    {/* Categories */}
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Player Categories</label>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                            {formData.customCategories.map((cat, idx) => (
                                <span key={idx} style={{ background: "#e1bee7", padding: "5px 10px", borderRadius: "15px", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem" }}>
                                    {cat} <Trash2 size={14} style={{ cursor: "pointer", color: "#8e24aa" }} onClick={() => setFormData({ ...formData, customCategories: formData.customCategories.filter((_, i) => i !== idx) })} />
                                </span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input id="newCat" placeholder="New Category" style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "5px", flex: 1 }} />
                            <button type="button" onClick={() => {
                                const val = document.getElementById("newCat").value;
                                if (val && !formData.customCategories.includes(val)) {
                                    setFormData({ ...formData, customCategories: [...formData.customCategories, val] });
                                    document.getElementById("newCat").value = "";
                                }
                            }} style={{ background: "#6a1b9a", color: "white", border: "none", padding: "8px", borderRadius: "5px", cursor: "pointer" }}><Plus size={16} /></button>
                        </div>
                    </div>

                    {/* Roles */}
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Player Roles</label>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                            {formData.customRoles.map((role, idx) => (
                                <span key={idx} style={{ background: "#ffccbc", padding: "5px 10px", borderRadius: "15px", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem" }}>
                                    {role} <Trash2 size={14} style={{ cursor: "pointer", color: "#d84315" }} onClick={() => setFormData({ ...formData, customRoles: formData.customRoles.filter((_, i) => i !== idx) })} />
                                </span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input id="newRole" placeholder="New Role" style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "5px", flex: 1 }} />
                            <button type="button" onClick={() => {
                                const val = document.getElementById("newRole").value;
                                if (val && !formData.customRoles.includes(val)) {
                                    setFormData({ ...formData, customRoles: [...formData.customRoles, val] });
                                    document.getElementById("newRole").value = "";
                                }
                            }} style={{ background: "#d84315", color: "white", border: "none", padding: "8px", borderRadius: "5px", cursor: "pointer" }}><Plus size={16} /></button>
                        </div>
                    </div>
                </div>

                {/* Auction Type & Stats Config */}
                <div style={{ marginBottom: "30px" }}>
                    <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>Auction Type</label>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="auctionType"
                                value="WITHOUT_STATS"
                                checked={formData.auctionType === "WITHOUT_STATS"}
                                onChange={handleChange}
                            />
                            Without Stats
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="auctionType"
                                value="WITH_STATS"
                                checked={formData.auctionType === "WITH_STATS"}
                                onChange={handleChange}
                            />
                            With Stats
                        </label>
                    </div>
                    {
                        formData.auctionType === "WITH_STATS" && (
                            <div style={{ marginTop: "20px", padding: "15px", background: "#f9f9f9", borderRadius: "10px", border: "1px solid #eee" }}>
                                <h4 style={{ margin: "0 0 10px 0", color: "#1e3c72" }}>Configure Player Stats</h4>

                                {/* Predefined Stats */}
                                <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem", color: "#666" }}>Select Standard Stats:</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
                                    {["Matches", "Runs", "Wickets", "Batting Avg", "Bowling Avg", "Strike Rate", "Economy", "Centuries", "Fifties", "Achievements"].map(stat => (
                                        <label key={stat} style={{ display: "flex", alignItems: "center", gap: "5px", background: "white", padding: "5px 10px", borderRadius: "15px", border: formData.enabledStats.find(s => s.key === stat) ? "1px solid #2e7d32" : "1px solid #ccc", cursor: "pointer", color: formData.enabledStats.find(s => s.key === stat) ? "#2e7d32" : "#333", fontWeight: formData.enabledStats.find(s => s.key === stat) ? "bold" : "normal" }}>
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

                                {/* Custom Stats */}
                                <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem", color: "#666" }}>Add Custom Stat:</label>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <input id="customStat" placeholder="e.g. Catches" style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", flex: 1 }} />
                                    <select id="customStatType" style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}>
                                        <option value="Number">Number</option>
                                        <option value="String">Text</option>
                                    </select>
                                    <button type="button" onClick={() => {
                                        const val = document.getElementById("customStat").value;
                                        const type = document.getElementById("customStatType").value;
                                        if (val && !formData.enabledStats.find(s => s.key === val)) {
                                            setFormData({ ...formData, enabledStats: [...formData.enabledStats, { key: val, label: val, dataType: type, required: false }] });
                                            document.getElementById("customStat").value = "";
                                        }
                                    }} style={{ background: "#1e3c72", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }}><Plus size={16} /></button>
                                </div>

                                {/* Selected List */}
                                {formData.enabledStats.length > 0 && (
                                    <div style={{ marginTop: "15px" }}>
                                        <p style={{ margin: "0 0 5px 0", fontSize: "0.9rem", fontWeight: "bold" }}>Selected Stats ({formData.enabledStats.length}):</p>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                            {formData.enabledStats.map((stat, idx) => (
                                                <span key={idx} style={{ background: "#e3f2fd", padding: "4px 10px", borderRadius: "12px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "5px", color: "#1565c0" }}>
                                                    {stat.label}
                                                    <Trash2 size={12} style={{ cursor: "pointer" }} onClick={() => setFormData({ ...formData, enabledStats: formData.enabledStats.filter(s => s.key !== stat.key) })} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    }
                </div >

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={onCancel} style={{ padding: "12px 25px", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: "5px", cursor: "pointer" }}>Cancel</button>
                    <button type="submit" disabled={loading} style={{ padding: "12px 25px", background: "#2e7d32", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                        {loading ? "Processing..." : (isEditMode ? "Update Auction" : "Create Auction")}
                    </button>
                </div>
            </form >
        </div >
    );
}
