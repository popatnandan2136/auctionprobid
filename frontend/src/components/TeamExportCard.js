import React, { } from "react";

const TeamExportCard = ({ team, players, auctionName, refProp }) => {
    return (
        <div ref={refProp} style={{
            width: "1200px",
            minHeight: "1300px", /* Portrait ratio */
            background: "#0f1f2e", /* Dark Teal/Navy */
            padding: "40px",
            fontFamily: "'Inter', sans-serif",
            color: "white",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            backgroundImage: "radial-gradient(circle at center, #1e3a52 0%, #0f1f2e 100%)"
        }}>

            {/* Watermark */}
            <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%) rotate(-30deg)",
                opacity: 0.08, zIndex: 0, pointerEvents: "none"
            }}>
                <img src="/probid_logo.png" alt="" style={{ width: "800px" }} />
            </div>

            {/* Header - Mimicking reference (Logos on sides, Text center) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px", position: "relative", zIndex: 1, borderBottom: "2px solid rgba(255,255,255,0.1)", paddingBottom: "20px" }}>
                {/* Left: Standard ProBid/Auction Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ width: "80px", height: "80px", background: "white", borderRadius: "15px", padding: "5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src="/probid_logo.png" alt="ProBid" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                </div>

                {/* Center: Title */}
                <div style={{ textAlign: "center" }}>
                    <h2 style={{ fontSize: "1.2rem", letterSpacing: "3px", color: "#4ade80", textTransform: "uppercase", margin: 0, fontWeight: "bold" }}>PROBID AUCTIONS</h2>
                    <h1 style={{ fontSize: "3.5rem", fontWeight: "900", margin: "5px 0", textTransform: "uppercase", color: "white", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                        {team.name}
                    </h1>
                    <div style={{ fontSize: "1.5rem", color: "#cbd5e1" }}>OFFICIAL SQUAD</div>
                </div>

                {/* Right: Team Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ width: "100px", height: "100px", background: "white", borderRadius: "15px", padding: "5px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(74, 222, 128, 0.5)" }}>
                        {team.logoUrl ? (
                            <img src={team.logoUrl} alt={team.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        ) : (
                            <div style={{ fontSize: "3rem", color: "#333" }}>🛡️</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Players Grid - 4 Columns like reference */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "25px", flex: 1, position: "relative", zIndex: 1, alignContent: "start" }}>
                {players.map(p => (
                    <div key={p._id} style={{
                        background: "transparent",
                        borderRadius: "0",
                        overflow: "hidden",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}>
                        {/* Photo Frame */}
                        <div style={{
                            width: "100%",
                            aspectRatio: "1/1.1",
                            background: "#ccc", /* Fallback */
                            backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : "none",
                            backgroundSize: "cover",
                            backgroundPosition: "top center",
                            borderRadius: "10px",
                            marginBottom: "-15px", /* Overlap name bar slightly */
                            zIndex: 1,
                            border: "2px solid rgba(255,255,255,0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            {!p.imageUrl && <span style={{ fontSize: "4rem" }}>👤</span>}
                        </div>

                        {/* Name Bar */}
                        <div style={{
                            width: "100%",
                            background: "#1e293b",
                            color: "white",
                            textAlign: "center",
                            padding: "20px 10px 10px", /* Top padding for overlap */
                            zIndex: 0,
                            borderRadius: "0 0 10px 10px",
                            borderTop: "none"
                        }}>
                            <div style={{ fontWeight: "700", fontSize: "1.1rem", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                            <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "2px" }}>{p.role} • ₹{p.soldPrice?.toLocaleString()}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{ marginTop: "40px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px", display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "0.9rem", position: "relative", zIndex: 1 }}>
                <span>Owner: {team.ownerName}</span>
                <span>ProBid Auction Platform</span>
            </div>

        </div>
    );
};

export default TeamExportCard;
