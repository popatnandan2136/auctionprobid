import React, { useState } from "react";
import API from "../api";

export default function PlayerTest({ addLog }) {
  const [auctionId, setAuctionId] = useState("");

  // Player Form
  const [playerData, setPlayerData] = useState({
    name: "New Player",
    categoryId: "",
    skillIds: "", // comma separated
    basePrice: 500,
    mobile: "",
    stats: {}
  });

  // Search
  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState([]);

  const addPlayer = async () => {
    try {
      const payload = {
        ...playerData,
        auctionId,
        skillIds: playerData.skillIds.split(",").map(s => s.trim()).filter(Boolean)
      };
      const res = await API.post("/player", payload);
      addLog("ADD PLAYER SUCCESS", res.data);
    } catch (err) {
      addLog("ADD PLAYER ERROR", err.response?.data);
    }
  };

  const search = async () => {
    try {
      const res = await API.get(`/player/search?q=${searchQ}`);
      setResults(res.data);
      addLog("SEARCH RESULTS", res.data);
    } catch (err) {
      addLog("SEARCH ERROR", err.response?.data);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
      <h3>🏃 Player Management</h3>
      <div style={{ marginBottom: "10px" }}>
        <input placeholder="Auction ID" value={auctionId} onChange={e => setAuctionId(e.target.value)} style={{ width: "250px" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", marginBottom: "10px" }}>
        <input placeholder="Name" value={playerData.name} onChange={e => setPlayerData({ ...playerData, name: e.target.value })} />
        <input placeholder="Category ID" value={playerData.categoryId} onChange={e => setPlayerData({ ...playerData, categoryId: e.target.value })} />
        <input placeholder="Skill IDs (comma sep)" value={playerData.skillIds} onChange={e => setPlayerData({ ...playerData, skillIds: e.target.value })} />
        <input placeholder="Base Price" value={playerData.basePrice} onChange={e => setPlayerData({ ...playerData, basePrice: e.target.value })} />
        <input placeholder="Mobile" value={playerData.mobile || ""} onChange={e => setPlayerData({ ...playerData, mobile: e.target.value })} />
        <input placeholder='Stats JSON {"runs":50}' value={JSON.stringify(playerData.stats || {})} onChange={e => {
          try { setPlayerData({ ...playerData, stats: JSON.parse(e.target.value) }) } catch (err) { }
        }} />
      </div>
      <button onClick={addPlayer}>Add Player</button>

      <div style={{ marginTop: "10px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
        <input placeholder="Search Player Name" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        <button onClick={search}>Search</button>
        <ul>
          {results.map(p => <li key={p._id}>{p.name} ({p._id}) - 📞 {p.mobile || "N/A"}</li>)}
        </ul>
      </div>
    </div>
  );
}
