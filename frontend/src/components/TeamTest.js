import React, { useState, useEffect } from "react";
import API from "../api";

export default function TeamTest({ addLog }) {
  const [auctionId, setAuctionId] = useState("");
  const [teamId, setTeamId] = useState("");

  // Create Team Data
  const [teamData, setTeamData] = useState({
    name: "Testers XI",
    ownerName: "Test Owner",
    ownerEmail: "owner@test.com",
    ownerMobile: "1234567890",
    totalPoints: 10000,
    shortcutKey: "T1"
  });

  const [teams, setTeams] = useState([]);

  // Auto-fetch teams when auction ID changes (with debounce/check)
  useEffect(() => {
    if (auctionId && auctionId.length > 10) {
      getTeams();
    }
  }, [auctionId]);

  const createTeam = async () => {
    try {
      const res = await API.post("/team", { ...teamData, auctionId });
      setTeamId(res.data.team._id);
      addLog("CREATE TEAM SUCCESS", res.data);
      getTeams();
    } catch (err) {
      addLog("CREATE TEAM ERROR", err.response?.data);
    }
  };

  const getTeams = async () => {
    if (!auctionId) return;
    try {
      const res = await API.get(`/team/auction/${auctionId}`);
      setTeams(res.data);
      addLog("GET TEAMS", res.data);
    } catch (err) {
      // Quiet fail on auto-fetch
      console.error("GET TEAMS ERROR", err.response?.data);
    }
  };

  const deleteTeam = async (id) => {
    try {
      const res = await API.delete(`/team/${id}`);
      addLog("DELETE TEAM SUCCESS", res.data);
      getTeams();
    } catch (err) {
      addLog("DELETE TEAM ERROR", err.response?.data);
    }
  }

  return (
    <div className="card">
      <h3>🛡️ Team Management</h3>
      <div style={{ marginBottom: "10px" }}>
        <label>Target Auction ID:</label>
        <input className="input-field" placeholder="Paste Auction ID" value={auctionId} onChange={e => setAuctionId(e.target.value)} style={{ width: "100%" }} />
      </div>

      <h5 style={{ marginTop: "5px", marginBottom: "5px" }}>New Team Details</h5>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
        <input className="input-field" placeholder="Name" value={teamData.name} onChange={e => setTeamData({ ...teamData, name: e.target.value })} />
        <input className="input-field" placeholder="Owner Name" value={teamData.ownerName} onChange={e => setTeamData({ ...teamData, ownerName: e.target.value })} />
        <input className="input-field" placeholder="Email" value={teamData.ownerEmail} onChange={e => setTeamData({ ...teamData, ownerEmail: e.target.value })} />
        <input className="input-field" placeholder="Mobile" value={teamData.ownerMobile} onChange={e => setTeamData({ ...teamData, ownerMobile: e.target.value })} />
        <input className="input-field" placeholder="Points" value={teamData.totalPoints} onChange={e => setTeamData({ ...teamData, totalPoints: e.target.value })} />
        <input className="input-field" placeholder="Shortcut (T1)" value={teamData.shortcutKey} onChange={e => setTeamData({ ...teamData, shortcutKey: e.target.value })} />
      </div>
      <button className="btn-primary" onClick={createTeam}>Create Team</button>

      <div style={{ marginTop: "15px" }}>
        <h5>Teams in Auction:</h5>
        <ul className="list-group">
          {teams.map(t => (
            <li key={t._id} className="list-item">
              <span><b>{t.name}</b> <small>({t._id})</small> <br /> Pts: {t.totalPoints}</span>
              <button className="btn-danger btn-sm" onClick={() => deleteTeam(t._id)}>Del</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
