import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api";
import { CheckCircle, XCircle, Hammer, Users as UsersIcon, ArrowLeft } from "lucide-react";

export default function AuctioneerConsole() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [auction, setAuction] = useState(null);
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    const pollRef = useRef(null);

    useEffect(() => {
        init();
        startPolling();
        return () => clearInterval(pollRef.current);
    }, [id]);

    const init = async () => {
        setLoading(true);
        const [a, p, t] = await Promise.all([
            API.get(`/auction/${id}`),
            API.get(`/player/auction/${id}`),
            API.get(`/team/auction/${id}`)
        ]);
        setAuction(a.data);
        setPlayers(p.data);
        setTeams(t.data);
        if (a.data.currentPlayerId) fetchPlayer(a.data.currentPlayerId);
        setLoading(false);
    };

    const fetchPlayer = async (pid) => {
        const res = await API.get(`/player/${pid}`);
        setCurrentPlayer(res.data);
    };

    const startPolling = () => {
        pollRef.current = setInterval(async () => {
            const res = await API.get(`/bid/${id}/state`);
            if (res.data.currentPlayer) setCurrentPlayer(res.data.currentPlayer);
        }, 2000);
    };

    const placeBid = async (amount) => {
        if (!selectedTeam) return alert("Select team");
        await API.post(`/bid`, {
            playerId: currentPlayer._id,
            teamId: selectedTeam._id,
            amount
        });
    };

    const sellPlayer = async () => {
        if (!currentPlayer || !selectedTeam) return;
        await API.post(`/player/${currentPlayer._id}/sell`, {
            teamId: selectedTeam._id,
            soldPrice: currentPlayer.currentTopBid
        });
        navigate(`/admin/auction/${id}/table?view=PLAYERS`);
    };

    const markUnsold = async () => {
        await API.post(`/player/${currentPlayer._id}/unsold`);
        navigate(`/admin/auction/${id}/table?view=PLAYERS`);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ height: "100vh", background: "#0f0c29", color: "white" }}>
            <button onClick={() => navigate(-1)}><ArrowLeft /></button>

            {currentPlayer && (
                <>
                    <h1>{currentPlayer.name}</h1>
                    <h2>₹{currentPlayer.currentTopBid || 0}</h2>

                    <div style={{ display: "flex", gap: 10 }}>
                        {teams.map(t => (
                            <button key={t._id} onClick={() => setSelectedTeam(t)}>
                                {t.name}
                            </button>
                        ))}
                    </div>

                    <button onClick={() => placeBid((currentPlayer.currentTopBid || 0) + 50000)}>
                        +50K
                    </button>

                    <button onClick={sellPlayer}><Hammer /> SOLD</button>
                    <button onClick={markUnsold}><XCircle /> UNSOLD</button>
                </>
            )}
        </div>
    );
}
