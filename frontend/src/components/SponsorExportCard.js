import React from "react";

const SponsorExportCard = ({ sponsor, auctionName, refProp }) => {
    return (
        <div ref={refProp} style={{
            width: "800px",
            minHeight: "800px", /* Square/Portrait-ish */
            background: "#0f1f2e", /* Dark Teal/Navy */
            padding: "40px",
            fontFamily: "'Inter', sans-serif",
            color: "white",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: "radial-gradient(circle at center, #1e3a52 0%, #0f1f2e 100%)",
            border: "2px solid #334155"
        }}>

            {/* Watermark */}
            <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%) rotate(-30deg)",
                opacity: 0.08, zIndex: 0, pointerEvents: "none"
            }}>
                <img src="/probid_logo.png" alt="" style={{ width: "600px" }} />
            </div>

            {/* Top Section */}
            <div style={{ zIndex: 1, textAlign: "center", marginBottom: "40px" }}>
                <h3 style={{
                    fontSize: "1.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "4px",
                    color: "#94a3b8",
                    margin: "0 0 10px 0"
                }}>
                    Official Sponsor Of
                </h3>
                <h1 style={{
                    fontSize: "3rem",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    color: "white",
                    margin: 0,
                    textShadow: "0 4px 10px rgba(0,0,0,0.5)"
                }}>
                    {auctionName}
                </h1>
            </div>

            {/* Main Sponsor Logo */}
            <div style={{
                zIndex: 1,
                width: "400px",
                height: "400px",
                background: "white",
                borderRadius: "30px",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "40px",
                boxShadow: "0 0 50px rgba(74, 222, 128, 0.2)"
            }}>
                {sponsor.logoUrl ? (
                    <img src={sponsor.logoUrl} alt={sponsor.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                    <div style={{ fontSize: "5rem", color: "#333" }}>🤝</div>
                )}
            </div>

            {/* Sponsor Name & Details */}
            <div style={{ zIndex: 1, textAlign: "center" }}>
                <h2 style={{ fontSize: "2.5rem", color: "#4ade80", margin: "0 0 10px 0", textTransform: "uppercase" }}>{sponsor.name}</h2>
                <div style={{ display: "flex", gap: "20px", justifyContent: "center", color: "#cbd5e1", fontSize: "1.1rem" }}>
                    {sponsor.website && <span>{sponsor.website.replace(/^https?:\/\//, '')}</span>}
                    {sponsor.address && <span>• {sponsor.address}</span>}
                </div>
            </div>

            {/* Footer Branding */}
            <div style={{ position: "absolute", bottom: "30px", display: "flex", alignItems: "center", gap: "10px", opacity: 0.6 }}>
                <img src="/probid_logo.png" alt="ProbId" style={{ width: "30px" }} />
                <span style={{ fontSize: "0.9rem", letterSpacing: "1px" }}>POWERED BY <strong>PROBID AUCTION</strong></span>
            </div>

        </div>
    );
};

export default SponsorExportCard;
