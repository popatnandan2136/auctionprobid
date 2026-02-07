import React, { useState } from "react";
import API from "../api";
import { Image as ImageIcon } from "lucide-react";
import ImageCropper from "./ImageCropper";

export default function TeamForm({ auctionId, onSuccess, onCancel, initialData }) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        ownerName: initialData?.ownerName || "",
        ownerEmail: initialData?.ownerEmail || "",
        ownerMobile: initialData?.ownerMobile || "",
        logoUrl: initialData?.logoUrl || "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds 5MB limit.");
                return;
            }
            const reader = new FileReader();
            reader.onload = () => setCropImageSrc(reader.result);
            reader.readAsDataURL(file);
            e.target.value = null;
        }
    };

    const onCropComplete = (croppedBlob) => {
        const croppedFile = new File([croppedBlob], "team_logo.jpg", { type: "image/jpeg" });
        setImageFile(croppedFile);
        setCropImageSrc(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("ownerName", formData.ownerName);
            data.append("ownerEmail", formData.ownerEmail);
            data.append("ownerMobile", formData.ownerMobile);
            data.append("auctionId", auctionId);

            if (imageFile) {
                data.append("logo", imageFile);
            } else if (formData.logoUrl) {
                data.append("logoUrl", formData.logoUrl);
            }

            if (initialData?._id) {
                await API.put(`/teams/${initialData._id}`, data);
            } else {
                await API.post("/teams", data);
            }
            onSuccess();
        } catch (err) {
            alert("Failed to save team: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', border: '1px solid #eee' }}>
            <h4 style={{ margin: '0 0 15px 0' }}>{initialData?._id ? "Edit Team" : "Add New Team"}</h4>

            {cropImageSrc && (
                <ImageCropper
                    image={cropImageSrc}
                    onCropComplete={onCropComplete}
                    onCancel={() => setCropImageSrc(null)}
                    aspect={1}
                />
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Team Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Owner Name</label>
                        <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Owner Email</label>
                        <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Owner Mobile</label>
                        <input type="text" name="ownerMobile" value={formData.ownerMobile} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }} />
                    </div>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Team Logo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {(imageFile || formData.logoUrl) && (
                            <img
                                src={imageFile ? URL.createObjectURL(imageFile) : formData.logoUrl}
                                alt="Preview"
                                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                        )}
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', background: '#eee', padding: '8px 15px', borderRadius: '5px' }}>
                            <ImageIcon size={16} /> Upload Logo
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" onClick={onCancel} style={{ padding: '8px 20px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" disabled={loading} style={{ padding: '8px 20px', background: '#1e3c72', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        {loading ? "Saving..." : "Save Team"}
                    </button>
                </div>
            </form>
        </div>
    );
}
