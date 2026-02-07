import React, { useState } from "react";
import API from "../../api";
import { Image as ImageIcon } from "lucide-react";

import ImageCropper from "../../components/ImageCropper";

export default function PlayerForm({ auctionId, onSuccess, onCancel, initialData, showModal }) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        mobile: initialData?.mobile || "",
        category: initialData?.category || "Batsman",
        role: initialData?.role || "",
        basePrice: initialData?.basePrice || 0,
        imageUrl: initialData?.imageUrl || "",
        stats: initialData?.stats || {}
    });
    const [imageFile, setImageFile] = useState(null);
    const [cropImageSrc, setCropImageSrc] = useState(null); // Image to be cropped
    const [auctionStats, setAuctionStats] = useState([]);
    const [auctionConfig, setAuctionConfig] = useState({ categories: [], roles: [] }); // 🔥 Store custom config
    const [loading, setLoading] = useState(false);

    // Fetch auction details to get enabled stats
    React.useEffect(() => {
        if (auctionId) {
            API.get(`/auctions/${auctionId}`).then(res => { // Fixed endpoint from /auction to /auctions based on routes
                if (res.data.auctionType === "WITH_STATS") {
                    setAuctionStats(res.data.enabledStats || []);
                }
                setFormData(prev => ({
                    ...prev,
                    // Set default if empty and not editing
                    category: !initialData && res.data.customCategories?.[0] ? res.data.customCategories[0] : prev.category
                }));
                // Store config for dropdowns
                setAuctionConfig({
                    categories: res.data.customCategories?.length ? res.data.customCategories : ["Batsman", "Bowler", "All-Rounder", "Wicket Keeper"],
                    roles: res.data.customRoles?.length ? res.data.customRoles : ["Opener", "Middle Order", "Finisher", "Spinner", "Fast Bowler"]
                });
            }).catch(console.error);
        }
    }, [auctionId]);

    // Fetch full player details (specifically stats) when editing
    React.useEffect(() => {
        if (initialData?._id) {
            API.get(`/players/${initialData._id}`).then(res => { // Fixed endpoint
                const player = res.data;
                // Ensure stats are parsed if they come as string (though backend should handle it, double check)
                let playerStats = player.stats || {};
                if (typeof playerStats === 'string') {
                    try { playerStats = JSON.parse(playerStats); } catch (e) { }
                }

                setFormData(prev => ({
                    ...prev,
                    name: player.name,
                    mobile: player.mobile || "",
                    category: player.category,
                    role: player.role || "",
                    basePrice: player.basePrice,
                    imageUrl: player.imageUrl || "",
                    stats: playerStats
                }));
            }).catch(console.error);
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStatChange = (key, value) => {
        setFormData({ ...formData, stats: { ...formData.stats, [key]: value } });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File size exceeds 5MB limit. Please choose a smaller image.");
                e.target.value = null; // Clear input
                return;
            }
            // Read file to open cropper
            const reader = new FileReader();
            reader.onload = () => {
                setCropImageSrc(reader.result);
            };
            reader.readAsDataURL(file);
            e.target.value = null; // Reset input to allow re-selecting same file
        }
    };

    const onCropComplete = (croppedBlob) => {
        // Create a File object from Blob to match backend expectation
        const croppedFile = new File([croppedBlob], "cropped_image.jpg", { type: "image/jpeg" });
        setImageFile(croppedFile);
        setCropImageSrc(null); // Close cropper
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("mobile", formData.mobile);
            data.append("category", formData.category);
            data.append("role", formData.role);
            data.append("basePrice", formData.basePrice);
            data.append("auctionId", auctionId);

            data.append("stats", JSON.stringify(formData.stats));

            if (imageFile) {
                data.append("image", imageFile);
            } else if (formData.imageUrl) {
                data.append("imageUrl", formData.imageUrl);
            }

            if (initialData) {
                await API.put(`/players/${initialData._id}`, data);
                if (showModal) showModal({ type: 'success', title: 'Player Updated', message: 'Player details updated successfully!', confirmText: 'Okay' });
            } else {
                await API.post("/players/add", data);
                if (showModal) showModal({ type: 'success', title: 'Player Added', message: 'New player added to the pool!', confirmText: 'Great' });
            }

            onSuccess();
        } catch (err) {
            if (showModal) {
                showModal({ type: 'danger', title: 'Error', message: "Failed to save player: " + (err.response?.data?.message || err.message), confirmText: 'Close' });
            } else {
                alert("Failed to save player");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', border: '1px solid #eee' }}>
            <h4 style={{ margin: '0 0 15px 0' }}>{initialData?._id ? "Edit Player" : "Add New Player"}</h4>

            {cropImageSrc && (
                <ImageCropper
                    image={cropImageSrc}
                    onCropComplete={onCropComplete}
                    onCancel={() => setCropImageSrc(null)}
                    aspect={1} // Square for players
                />
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Player Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Mobile</label>
                        <input type="text" name="mobile" value={formData.mobile} onChange={e => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setFormData({ ...formData, mobile: val }); }} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }} />
                    </div>
                </div>



                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}>
                            {auctionConfig.categories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}>
                            <option value="">Select Role</option>
                            {auctionConfig.roles.map((role, idx) => (
                                <option key={idx} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Base Price</label>
                        <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }} />
                    </div>
                </div>

                {/* Dynamic Stats Inputs */}
                {
                    auctionStats.length > 0 && (
                        <div style={{ background: "#e3f2fd", padding: "10px", borderRadius: "5px" }}>
                            <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold", fontSize: "0.9rem", color: "#1565c0" }}>Player Stats</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                {auctionStats.map(stat => (
                                    <div key={stat.key}>
                                        <label style={{ display: "block", marginBottom: "3px", fontSize: "0.8rem" }}>{stat.label}</label>
                                        <input
                                            type="number"
                                            placeholder={stat.label}
                                            value={formData.stats[stat.key] || ""}
                                            onChange={(e) => handleStatChange(stat.key, e.target.value)}
                                            style={{ width: "100%", padding: "5px", borderRadius: "5px", border: "1px solid #ccc" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Player Image</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Image Preview */}
                        {(imageFile || formData.imageUrl) && (
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #ddd', alignSelf: 'center', background: '#f0f0f0' }}>
                                <img
                                    src={imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl}
                                    alt="Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        )}

                        {/* File Upload */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', background: '#eee', padding: '8px 15px', borderRadius: '5px' }}>
                                <ImageIcon size={16} /> Upload from Device
                                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                            </label>
                            {imageFile && <span style={{ fontSize: '0.8rem', color: 'green' }}>Selected: {imageFile.name} (Cropped)</span>}
                        </div>
                        {/* URL Failover */}
                        <input type="text" name="imageUrl" placeholder="Or paste Image URL" value={formData.imageUrl} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={onCancel} style={{ padding: '8px 20px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" disabled={loading} style={{ padding: '8px 20px', background: '#1e3c72', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        {loading ? (initialData?._id ? "Updating..." : "Saving...") : (initialData?._id ? "Update Player" : "Add Player")}
                    </button>
                </div>
            </form >
        </div >
    );
}

