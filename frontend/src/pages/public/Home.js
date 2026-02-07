import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../api";

export default function Home() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/auction")
            .then(res => {
                setAuctions(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch auctions", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="loading-spinner">Loading Auctions...</div>;

    return (
        <div className="container" style={{ padding: "40px 20px" }}>
            <header style={{ textAlign: "center", marginBottom: "50px" }}>
                <h1 style={{ fontSize: "3rem", fontWeight: "700", color: "#1e3c72", marginBottom: "10px" }}>
                    Live Cricket Auctions
                </h1>
                <p style={{ fontSize: "1.2rem", color: "#666" }}>
                    Experience the thrill of the auction room. Follow your favorite teams and players.
                </p>
            </header>

            <div className="auction-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "30px" }}>
                {auctions.map(auction => (
                    <div key={auction._id} className="card auction-card" style={{
                        borderRadius: "15px", overflow: "hidden", border: "none",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.1)", transition: "transform 0.3s ease",
                        background: "white", display: "flex", flexDirection: "column"
                    }}>
                        <div style={{ height: "150px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "4rem" }}>🏏</span>
                        </div>

                        <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                <span className={`status-badge ${auction.status}`}>{auction.status}</span>
                                {auction.isRegistrationOpen && (
                                    <span style={{ fontSize: "0.8em", color: "#28a745", fontWeight: "bold" }}>● Reg Open</span>
                                )}
                            </div>

                            <h3 style={{ margin: "0 0 10px 0", fontSize: "1.4rem" }}>{auction.name}</h3>
                            <p style={{ color: "#777", marginBottom: "20px", fontSize: "0.9rem" }}>
                                Date: {new Date(auction.auctionDate).toLocaleDateString()}<br />
                                Teams: {auction.totalTeams}
                            </p>

                            <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
                                <Link to={`/auction-view/${auction._id}`} className="btn-primary" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>
                                    View Details
                                </Link>
                                {auction.isRegistrationOpen && (
                                    <Link to={`/register?auctionId=${auction._id}`} className="btn-secondary" style={{ flex: 1, textAlign: "center", textDecoration: "none", background: "#28a745", color: "white" }}>
                                        Register
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}