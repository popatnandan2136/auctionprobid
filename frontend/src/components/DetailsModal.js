import React from 'react';
import { X, User, Shield, Phone, Mail, Globe, MapPin } from 'lucide-react';

const DetailsModal = ({ isOpen, onClose, type, data }) => {
    if (!isOpen || !data) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div style={{
                background: 'white', borderRadius: '15px',
                width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto',
                position: 'relative',
                animation: 'slideUp 0.3s ease-out',
                display: 'flex', flexDirection: 'column'
            }} onClick={e => e.stopPropagation()}>

                {/* Header Image */}
                <div style={{ height: '120px', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', position: 'relative' }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '15px', right: '15px',
                            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                            width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'white'
                        }}
                    >
                        <X size={18} />
                    </button>

                    <div style={{
                        position: 'absolute', bottom: '-40px', left: '30px',
                        width: '100px', height: '100px', background: 'white', borderRadius: '50%',
                        padding: '5px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}>
                        {data.logoUrl || data.image ?
                            <img src={type === 'TEAM' ? data.logoUrl : (data.image || "https://via.placeholder.com/150")} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            :
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {type === 'TEAM' ? <Shield size={40} color="#ccc" /> : <User size={40} color="#ccc" />}
                            </div>
                        }
                    </div>
                </div>

                <div style={{ padding: '50px 30px 30px 30px' }}>
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '1.8rem', color: '#333' }}>{data.name}</h2>
                    <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                        {type === 'TEAM' ? 'Team Profile' : `${data.category || 'Category'} • ${data.role || 'Role'}`}
                    </p>

                    <div style={{ display: 'grid', gap: '15px', background: '#f9f9f9', padding: '20px', borderRadius: '10px' }}>
                        {type === 'TEAM' ? (
                            <>
                                <InfoRow icon={<User size={18} />} label="Owner" value={data.ownerName} />
                                <InfoRow icon={<Phone size={18} />} label="Mobile" value={data.ownerMobile} />
                                <InfoRow icon={<Mail size={18} />} label="Email" value={data.ownerEmail} />
                            </>
                        ) : (
                            <>
                                <InfoRow icon={<Shield size={18} />} label="Team" value={data.teamName || "Unsold / Not Assigned"} highlight={!!data.teamName} />
                                <InfoRow icon={<User size={18} />} label="Status" value={data.status} status={data.status} />
                                <InfoRow icon={<Phone size={18} />} label="Mobile" value={data.mobile} />
                                {data.soldPrice && <InfoRow icon={<span style={{ fontSize: '1.2rem' }}>₹</span>} label="Sold Price" value={data.soldPrice} highlight />}
                            </>
                        )}
                        {/* Generic fields usually present */}
                        {data.website && <InfoRow icon={<Globe size={18} />} label="Website" value={data.website} isLink />}
                        {data.address && <InfoRow icon={<MapPin size={18} />} label="Address" value={data.address} />}
                    </div>

                    {type === 'PLAYER' && data.stats && (
                        <div style={{ marginTop: '20px' }}>
                            <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Player Stats</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '10px' }}>
                                {Object.entries(data.stats).map(([key, val]) => (
                                    <div key={key} style={{ background: '#f5f7fa', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>{key}</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e3c72' }}>{val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

const InfoRow = ({ icon, label, value, highlight, status, isLink }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ color: '#888', width: '20px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '2px' }}>{label}</div>
            <div style={{
                fontSize: '1rem',
                color: highlight ? '#2e7d32' : (status === 'SOLD' ? '#d32f2f' : '#333'),
                fontWeight: (highlight || status) ? 'bold' : 'normal'
            }}>
                {isLink ? <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>{value}</a> : (value || "N/A")}
            </div>
        </div>
    </div>
);

export default DetailsModal;
