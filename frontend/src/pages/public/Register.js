import React from "react";
import PlayerFormFlow from "../../components/PlayerFormFlow";

export default function Register() {
    // Determine how to handle logs. For public facing, maybe just console.
    const addLog = (title, data) => console.log(`[${title}]`, data);

    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 20px" }}>
            <div style={{ maxWidth: "600px", width: "100%" }}>
                <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#1e3c72" }}>Player Registration</h2>
                <PlayerFormFlow addLog={addLog} setGlobalToken={() => { }} />
            </div>
        </div>
    );
}
