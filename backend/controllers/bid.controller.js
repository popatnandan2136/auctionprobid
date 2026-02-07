import Auction from "../models/Auction.js";
import Player from "../models/Player.js";
import Team from "../models/Team.js";

export const placeBid = async (req, res) => {
    try {
        const { auctionId, playerId, teamId, amount } = req.body;

        const auction = await Auction.findById(auctionId);
        if (!auction || !auction.isLive) {
            return res.status(400).json({ message: "Auction is not live" });
        }
        if (String(auction.currentPlayerId) !== String(playerId)) {
            return res.status(400).json({ message: "Bidding not open for this player" });
        }

        const player = await Player.findById(playerId);
        if (!player || player.status !== "IN_AUCTION") {
            return res.status(400).json({ message: "Player is not in auction" });
        }

        if (amount <= player.currentTopBid) {
            return res.status(400).json({ message: "Bid must be higher than current top bid" });
        }
        if (amount < player.basePrice) {
            return res.status(400).json({ message: "Bid must be at least base price" });
        }

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        if (team.availablePoints < amount) {
            return res.status(400).json({ message: "Insufficient budget" });
        }

        player.currentTopBid = amount;
        player.bids.push({ teamId, amount });
        await player.save();

        auction.lastBidTime = new Date();
        await auction.save();

        res.json({ message: "Bid placed successfully", player });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAuctionState = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const auction = await Auction.findById(auctionId).select("isLive currentPlayerId lastBidTime pointsPerTeam");

        if (!auction) return res.status(404).json({ message: "Auction not found" });

        let currentPlayer = null;
        if (auction.currentPlayerId) {
            currentPlayer = await Player.findById(auction.currentPlayerId).populate("bids.teamId", "name logoUrl");
        }

        res.json({
            auction,
            currentPlayer
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
