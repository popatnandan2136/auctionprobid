import Auction from "../models/Auction.js";
import Player from "../models/Player.js";
import Team from "../models/Team.js";

/****************************************************
 * PLACE BID
 ****************************************************/
export const placeBid = async (req, res) => {
    try {
        const { auctionId, playerId, teamId, amount } = req.body;

        // 1. Validate Auction Status
        const auction = await Auction.findById(auctionId);
        if (!auction || !auction.isLive) {
            return res.status(400).json({ message: "Auction is not live" });
        }
        if (String(auction.currentPlayerId) !== String(playerId)) {
            return res.status(400).json({ message: "Bidding not open for this player" });
        }

        // 2. Validate Player Status
        const player = await Player.findById(playerId);
        if (!player || player.status !== "IN_AUCTION") {
            return res.status(400).json({ message: "Player is not in auction" });
        }

        // 3. Validate Bid Amount
        if (amount <= player.currentTopBid) {
            return res.status(400).json({ message: "Bid must be higher than current top bid" });
        }
        if (amount < player.basePrice) {
            return res.status(400).json({ message: "Bid must be at least base price" });
        }

        // 4. Validate Team Budget
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        // Calculate max bid possible? (Wait, points are deducted only on sale, but we should check if they *can* afford it)
        if (team.availablePoints < amount) {
            return res.status(400).json({ message: "Insufficient budget" });
        }

        // 5. Place Bid
        player.currentTopBid = amount;
        player.bids.push({ teamId, amount });
        await player.save();

        // 6. Update Auction Timestamp (for listeners)
        auction.lastBidTime = new Date();
        await auction.save();

        res.json({ message: "Bid placed successfully", player });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/****************************************************
 * GET CURRENT AUCTION STATE (For polling)
 ****************************************************/
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
