import React, { useState } from "react";
import API from "../api";

export default function PlayerRequestTest({ addLog }) {
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [reqId, setReqId] = useState(""); // ID to approve

    const sendOtp = async () => {
        try {
            const res = await API.post("/player-request/send-otp", { mobile });
            addLog("SEND OTP SUCCESS", res.data);
        } catch (err) {
            addLog("SEND OTP ERROR", err.response?.data);
        }
    };

    const verify = async () => {
        try {
            const res = await API.post("/player-request/verify", { mobile, otp });
            addLog("VERIFY SUCCESS", res.data);
        } catch (err) {
            addLog("VERIFY ERROR", err.response?.data);
        }
    };

    const approve = async () => {
        try {
            const res = await API.put(`/player-request/${reqId}/approve`);
            addLog("APPROVE SUCCESS", res.data);
        } catch (err) {
            addLog("APPROVE ERROR", err.response?.data);
        }
    };

    return (
        <div style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
            <h3>📩 Player Requests (Public/Admin)</h3>
            <div style={{ marginBottom: "5px" }}>
                <input placeholder="Mobile" value={mobile} onChange={e => setMobile(e.target.value)} />
                <button onClick={sendOtp}>Send OTP</button>
            </div>
            <div style={{ marginBottom: "5px" }}>
                <input placeholder="OTP" value={otp} onChange={e => setOtp(e.target.value)} />
                <button onClick={verify}>Verify & Submit</button>
            </div>
            <div style={{ marginTop: "10px", borderTop: "1px solid #eee", paddingTop: "5px" }}>
                <input placeholder="Request ID (to Approve)" value={reqId} onChange={e => setReqId(e.target.value)} />
                <button onClick={approve}>Approve (Admin)</button>
            </div>
        </div>
    );
}
