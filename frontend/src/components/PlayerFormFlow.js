import React, { useState } from "react";
import API from "../api";

import { setToken } from "../api"; // Ensure setToken is imported if not already handled by parent/api.js

export default function PlayerFormFlow({ token, setGlobalToken, addLog }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [name, setName] = useState("Public Player A");
    const [category, setCategory] = useState("");
    const [role, setRole] = useState("Batsman");
    const [basePrice, setBasePrice] = useState("500");
    const [auctionId, setAuctionId] = useState("");
    const [stats, setStats] = useState({}); // 🔥 Stats State

    // Auto-fill from URL
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const aid = params.get("auctionId");
        if (aid) setAuctionId(aid);
    }, []);

    // Approval Data
    const [requestId, setRequestId] = useState("");

    // Quick Admin Login State
    const [adminEmail, setAdminEmail] = useState("master@auction.com");
    const [adminPass, setAdminPass] = useState("admin123");

    const log = (title, data) => addLog(`[FORM-STEP ${step}] ${title}`, data);
    const next = () => setStep(s => s + 1);

    const handleAdminLogin = async () => {
        setLoading(true);
        try {
            const res = await API.post("/auth/login", { email: adminEmail, password: adminPass });
            setToken(res.data.token);
            setGlobalToken(res.data.token);
            log("ADMIN LOGIN SUCCESS", res.data);
        } catch (err) {
            log("LOGIN ERROR", err.response?.data);
        }
        setLoading(false);
    };

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            const res = await API.post("/player-request/send-otp", { mobile });
            log("OTP SENT", res.data);
            next();
        } catch (err) {
            log("OTP ERROR", err.response?.data);
        }
        setLoading(false);
    };

    const handleVerifyAndSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                mobile,
                otp,
                auctionId,
                name,
                categoryId: category, // Input field used as ID
                role,
                basePrice: Number(basePrice),
                stats // 🔥 Include stats
            };
            const res = await API.post("/player-request/verify", payload);
            setRequestId(res.data.requestId);
            log("SUBMIT SUCCESS", res.data);
            next();
        } catch (err) {
            log("SUBMIT ERROR", err.response?.data);
        }
        setLoading(false);
    };

    const handleApprove = async () => {
        setLoading(true);
        try {
            const res = await API.put(`/player-request/${requestId}/approve`);
            log("ADMIN APPROVE SUCCESS", res.data);
            next();
        } catch (err) {
            log("ADMIN APPROVE ERROR", err.response?.data);
        }
        setLoading(false);
    };

    const [availableAuctions, setAvailableAuctions] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);

    const fetchHelpers = async () => {
        try {
            const aRes = await API.get("/auction");
            setAvailableAuctions(aRes.data);
            const cRes = await API.get("/category");
            setAvailableCategories(cRes.data);
        } catch (err) {
            console.error("Helper fetch error", err);
        }
    };

    return (
        <div className="card" style={{ border: "2px solid #28a745" }}>
            <h2 style={{ marginTop: 0, color: "#28a745" }}>📝 Public Player Form Test</h2>
            <p>Simulates the public link flow: OTP {'->'} Form {'->'} Admin Approval</p>

            {step === 1 && (
                <div>
                    <h4>Step 1: Enter Mobile</h4>
                    <input className="input-field" placeholder="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} />
                    <button className="btn-primary" onClick={handleSendOtp} disabled={loading}>Send OTP</button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h4>Step 2: Verify & Submit Details</h4>
                    <p>Enter the OTP and your details.</p>

                    <div style={{ marginBottom: "10px", padding: "10px", background: "#ecf0f1", borderRadius: "5px" }}>
                        <button onClick={fetchHelpers} style={{ fontSize: "0.8em", marginBottom: "5px" }}>🔄 Fetch Helper IDs</button>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            {availableAuctions.length > 0 && (
                                <div>
                                    <small>Auctions:</small><br />
                                    {availableAuctions.map(a => (
                                        <span key={a._id} onClick={() => setAuctionId(a._id)} style={{ cursor: "pointer", background: "#ddd", padding: "2px 5px", margin: "2px", borderRadius: "3px", fontSize: "0.75em" }}>{a.name}</span>
                                    ))}
                                </div>
                            )}
                            {availableCategories.length > 0 && (
                                <div>
                                    <small>Categories:</small><br />
                                    {availableCategories.map(c => (
                                        <span key={c._id} onClick={() => setCategory(c._id)} style={{ cursor: "pointer", background: "#ddd", padding: "2px 5px", margin: "2px", borderRadius: "3px", fontSize: "0.75em" }}>{c.name}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <input className="input-field" placeholder="OTP" value={otp} onChange={e => setOtp(e.target.value)} />
                        <input className="input-field" placeholder="Target Auction ID" value={auctionId} onChange={e => setAuctionId(e.target.value)} />
                        <input className="input-field" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                        <input className="input-field" placeholder="Category ID" value={category} onChange={e => setCategory(e.target.value)} />
                        <input className="input-field" placeholder="Role" value={role} onChange={e => setRole(e.target.value)} />
                        <input className="input-field" placeholder="Base Price" value={basePrice} onChange={e => setBasePrice(e.target.value)} />
                    </div>

                    {/* 🔥 Dynamic Stats Section */}
                    {auctionId && availableAuctions.find(a => a._id === auctionId)?.enabledStats?.length > 0 && (
                        <div style={{ marginTop: "10px", padding: "10px", border: "1px dashed #ccc" }}>
                            <h5>📊 Player Stats</h5>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                {availableAuctions.find(a => a._id === auctionId).enabledStats.map(stat => (
                                    <input
                                        key={stat.key}
                                        className="input-field"
                                        placeholder={stat.label}
                                        value={stats[stat.key] || ""}
                                        onChange={e => setStats({ ...stats, [stat.key]: e.target.value })}
                                    />
                                ))}
                            </div>
                            <p style={{ fontSize: "0.8em", color: "#666" }}>*Stats values are required for this auction.</p>
                        </div>
                    )}
                    <button className="btn-success" style={{ marginTop: "15px" }} onClick={handleVerifyAndSubmit} disabled={loading}>Submit Application</button>
                    <p style={{ fontSize: "0.8em", color: "#666" }}>*Backend must be updated to save these details during verify.</p>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h4>Step 3: Pending Approval</h4>
                    <p>Request ID: <b>{requestId}</b></p>
                    <p>Status: <span style={{ color: "orange" }}>SUBMITTED</span></p>

                    <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #ccc", background: "#f9f9f9" }}>
                        <h5>👮 Admin Action Zone</h5>
                        {!token ? (
                            <div>
                                <p style={{ color: "red", fontSize: "0.9em" }}>⚠️ You must be logged in as Admin to approve requests.</p>
                                <input className="input-field" placeholder="Admin Email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                                <input className="input-field" type="password" placeholder="Password" value={adminPass} onChange={e => setAdminPass(e.target.value)} />
                                <button className="btn-primary" onClick={handleAdminLogin} disabled={loading} style={{ marginTop: "5px" }}>Login to Approve</button>
                            </div>
                        ) : (
                            <div>
                                <p>✅ Authenticated. You can now approve this request.</p>
                                <button className="btn-primary" onClick={handleApprove} disabled={loading}>Approve as Admin</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {step === 4 && (
                <div>
                    <h4>Step 4: Done!</h4>
                    <p style={{ color: "green" }}>Player has been approved and added to the auction.</p>
                    <button onClick={() => setStep(1)}>Start Over</button>
                </div>
            )}

            <div style={{ marginTop: "20px", fontSize: "0.8em", color: "#888" }}>
                Step: {step} / 4
            </div>
        </div>
    );
}
