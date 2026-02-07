import React, { useState, useEffect } from "react";
import API from "../../api";
import { Trash2, UserPlus, Shield, CheckCircle, XCircle, Key, Power, Briefcase, Upload, Smartphone, FileText, Users, Image as ImageIcon, X } from "lucide-react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../utils/cropImage";
import ActionModal from "../../components/ActionModal";
import { useAuth } from "../../context/AuthContext";

export default function AdminManagement() {
    const { user, isMaster } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", mobile: "", password: "", role: "ADMIN" });
    const [searchTerm, setSearchTerm] = useState("");
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

    // Partner Management State
    const [viewMode, setViewMode] = useState("users"); // 'users' or 'partners'
    const [partners, setPartners] = useState([]);
    const [partnerForm, setPartnerForm] = useState({ name: "", title: "", description: "", mobile: "", type: "OWNER", website: "", order: 0 });
    const [partnerImage, setPartnerImage] = useState(null);

    // Cropper State
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [finalImage, setFinalImage] = useState(null);

    // Password Reset State
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetData, setResetData] = useState({ userId: "", userName: "", newPassword: "" });

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await API.get("/admin");
            // Sort by Role Priority: MASTER_ADMIN > ADMIN > TEAM
            const rolePriority = { "MASTER_ADMIN": 1, "ADMIN": 2, "TEAM": 3 };
            const sorted = res.data.sort((a, b) => {
                return (rolePriority[a.role] || 99) - (rolePriority[b.role] || 99);
            });
            setAdmins(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPartners = async () => {
        try {
            const res = await API.get("/partner"); // Public endpoint
            setPartners(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAdmins();
        fetchPartners(); // Fetch partners on load
    }, []);

    const toggleStatus = async (id) => {
        try {
            await API.put(`/admin/${id}/status`);
            fetchAdmins();
        } catch (err) {
            console.error("Failed to update status", err);
            setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'Failed to update status', confirmText: 'Close' });
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            await API.post("/auth/register-admin", formData);
            setModalConfig({ isOpen: true, type: 'success', title: 'Success', message: 'User registered successfully!', confirmText: 'Okay' });
            setShowAddForm(false);
            setFormData({ name: "", email: "", mobile: "", password: "", role: "ADMIN" });
            fetchAdmins();
        } catch (err) {
            setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: err.response?.data?.message || 'Failed to register user', confirmText: 'Close' });
        }
    };

    const handleDeleteAdmin = async (id, name) => {
        setModalConfig({
            isOpen: true,
            type: 'confirm',
            title: 'Delete Admin?',
            message: `Are you sure you want to delete admin "${name}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: async () => {
                try {
                    await API.delete(`/admin/${id}`);
                    fetchAdmins();
                    setModalConfig({ isOpen: true, type: 'success', title: 'Deleted', message: 'Admin deleted successfully.', confirmText: 'Okay' });
                } catch (err) {
                    setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'Failed to delete admin', confirmText: 'Close' });
                }
            }
        });
    };

    const openResetModal = (id, name) => {
        setResetData({ userId: id, userName: name, newPassword: "" });
        setShowResetModal(true);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!resetData.newPassword) return;

        try {
            await API.post("/auth/reset-user-password", { userId: resetData.userId, newPassword: resetData.newPassword });
            setShowResetModal(false);
            setModalConfig({ isOpen: true, type: 'success', title: 'Success', message: `Password for ${resetData.userName} updated successfully!`, confirmText: 'Great' });
        } catch (err) {
            setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: err.response?.data?.message || 'Failed to update password', confirmText: 'Close' });
        }
    };

    // Partner Management Functions
    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImageSrc(reader.result);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const confirmCrop = async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            setFinalImage(croppedImage); // Blob
            setPartnerImage(croppedImage);
            setShowCropper(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddPartner = async (e) => {
        e.preventDefault();
        if (!partnerImage) return alert("Please upload an image");

        const data = new FormData();
        data.append("type", partnerForm.type);
        data.append("name", partnerForm.name);
        data.append("title", partnerForm.title);
        data.append("description", partnerForm.description);
        data.append("mobile", partnerForm.mobile);
        data.append("website", partnerForm.website);
        data.append("order", partnerForm.order);
        data.append("image", partnerImage); // Blob

        try {
            await API.post("/partner", data, { headers: { "Content-Type": "multipart/form-data" } });
            setModalConfig({ isOpen: true, type: 'success', title: 'Success', message: 'Partner added successfully!', confirmText: 'Okay' });
            setModalConfig({ isOpen: true, type: 'success', title: 'Success', message: 'Partner added successfully!', confirmText: 'Okay' });
            setPartnerForm({ name: "", title: "", description: "", mobile: "", type: "OWNER", website: "", order: 0 });
            setPartnerImage(null);
            setFinalImage(null);
            fetchPartners();
        } catch (err) {
            setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'Failed to add partner', confirmText: 'Close' });
        }
    };

    const handleDeletePartner = async (id) => {
        setModalConfig({
            isOpen: true, type: 'confirm', title: 'Delete Partner?', message: 'Are you sure?', confirmText: 'Delete', cancelText: 'Cancel',
            onConfirm: async () => {
                try {
                    await API.delete(`/partner/${id}`);
                    fetchPartners();
                    setModalConfig({ isOpen: true, type: 'success', title: 'Deleted', message: 'Partner deleted.', confirmText: 'Okay' });
                } catch (err) { }
            }
        });
    };

    // Filter Logic
    const filteredAdmins = admins.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.mobile.includes(searchTerm) ||
        (admin.email && admin.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ padding: "20px", background: "#f4f6f8", minHeight: "100vh" }}>
            <ActionModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            {/* Custom Password Reset Modal */}
            {showResetModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '10px', width: '400px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Key size={20} /> Reset Password</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Enter new password for <strong>{resetData.userName}</strong></p>
                        <form onSubmit={handleResetPassword}>
                            <input
                                type="text"
                                placeholder="New Password"
                                value={resetData.newPassword}
                                onChange={e => setResetData({ ...resetData, newPassword: e.target.value })}
                                required
                                style={{ width: '100%', padding: '10px', margin: '15px 0', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowResetModal(false)} style={{ padding: '8px 15px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '8px 15px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ color: "#1e3c72", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Shield size={24} /> Admin & Partner Management
                </h2>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setViewMode("users")}
                        style={{
                            padding: "10px 20px", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold",
                            background: viewMode === "users" ? "#1e3c72" : "#e0e0e0", color: viewMode === "users" ? "white" : "#333"
                        }}
                    >
                        <Users size={18} style={{ marginBottom: '-3px', marginRight: '5px' }} /> Admins
                    </button>
                    <button
                        onClick={() => setViewMode("partners")}
                        style={{
                            padding: "10px 20px", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold",
                            background: viewMode === "partners" ? "#1e3c72" : "#e0e0e0", color: viewMode === "partners" ? "white" : "#333"
                        }}
                    >
                        <Briefcase size={18} style={{ marginBottom: '-3px', marginRight: '5px' }} /> Partners
                    </button>
                </div>

                {/* Only Show 'Add User' if in Users Mode */}
                {isMaster() && viewMode === 'users' && (
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        style={{
                            background: showAddForm ? "#d32f2f" : "#2e7d32",
                            color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "5px", fontWeight: "bold"
                        }}
                    >
                        {showAddForm ? <><XCircle size={18} /> Cancel</> : <><UserPlus size={18} /> Add New User</>}
                    </button>
                )}
            </div>

            {/* PARTNER MANAGEMENT SECTION */}
            {viewMode === "partners" && (
                <div>
                    {/* Cropper Modal */}
                    {showCropper && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'relative', width: '90%', height: '60%', background: '#333' }}>
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                />
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} />
                                <button onClick={() => setShowCropper(false)} style={{ padding: '10px 20px', background: 'white', border: 'none', borderRadius: '5px' }}>Cancel</button>
                                <button onClick={confirmCrop} style={{ padding: '10px 20px', background: '#1e3c72', color: 'white', border: 'none', borderRadius: '5px' }}>Crop & Save</button>
                            </div>
                        </div>
                    )}

                    {isMaster() && (
                        <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", marginBottom: "30px", border: "1px solid #ddd" }}>
                            <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#333", display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Briefcase size={20} color="#1565c0" /> Add Official Partner / Owner
                            </h3>
                            <form onSubmit={handleAddPartner} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>

                                {/* Type Selection */}
                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '15px', marginBottom: '10px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                        <input type="radio" name="ptype" checked={partnerForm.type === 'OWNER'} onChange={() => setPartnerForm({ ...partnerForm, type: 'OWNER' })} />
                                        <strong>Owner (Person)</strong>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                        <input type="radio" name="ptype" checked={partnerForm.type === 'PARTNER'} onChange={() => setPartnerForm({ ...partnerForm, type: 'PARTNER' })} />
                                        <strong>Official Partner (Company)</strong>
                                    </label>
                                </div>

                                <input
                                    type="text"
                                    placeholder={partnerForm.type === 'OWNER' ? "Full Name (e.g. Nandan Popat)" : "Company Name (e.g. ProTech Solutions)"}
                                    required value={partnerForm.name} onChange={e => setPartnerForm({ ...partnerForm, name: e.target.value })}
                                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                                />
                                <input
                                    type="text"
                                    placeholder={partnerForm.type === 'OWNER' ? "Title (e.g. Owner & Developer)" : "Title (e.g. Technology Partner)"}
                                    required value={partnerForm.title} onChange={e => setPartnerForm({ ...partnerForm, title: e.target.value })}
                                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                                />
                                <input
                                    type="text"
                                    placeholder={partnerForm.type === 'OWNER' ? "Mobile" : "Contact Number"}
                                    required value={partnerForm.mobile} onChange={e => setPartnerForm({ ...partnerForm, mobile: e.target.value })}
                                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', gridColumn: 'span 2' }}>
                                    <input
                                        type="number"
                                        placeholder="Priority (1 = Top)"
                                        value={partnerForm.order} onChange={e => setPartnerForm({ ...partnerForm, order: e.target.value })}
                                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                                    />
                                    {partnerForm.type === 'PARTNER' && (
                                        <input
                                            type="text"
                                            placeholder="Website (e.g. www.example.com)"
                                            value={partnerForm.website} onChange={e => setPartnerForm({ ...partnerForm, website: e.target.value })}
                                            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                                        />
                                    )}
                                </div>

                                <div style={{ gridColumn: "span 1", position: 'relative' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>{partnerForm.type === 'OWNER' ? 'Profile Image' : 'Company Logo'}</label>
                                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ padding: "5px" }} />
                                    {finalImage && <span style={{ color: 'green', fontSize: '0.8rem', marginLeft: '10px' }}>Image Selected</span>}
                                </div>
                                <textarea placeholder="Description" required value={partnerForm.description} onChange={e => setPartnerForm({ ...partnerForm, description: e.target.value })} style={{ gridColumn: "span 2", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", minHeight: "80px" }} />
                                <button type="submit" style={{ gridColumn: "span 2", padding: "12px", background: "#1e3c72", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Add {partnerForm.type === 'OWNER' ? 'Owner' : 'Partner'}</button>
                            </form>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {partners.map(partner => (
                            <div key={partner._id} style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderTop: '4px solid #1e3c72', position: 'relative' }}>
                                {isMaster() && <button onClick={() => handleDeletePartner(partner._id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer' }}><Trash2 size={18} /></button>}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                    <img src={`http://localhost:5000${partner.imageUrl}`} alt={partner.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>{partner.name}</h4>
                                        <div style={{ fontSize: '0.85rem', color: '#1565c0', fontWeight: 'bold' }}>{partner.title}</div>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5', marginBottom: '15px' }}>{partner.description}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: 'bold', color: '#333' }}>
                                    <Smartphone size={16} /> {partner.mobile}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search Bar (Only for Users) */}
            {viewMode === 'users' && (
                <div style={{ marginBottom: "20px" }}>
                    <input
                        type="text"
                        placeholder="Search by Name, Mobile, or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            fontSize: "1rem",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                        }}
                    />
                </div>
            )}

            {viewMode === 'users' && showAddForm && isMaster() && (
                <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", marginBottom: "30px", border: "1px solid #ddd" }}>
                    <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#333" }}>Register New User</h3>
                    <form onSubmit={handleAddAdmin} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                        <input
                            type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                        />
                        <input
                            type="text" placeholder="Mobile Number" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} required
                            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                        />
                        <input
                            type="email" placeholder="Email Address (Optional)" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                        />
                        <input
                            type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required
                            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                        />

                        <select
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", background: 'white' }}
                        >
                            <option value="ADMIN">Admin</option>
                            <option value="MASTER_ADMIN">Master Admin</option>
                        </select>

                        <button type="submit" style={{ gridColumn: "span 2", padding: "12px", background: "#1e3c72", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                            Create Account
                        </button>
                    </form>
                </div>
            )}

            {viewMode === 'users' && (
                <div style={{ background: "white", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                    <div style={{ padding: "15px", background: "#eee", fontWeight: "bold", display: "grid", gridTemplateColumns: "1.5fr 1.5fr 2fr 1fr 1fr 2fr", borderBottom: "1px solid #ddd" }}>
                        <span>Name</span>
                        <span>Mobile</span>
                        <span>Email</span>
                        <span>Role</span>
                        <span>Status</span>
                        <span style={{ textAlign: "center" }}>Actions</span>
                    </div>
                    {loading ? (
                        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>Loading users...</div>
                    ) : filteredAdmins.length === 0 ? (
                        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>No users found matching "{searchTerm}".</div>
                    ) : (
                        filteredAdmins.map(admin => (
                            <div key={admin._id} style={{ padding: "15px", borderBottom: "1px solid #f0f0f0", display: "grid", gridTemplateColumns: "1.5fr 1.5fr 2fr 1fr 1fr 2fr", alignItems: "center" }}>
                                <div style={{ fontWeight: "500", color: "#333" }}>{admin.name}</div>
                                <div style={{ color: "#555" }}>{admin.mobile}</div>
                                <div style={{ color: "#555" }}>{admin.email || "-"}</div>
                                <div>
                                    <span style={{
                                        padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                                        background: admin.role === 'MASTER_ADMIN' ? '#e1bee7' : (admin.role === 'ADMIN' ? '#bbdefb' : '#ffccbc'),
                                        color: admin.role === 'MASTER_ADMIN' ? '#4a148c' : (admin.role === 'ADMIN' ? '#0d47a1' : '#bf360c')
                                    }}>
                                        {admin.role}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: admin.status === 'ACTIVE' ? 'green' : 'red', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        {admin.status}
                                    </span>
                                </div>
                                <div style={{ textAlign: "center", display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                    {isMaster() && (
                                        <>
                                            <button
                                                onClick={() => openResetModal(admin._id, admin.name)}
                                                style={{
                                                    background: "#e3f2fd", color: "#1565c0", border: "1px solid #90caf9",
                                                    padding: "6px 12px", borderRadius: "6px", cursor: "pointer",
                                                    display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 'bold'
                                                }}
                                            >
                                                <Key size={14} /> Reset Pass
                                            </button>

                                            {/* Activate/Deactivate Button */}
                                            {admin.role !== 'MASTER_ADMIN' && (
                                                <button
                                                    onClick={() => toggleStatus(admin._id)}
                                                    style={{
                                                        background: admin.status === 'ACTIVE' ? '#ffebee' : '#e8f5e9',
                                                        color: admin.status === 'ACTIVE' ? '#c62828' : '#2e7d32',
                                                        border: `1px solid ${admin.status === 'ACTIVE' ? '#ef9a9a' : '#a5d6a7'}`,
                                                        padding: "6px 12px", borderRadius: "6px", cursor: "pointer",
                                                        display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 'bold'
                                                    }}
                                                >
                                                    <Power size={14} /> {admin.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                </button>
                                            )}

                                            {admin.role !== 'MASTER_ADMIN' && (
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                                                    style={{
                                                        background: "#ffebee", color: "#c62828", border: "1px solid #ef9a9a",
                                                        padding: "6px 12px", borderRadius: "6px", cursor: "pointer",
                                                        display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 'bold'
                                                    }}
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}