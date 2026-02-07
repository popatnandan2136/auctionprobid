import React, { useState, useEffect } from "react";
import API from "../api";

export default function AuctionTest({ addLog }) {
  // Create Auction State
  const [createData, setCreateData] = useState({
    name: "Test Auction",
    pointsPerTeam: 10000,
    maxPlayersPerTeam: 15,
    minPlayersPerTeam: 11,
    incrementSteps: "100,200,500",
    auctionDate: "2026-06-01",
    totalTeams: 4,
    auctionType: "WITHOUT_STATS"
  });

  // Management State
  const [auctionId, setAuctionId] = useState("");
  const [auctions, setAuctions] = useState([]);

  // Live Ops State
  const [playerId, setPlayerId] = useState("");
  const [teamId, setTeamId] = useState(""); // For selling
  const [soldPrice, setSoldPrice] = useState(0);

  useEffect(() => {
    getAllAuctions();
  }, []);

  const getAllAuctions = async () => {
    try {
      const res = await API.get("/auction");
      setAuctions(res.data);
      addLog("GET ALL AUCTIONS", res.data);
    } catch (err) {
      addLog("GET AUCTIONS ERROR", err.response?.data);
    }
  };

  const createAuction = async () => {
    try {
      const payload = {
        ...createData,
        incrementSteps: createData.incrementSteps.split(",").map(Number)
      };
      const res = await API.post("/auction", payload);
      setAuctionId(res.data._id);
      addLog("CREATE AUCTION SUCCESS", res.data);
      getAllAuctions();
    } catch (err) {
      addLog("CREATE AUCTION ERROR", err.response?.data);
    }
  };

  const auctionAction = async (action) => {
    if (!auctionId) return alert("Auction ID needed");
    try {
      const res = await API.put(`/auction/${auctionId}/${action}`);
      addLog(`ACTION ${action} SUCCESS`, res.data);
      getAllAuctions(); // Refresh status
    } catch (err) {
      addLog(`ACTION ${action} ERROR`, err.response?.data);
    }
  };

  // Live Flow
  const selectPlayer = async () => API.put(`/auction/${auctionId}/select-player`, { playerId }).then(res => addLog("SELECT PLAYER", res.data)).catch(err => addLog("SELECT ERROR", err.response?.data));

  const sellPlayer = async () => API.put(`/auction/player/${playerId}/sold`, { teamId, amount: Number(soldPrice) }).then(res => addLog("SOLD PLAYER", res.data)).catch(err => addLog("SOLD ERROR", err.response?.data));

  const unsoldPlayer = async () => API.put(`/auction/player/${playerId}/unsold`).then(res => addLog("UNSOLD PLAYER", res.data)).catch(err => addLog("UNSOLD ERROR", err.response?.data));

  return (
    <div className="card">
      <h3>🔨 Auction Management</h3>

      <div style={{ marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
        <h4 style={{ marginBottom: "10px" }}>Create New Auction</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
          <input className="input-field" value={createData.name} onChange={e => setCreateData({ ...createData, name: e.target.value })} placeholder="Name" />
          <input className="input-field" value={createData.pointsPerTeam} onChange={e => setCreateData({ ...createData, pointsPerTeam: e.target.value })} placeholder="Points" />
          <input className="input-field" value={createData.maxPlayersPerTeam} onChange={e => setCreateData({ ...createData, maxPlayersPerTeam: e.target.value })} placeholder="Max Players" />
          <input className="input-field" value={createData.minPlayersPerTeam} onChange={e => setCreateData({ ...createData, minPlayersPerTeam: e.target.value })} placeholder="Min Players" />
          <input className="input-field" value={createData.auctionDate} onChange={e => setCreateData({ ...createData, auctionDate: e.target.value })} placeholder="Date" />
          <input className="input-field" value={createData.totalTeams} onChange={e => setCreateData({ ...createData, totalTeams: e.target.value })} placeholder="Total Teams" />
          <input className="input-field" value={createData.incrementSteps} onChange={e => setCreateData({ ...createData, incrementSteps: e.target.value })} placeholder="Increments (100,200)" />
          <select className="input-field" value={createData.auctionType} onChange={e => setCreateData({ ...createData, auctionType: e.target.value })}>
            <option value="WITHOUT_STATS">Without Stats</option>
            <option value="WITH_STATS">With Stats</option>
          </select>
        </div>

        {/* 🔥 Stats Selection */}
        {createData.auctionType === "WITH_STATS" && (
          <div style={{ marginTop: "10px", padding: "10px", background: "#f0f8ff", borderRadius: "5px" }}>
            <h5>Select Enabled Stats:</h5>
            <StatSelector
              onSelectionChange={(selected) => setCreateData({ ...createData, enabledStats: selected })}
            />
          </div>
        )}

        <button className="btn-primary" style={{ marginTop: "10px" }} onClick={createAuction}>Create Auction</button>
      </div>

      <div style={{ marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
        <h4 style={{ marginBottom: "10px" }}>Control Actions</h4>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
          <span>Selected Auction ID:</span>
          <input className="input-field" placeholder="Paste Auction ID" value={auctionId} onChange={e => setAuctionId(e.target.value)} style={{ width: "250px" }} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-secondary" onClick={() => auctionAction("start")}>▶ Start</button>
          <button className="btn-secondary" onClick={() => auctionAction("resume")}>⏯ Resume</button>
          <button className="btn-danger" onClick={() => auctionAction("finish")}>⏹ Finish</button>
        </div>
      </div>

      <div style={{ marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
        <h4 style={{ marginBottom: "10px" }}>🔗 Registration Links</h4>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="btn-secondary" onClick={() => auctionAction("toggle-registration")}>Toggle Registration Open/Closed</button>
          <button className="btn-primary" onClick={() => {
            const url = `${window.location.origin}?mode=FORM&auctionId=${auctionId}`;
            navigator.clipboard.writeText(url);
            alert("Link Copied: " + url);
          }}>Copy Public Reg Link</button>
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: "10px" }}>Live Operations</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ background: "#f9f9f9", padding: "10px", borderRadius: "5px" }}>
            <h5>Step 1: Select Player</h5>
            <div style={{ display: "flex", gap: "5px", marginBottom: "5px" }}>
              <input className="input-field" placeholder="Player ID" value={playerId} onChange={e => setPlayerId(e.target.value)} />
              <button className="btn-primary" onClick={selectPlayer}>Select</button>
            </div>
            <button className="btn-warning" onClick={unsoldPlayer}>Mark Unsold</button>
          </div>
          <div style={{ background: "#f9f9f9", padding: "10px", borderRadius: "5px" }}>
            <h5>Step 2: Sell Player</h5>
            <div style={{ display: "flex", gap: "5px", flexDirection: "column" }}>
              <input className="input-field" placeholder="Team ID" value={teamId} onChange={e => setTeamId(e.target.value)} />
              <input className="input-field" placeholder="Sold Price" value={soldPrice} onChange={e => setSoldPrice(e.target.value)} />
              <button className="btn-success" onClick={sellPlayer}>Confirm Sell</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "15px" }}>
        <h4>Available Auctions</h4>
        <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #eee" }}>
          {auctions.map(a => (
            <div key={a._id} style={{ padding: "5px", borderBottom: "1px solid #f0f0f0", fontSize: "0.9em", cursor: "pointer" }} onClick={() => setAuctionId(a._id)}>
              <strong>{a.name}</strong> <span style={{ color: "#888" }}>({a._id})</span> - <span className={`status-${a.status}`}>{a.status}</span>
              <span style={{ marginLeft: "10px", fontSize: "0.8em", background: a.isRegistrationOpen ? "#d4edda" : "#f8d7da", padding: "2px 5px", borderRadius: "3px" }}>
                {a.isRegistrationOpen ? "REG OPEN" : "REG CLOSED"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <StatAttributeManager addLog={addLog} />
    </div>
  );
}

// Sub-component for managing Stats
function StatAttributeManager({ addLog }) {
  const [stats, setStats] = useState([]);
  const [newStat, setNewStat] = useState({ label: "", key: "", dataType: "Number" });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/stat-attribute");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addStat = async () => {
    try {
      const res = await API.post("/stat-attribute", newStat);
      addLog("STAT ADD SUCCESS", res.data);
      fetchStats();
      setNewStat({ label: "", key: "", dataType: "Number" });
    } catch (err) {
      addLog("STAT ADD ERROR", err.response?.data);
    }
  };

  return (
    <div style={{ marginTop: "20px", borderTop: "2px solid #ccc", paddingTop: "10px" }}>
      <h4>📊 Stat Attribute Manager</h4>
      <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
        <input className="input-field" placeholder="Label (e.g. Runs)" value={newStat.label} onChange={e => setNewStat({ ...newStat, label: e.target.value })} />
        <input className="input-field" placeholder="Key (e.g. runs)" value={newStat.key} onChange={e => setNewStat({ ...newStat, key: e.target.value })} />
        <select className="input-field" value={newStat.dataType} onChange={e => setNewStat({ ...newStat, dataType: e.target.value })}>
          <option value="Number">Number</option>
          <option value="String">String</option>
        </select>
        <button className="btn-primary" onClick={addStat}>Add Stat</button>
      </div>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {stats.map(s => (
          <span key={s._id} style={{ background: "#e1f5fe", padding: "3px 8px", borderRadius: "15px", fontSize: "0.85em" }}>
            {s.label} <small>({s.key})</small>
          </span>
        ))}
      </div>
      <p style={{ fontSize: "0.8em", color: "#666" }}>*Create Stats here first, then they will appear in "Create Auction" when "With Stats" is selected.</p>
    </div>
  );
}

// Helper to fetch and select stats
function StatSelector({ onSelectionChange }) {
  const [stats, setStats] = useState([]);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    API.get("/stat-attribute").then(res => setStats(res.data)).catch(console.error);
  }, []);

  const toggle = (stat) => {
    const newSel = { ...selected };
    if (newSel[stat.key]) delete newSel[stat.key];
    else newSel[stat.key] = { key: stat.key, label: stat.label, dataType: stat.dataType, required: false };

    setSelected(newSel);
    onSelectionChange(Object.values(newSel));
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
      {stats.length === 0 && <span style={{ color: "gray" }}>No stats defined. Add them below first.</span>}
      {stats.map(s => (
        <label key={s._id} style={{ display: "flex", alignItems: "center", gap: "5px", background: "white", padding: "2px 5px", borderRadius: "3px", border: "1px solid #ddd" }}>
          <input type="checkbox" checked={!!selected[s.key]} onChange={() => toggle(s)} />
          {s.label}
        </label>
      ))}
    </div>
  );
}
