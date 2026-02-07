import React from "react";
import { useAuth } from "../../context/AuthContext";
import PlayerTest from "../../components/PlayerTest";
import PlayerRequestTest from "../../components/PlayerRequestTest";

export default function PlayerManagement() {
    const { isMaster } = useAuth();
    const addLog = (msg, data) => console.log(msg, data);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
                <h3 style={{ marginBottom: "20px" }}>Direct Player Management</h3>
                <PlayerTest addLog={addLog} />
            </div>
            {!isMaster() && (
                <div>
                    <h3 style={{ marginBottom: "20px" }}>Request Approvals</h3>
                    <PlayerRequestTest addLog={addLog} />
                </div>
            )}
        </div>
    );
}
