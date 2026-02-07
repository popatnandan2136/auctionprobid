import React from "react";
import { X, User, Shield, Briefcase, ExternalLink, Calendar, DollarSign, Award } from "lucide-react";

export default function DetailsModal({ isOpen, onClose, data, type, auction }) {
    if (!isOpen || !data) return null;

    const renderHeader = () => {
        let Icon = User;
        let color = "#1e3c72";
        let title = data.name || "Details";

        if (type === "TEAM") {
            Icon = Shield;
            color = "#2e7d32";
        } else if (type === "SPONSOR") {
            Icon = Briefcase;
            color = "#f57c00";
        }

        return (
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px", paddingBottom: "15px", borderBottom: `2px solid ${color}20` }}>
                <div style={{
                    width: "60px", height: "60px", borderRadius: "50%", background: `${color}10`,
                    display: "flex", alignItems: "center", justifyContent: "center", color: color,
                    border: `2px solid ${color}`, overflow: "hidden"
                }}>
                    {data.logoUrl || data.image || data.teamLogo ? (
                        <img src={data.logoUrl || data.image || data.teamLogo} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <Icon size={30} />
                    )}
                </div>
                <div>
                    <h2 style={{ margin: 0, color: "#333" }}>{title}</h2>
                    <span style={{ fontSize: "0.85rem", color: color, fontWeight: "bold", background: `${color}10`, padding: "2px 8px", borderRadius: "4px" }}>
                        {type}
                    </span>
                </div>
            </div >
        );
    };

    const renderContent = () => {
        switch (type) {
            case "PLAYER":
                return (
                    <div style={{ display: "grid", gap: "15px" }}>
                        <DetailRow icon={Award} label="Role" value={data.role} />
                        <DetailRow icon={Award} label="Category" value={data.category} />
                        <DetailRow icon={DollarSign} label="Base Price" value={`₹${data.basePrice?.toLocaleString()}`} />
                        {data.soldPrice > 0 && (
                            <DetailRow icon={DollarSign} label="Sold Price" value={`₹${data.soldPrice?.toLocaleString()}`} highlight />
                        )}
                        <DetailRow icon={Shield} label="Team"
                            value={
                                data.teamName ||
                                (data.status === "IN_AUCTION" ? "Remaining In Auction" :
                                    data.status === "UNSOLD" ? "Unsold" :
                                        data.status === "NOT_IN_AUCTION" ? "Not In Auction" :
                                            (data.teamId ? (data.teamId.name || "Linked Team") : "Unsold"))
                            }
                            highlight={!!data.teamName || (data.teamId && data.status === "SOLD")}
                        />

                        {/* Stats if available */}
                        {(() => {
                            let displayStats = data.stats || {};
                            if (typeof displayStats === 'string') {
                                try { displayStats = JSON.parse(displayStats); } catch (e) { }
                            }
                            const statConfig = auction?.enabledStats || [];
                            const keys = Object.keys(displayStats);

                            if (keys.length > 0) {
                                return (
                                    <div style={{ marginTop: "15px", background: "#f9f9f9", padding: "15px", borderRadius: "8px", border: '1px solid #eee' }}>
                                        <h4 style={{ margin: "0 0 10px 0", color: "#444", textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Player Stats</h4>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
                                            {keys.map(k => {
                                                const label = statConfig.find(s => s.key === k)?.label || k;
                                                const value = displayStats[k];
                                                if (!value) return null; // Skip empty
                                                return (
                                                    <div key={k} style={{ background: 'white', padding: '8px', borderRadius: '6px', border: '1px solid #eee', textAlign: 'center' }}>
                                                        <div style={{ fontSize: "0.75rem", color: "#888", textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                                                        <div style={{ fontWeight: "bold", color: "#333", fontSize: '1rem' }}>{value}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                );
            case "TEAM":
                return (
                    <div style={{ display: "grid", gap: "15px" }}>
                        <DetailRow icon={User} label="Owner" value={data.ownerName} />
                        <DetailRow icon={DollarSign} label="Total Budget" value={`₹${data.totalPoints?.toLocaleString()}`} />
                        <DetailRow icon={DollarSign} label="Spent" value={`₹${(data.spentPoints || 0).toLocaleString()}`} />
                        <DetailRow icon={DollarSign} label="Remaining" value={`₹${(data.totalPoints - (data.spentPoints || 0)).toLocaleString()}`} highlight />
                        <DetailRow icon={User} label="Players Bought" value={data.playersBought} />
                    </div>
                );
            case "SPONSOR":
                return (
                    <div style={{ display: "grid", gap: "15px" }}>
                        <DetailRow icon={Briefcase} label="Company" value={data.name} />
                        {data.website && (
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <ExternalLink size={18} color="#666" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "0.8rem", color: "#888" }}>Website</div>
                                    <a href={data.website} target="_blank" rel="noopener noreferrer" style={{ color: "#1e3c72", fontWeight: "500" }}>
                                        {data.website}
                                    </a>
                                </div>
                            </div>
                        )}
                        {data.address && <DetailRow icon={Briefcase} label="Address" value={data.address} />}
                        {data.mobile && <DetailRow icon={Briefcase} label="Contact" value={data.mobile} />}
                    </div>
                );
            default:
                return <p>No details available.</p>;
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }} onClick={onClose}>
            <div style={{
                background: 'white', borderRadius: '15px', padding: '25px', width: '90%', maxWidth: '400px',
                position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                animation: 'popIn 0.3s ease-out'
            }} onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
                >
                    <X size={20} />
                </button>

                {renderHeader()}
                {renderContent()}

            </div>
            <style>{`
                @keyframes popIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

const DetailRow = ({ icon: Icon, label, value, highlight }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ padding: "8px", background: "#f5f7fa", borderRadius: "8px", color: highlight ? "green" : "#666" }}>
            <Icon size={18} />
        </div>
        <div>
            <div style={{ fontSize: "0.8rem", color: "#888" }}>{label}</div>
            <div style={{ fontSize: "1rem", fontWeight: "600", color: highlight ? "green" : "#333" }}>{value || "N/A"}</div>
        </div>
    </div>
);
