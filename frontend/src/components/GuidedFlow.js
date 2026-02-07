import React, { useState } from "react";
import API, { setToken } from "../api";

export default function GuidedFlow({ setGlobalToken, addLog }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data State
    const [masterCreds, setMasterCreds] = useState({ email: "master@auction.com", password: "admin123" });
    const [adminCreds, setAdminCreds] = useState({ email: "", password: "" });
    const [auctionId, setAuctionId] = useState("");
    const [playerId, setPlayerId] = useState("");
    const [teamId, setTeamId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [skillId, setSkillId] = useState("");

    // Helpers
    const next = () => setStep(s => s + 1);
    const log = (title, data) => addLog(`[STEP ${step}] ${title}`, data);

    // --- ACTIONS ---

    const loginMaster = async () => {
        setLoading(true);
        try {
            const res = await API.post("/auth/login", masterCreds);
            setToken(res.data.token);
            setGlobalToken(res.data.token);
            log("MASTER LOGIN SUCCESS", res.data);
            next();
        } catch (err) {
            log("MASTER LOGIN ERROR", err.response?.data);
            alert("Master Login Failed");
        }
        setLoading(false);
    };

    const createAdmin = async () => {
        setLoading(true);
        try {
            const res = await API.post("/admin", { name: `Auto Admin ${Date.now()}` });
            if (res.data.credentials) {
                setAdminCreds(res.data.credentials);
                log("ADMIN CREATED", res.data);
                next();
            } else {
                throw new Error("No credentials returned");
            }
        } catch (err) {
            log("CREATE ADMIN ERROR", err.response?.data);
        }
        setLoading(false);
    };

    const loginAdmin = async () => {
        setLoading(true);
        try {
            const res = await API.post("/auth/login", adminCreds);
            setToken(res.data.token);
            setGlobalToken(res.data.token);
            log("ADMIN LOGIN SUCCESS (Switched Roles)", res.data);
            next();
        } catch (err) {
            log("ADMIN LOGIN ERROR", err.response?.data);
        }
        setLoading(false);
    };

    const createAuction = async () => {
        setLoading(true);
        try {
            const res = await API.post("/auction", {
                name: `Auto Auction ${Date.now()}`,
                pointsPerTeam: 10000,
                maxPlayersPerTeam: 15,
                minPlayersPerTeam: 11,
                incrementSteps: [100, 200],
                auctionDate: "2026-06-01",
                totalTeams: 4,
                auctionType: "WITHOUT_STATS"
            });
            setAuctionId(res.data.auction?._id || res.data._id);
            log("AUCTION CREATED", res.data);
            next();
        } catch (err) {
            log("AUCTION CREATE ERROR", err.response?.data);
        }
        setLoading(false);
    };

    const setupMetadata = async () => {
        setLoading(true);
        try {
            // Post distinct calls to capture separate IDs
            const catRes = await API.post("/category", { name: `Batsman ${Date.now()}` }); // Unique name to ensure creation
            const skillRes = await API.post("/skill", { name: `Batting ${Date.now()}` });

            // Category returns { message, category: {...} }
            setCategoryId(catRes.data.category?._id || catRes.data._id);
            setCategoryName(catRes.data.category?.name || catRes.data.name);
            // Skill returns { ... } direct object
            setSkillId(skillRes.data._id || skillRes.data.skill?._id);

            log("METADATA ADDED", {
                catId: catRes.data.category?._id || catRes.data._id,
                skillId: skillRes.data._id || skillRes.data.skill?._id
            });
            next();
        } catch (err) {
            log("METADATA ERROR", err.response?.data);
            next();
        }
        setLoading(false);
    };

    const addTeam = async () => {
        setLoading(true);
        try {
            const res = await API.post("/team", {
                name: "Auto Team A",
                ownerName: "Auto Owner",
                ownerEmail: `owner${Date.now()}@test.com`,
                ownerMobile: "1234567890",
                totalPoints: 10000,
                shortcutKey: "A1",
                auctionId
            });
            setTeamId(res.data.team?._id || res.data._id);
            log("TEAM CREATED", res.data);
            next();
        } catch (err) {
            log("TEAM ERROR", err.response?.data);
        }
        setLoading(false);
    };

    const addPlayer = async () => {
        setLoading(true);
        try {
            const res = await API.post("/player", {
                name: "Auto Player 1",
                basePrice: 500,
                auctionId,
                skillIds: [skillId].filter(Boolean),
                category: categoryName || "Batsman" // Send Name, fallback matches default creation
            });
            setPlayerId(res.data.playerId || res.data._id || (res.data.player && res.data.player._id) || (res.data.players && res.data.players[0]?._id));

            // NEW: Add to Auction explicitly
            const pId = res.data.playerId || res.data._id || (res.data.player && res.data.player._id);
            if (pId) {
                await API.post("/player/add-to-auction", { playerId: pId, auctionId });
                log("PLAYER ADDED TO AUCTION", { playerId: pId, auctionId });
            }

            log("PLAYER CREATED & LINKED", res.data);
            next();
        } catch (err) {
            log("PLAYER ERROR", err.response?.data);
            // Just force next step if fail to keep flow moving
            next();
        }
        setLoading(false);
    };

    const runSim = async (action) => {
        try {
            let res;
            if (action === "start") res = await API.put(`/auction/${auctionId}/start`);
            if (action === "select") res = await API.put(`/auction/${auctionId}/select-player`, { playerId });
            if (action === "sell") res = await API.put(`/auction/player/${playerId}/sold`, { teamId, soldPrice: 600 });

            log(`SIM: ${action.toUpperCase()} SUCCESS`, res.data);
        } catch (err) {
            log(`SIM: ${action.toUpperCase()} ERROR`, err.response?.data);
        }
    };

    return (
        <div className="card" style={{ border: "2px solid #007bff" }}>
            <h2 style={{ marginTop: 0, color: "#007bff" }}>🚀 Guided Test Flow</h2>
            <p>Follow these steps to avoid permission errors.</p>

            {step === 1 && (
                <div>
                    <h4>Step 1: Login as Master Admin</h4>
                    <p>Only Master Admin can create other Admins.</p>
                    <input className="input-field" value={masterCreds.email} onChange={e => setMasterCreds({ ...masterCreds, email: e.target.value })} />
                    <input className="input-field" type="password" value={masterCreds.password} onChange={e => setMasterCreds({ ...masterCreds, password: e.target.value })} style={{ marginTop: "5px" }} />
                    <button className="btn-primary" style={{ marginTop: "10px" }} onClick={loginMaster} disabled={loading}>Login Master</button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h4>Step 2: Create a New Admin</h4>
                    <p>We need a dedicated Admin account for managing auctions.</p>
                    <button className="btn-primary" onClick={createAdmin} disabled={loading}>Create New Admin</button>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h4>Step 3: Switch to New Admin</h4>
                    <p><b>Created:</b> {adminCreds.email}</p>
                    <p>Now logging in as this new Admin to get the correct token...</p>
                    <button className="btn-success" onClick={loginAdmin} disabled={loading}>Login as New Admin</button>
                </div>
            )}

            {step === 4 && (
                <div>
                    <h4>Step 4: Create Auction</h4>
                    <p>Now that we are Admin, we can create an auction.</p>
                    <button className="btn-primary" onClick={createAuction} disabled={loading}>Create Auto Auction</button>
                </div>
            )}

            {step === 5 && (
                <div>
                    <h4>Step 5: Setup Categories & Skills</h4>
                    <button className="btn-primary" onClick={setupMetadata} disabled={loading}>Add Defaults</button>
                </div>
            )}

            {step === 6 && (
                <div>
                    <h4>Step 6: Add a Team</h4>
                    <button className="btn-primary" onClick={addTeam} disabled={loading}>Create Team 'Auto A'</button>
                </div>
            )}

            {step === 7 && (
                <div>
                    <h4>Step 7: Add a Player</h4>
                    <button className="btn-primary" onClick={addPlayer} disabled={loading}>Add 'Auto Player 1'</button>
                </div>
            )}

            {step === 8 && (
                <div>
                    <h4>Step 8: Simulation (Live Auction)</h4>
                    <p>Auction ID: {auctionId}</p>
                    <p>Player ID: {playerId} | Team ID: {teamId}</p>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button className="btn-success" onClick={() => runSim("start")}>1. Start Auction</button>
                        <button className="btn-warning" onClick={() => runSim("select")}>2. Select Player</button>
                        <button className="btn-danger" onClick={() => runSim("sell")}>3. Sell to Team A</button>
                    </div>
                </div>
            )}

            <div style={{ marginTop: "20px", fontSize: "0.8em", color: "#888" }}>
                Current Step: {step} / 8
                {step > 1 && <button onClick={() => setStep(1)} style={{ marginLeft: "10px" }}>Restart</button>}
            </div>
        </div>
    );
}
