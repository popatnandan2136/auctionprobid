import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api';
import MainLoader from '../../components/MainLoader';
import { User, Shield, Users, Trophy } from 'lucide-react';

const AuctionPublicView = () => {
    const { id } = useParams();
    const [auction, setAuction] = useState(null);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            // Parallel fetch for better performance
            const [auctionRes, teamsRes, playersRes] = await Promise.all([
                API.get(`/auctions/${id}`),
                API.get(`/teams/auction/${id}`),
                API.get(`/players/auction/${id}`)
            ]);

            setAuction(auctionRes.data);
            setTeams(teamsRes.data);
            setPlayers(playersRes.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching public auction data:", err);
            setError("Failed to load auction data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen"><MainLoader /></div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
    if (!auction) return <div className="text-center mt-10">Auction not found</div>;

    const soldPlayers = players.filter(p => p.status === 'SOLD');
    const unsoldPlayers = players.filter(p => p.status === 'UNSOLD');

    // Calculate stats
    const totalSpent = teams.reduce((sum, t) => sum + (t.spentPoints || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Header / Hero */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={auction.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png"}
                                alt={auction.name}
                                className="w-16 h-16 object-contain rounded-lg border border-gray-100 p-1"
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{auction.name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${auction.status === 'LIVE' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
                                        {auction.status === 'LIVE' ? '🔴 LIVE AUCTION' : auction.status}
                                    </span>
                                    <span className="text-gray-500 text-sm">Organized by {auction.createdBy?.name || 'Admin'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-6 text-center">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Teams</p>
                                <p className="text-2xl font-bold text-blue-600">{teams.length}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Sold</p>
                                <p className="text-2xl font-bold text-green-600">{soldPlayers.length}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Spent</p>
                                <p className="text-2xl font-bold text-purple-600">₹{(totalSpent / 10000000).toFixed(2)} Cr</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Team Standings */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-xl font-bold text-gray-800">Team Standings</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {teams.map(team => (
                            <div key={team._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 flex items-center gap-3 border-b border-gray-50">
                                    <img
                                        src={team.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png"}
                                        alt={team.name}
                                        className="w-10 h-10 object-contain"
                                    />
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate">{team.name}</h3>
                                        <p className="text-xs text-gray-500 truncate">{team.ownerName || 'No Owner'}</p>
                                    </div>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-y-2 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs">Purse Remaining</p>
                                        <p className="font-semibold text-green-600">₹{((team.availablePoints || 0) / 10000000).toFixed(2)} Cr</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Players Bought</p>
                                        <p className="font-semibold text-gray-900">{team.playersBought || 0}</p>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-gray-50 mt-2">
                                        <p className="text-xs text-gray-400">Total Budget: ₹{((team.totalPoints || 0) / 10000000).toFixed(2)} Cr</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Latest Sold Players */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-bold text-gray-800">Recently Sold Players</h2>
                    </div>
                    {soldPlayers.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                            No players sold strictly yet.
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-3">Player</th>
                                            <th className="px-6 py-3">Category</th>
                                            <th className="px-6 py-3">Sold To</th>
                                            <th className="px-6 py-3 text-right">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {soldPlayers.slice().reverse().slice(0, 10).map(player => { // Show last 10 sold
                                            const team = teams.find(t => t._id === player.teamId);
                                            return (
                                                <tr key={player._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                            {player.image ? <img src={player.image} alt={player.name} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-gray-400" />}
                                                        </div>
                                                        <span className="font-medium text-gray-900">{player.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{player.category}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {team ? (
                                                            <div className="flex items-center gap-2">
                                                                {team.logoUrl && <img src={team.logoUrl} alt="" className="w-5 h-5 object-contain" />}
                                                                <span className="font-medium text-gray-900">{team.name}</span>
                                                            </div>
                                                        ) : 'Unknown'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-green-600">
                                                        ₹{((player.soldPrice || 0) / 100000).toFixed(1)} L
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>

                {/* Sponsors */}
                {auction.sponsors && auction.sponsors.length > 0 && (
                    <section className="pt-8 border-t border-gray-200">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Powered By</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-8 items-center opacity-70 hover:opacity-100 transition-opacity">
                            {auction.sponsors.map((sponsor, idx) => (
                                <img
                                    key={idx}
                                    src={sponsor.logoUrl}
                                    alt={sponsor.name}
                                    className="h-12 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                                    title={sponsor.name}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default AuctionPublicView;
