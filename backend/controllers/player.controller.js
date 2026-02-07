import Player from "../models/Player.js";
import Team from "../models/Team.js";
import Auction from "../models/Auction.js";
import PlayerStats from "../models/PlayerStats.js"; // 🔥 Import

/* ==================================================
   INTERNAL HELPER (DO NOT CHANGE APIs)
   Handles refund + team recalculation safely
================================================== */
const refundTeamIfSold = async (player) => {
  if (player.status === "SOLD" && player.teamId) {
    const team = await Team.findById(player.teamId);
    if (!team) return;

    const refund = player.soldPrice || 0;

    team.spentPoints = Math.max(team.spentPoints - refund, 0);
    team.playersBought = Math.max(team.playersBought - 1, 0);
    team.availablePoints = team.totalPoints - team.spentPoints;

    await team.save();
  }
};

/***************************************************
 * Add Player
 ***************************************************/
export const addPlayer = async (req, res) => {
  try {
    const { name, category, role, basePrice, mobile, auctionId } = req.body;

    // Handle File Upload
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `http://localhost:5000/uploads/players/${req.file.filename}`;
    }

    // Handle Stats (Parse if stringified)
    let stats = req.body.stats;
    if (typeof stats === "string") {
      try {
        stats = JSON.parse(stats);
      } catch (e) {
        stats = {};
      }
    }

    if (!name || !category || !basePrice) {
      return res
        .status(400)
        .json({ message: "Name, category, and basePrice are required" });
    }

    const player = await Player.create({
      name,
      category,
      role: role || "",
      basePrice,
      imageUrl: imageUrl || null,
      mobile: mobile || null,
      auctionId: auctionId || null, // 🔥 Link to auction if provided
      status: auctionId ? "IN_AUCTION" : "NOT_IN_AUCTION", // Auto set status
      stats: stats || {}, // 🔥 Save stats to Player doc directly
    });

    // 🔥 If stats provided, create PlayerStats
    if (stats && Object.keys(stats).length > 0) {
      await PlayerStats.create({
        playerId: player._id,
        stats
      });
    }

    res.status(201).json({ message: "Player added", player });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/***************************************************
 * Update Player
 ***************************************************/
export const updatePlayer = async (req, res) => {
  try {
    const updates = req.body;

    if (req.file) {
      updates.imageUrl = `http://localhost:5000/uploads/players/${req.file.filename}`;
    }

    if (updates.category && typeof updates.category !== "string") {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Handle Stats (Parse if stringified)
    if (updates.stats && typeof updates.stats === "string") {
      try {
        updates.stats = JSON.parse(updates.stats);
      } catch (e) {
        updates.stats = {};
      }
    }
    // Also update PlayerStats if stats are present
    if (updates.stats) {
      await PlayerStats.findOneAndUpdate(
        { playerId: req.params.playerId },
        { stats: updates.stats },
        { upsert: true, new: true }
      );
      // delete updates.stats; // 🔥 Allow stats to update in Player doc too
    }

    const player = await Player.findByIdAndUpdate(
      req.params.playerId,
      updates,
      { new: true }
    );

    if (!player) return res.status(404).json({ message: "Player not found" });

    res.json({ message: "Player updated", player });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/***************************************************
 * Delete Player
 ***************************************************/
export const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.playerId);

    if (!player) return res.status(404).json({ message: "Player not found" });

    await refundTeamIfSold(player);
    await Player.findByIdAndDelete(req.params.playerId);

    res.json({ message: "Player deleted and team points updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/***************************************************
 * Get Players By Auction
 ***************************************************/
export const getPlayersByAuction = async (req, res) => {
  try {
    const players = await Player.find({ auctionId: req.params.auctionId });
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/***************************************************
 * Get Player By ID
 ***************************************************/
export const getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.playerId);
    if (!player) return res.status(404).json({ message: "Player not found" });

    const statsDoc = await PlayerStats.findOne({ playerId: player._id });
    const playerObj = player.toObject();
    if (statsDoc) playerObj.stats = statsDoc.stats;

    res.json(playerObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/***************************************************
 * Search Players
 ***************************************************/
export const searchPlayers = async (req, res) => {
  try {
    const q = req.query.q || "";

    const players = await Player.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { role: { $regex: q, $options: "i" } },
      ],
    });

    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/***************************************************
 * Add Player(s) to Auction
 ***************************************************/
export const addPlayerToAuction = async (req, res) => {
  try {
    const { playerId, playerIds, auctionId } = req.body;

    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    const ids = [];
    if (playerIds && Array.isArray(playerIds)) ids.push(...playerIds);
    if (playerId) ids.push(playerId);

    const results = [];

    for (const id of ids) {
      const player = await Player.findById(id);

      if (!player) {
        results.push({ id, status: "NOT_FOUND" });
        continue;
      }

      player.auctionId = auctionId;
      player.status = "IN_AUCTION";
      await player.save();

      results.push({ id, status: "ADDED", player });
    }

    res.json({ message: "Players processed", results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/***************************************************
 * Sell Player
 ***************************************************/
export const sellPlayer = async (req, res) => {
  try {
    const { teamId, soldPrice } = req.body;

    const player = await Player.findById(req.params.playerId);
    if (!player) return res.status(404).json({ message: "Player not found" });

    if (player.status === "SOLD") {
      await refundTeamIfSold(player);
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.availablePoints < soldPrice) {
      return res
        .status(400)
        .json({ message: "Team does not have enough points" });
    }

    player.status = "SOLD";
    player.teamId = teamId;
    player.soldPrice = soldPrice;
    await player.save();

    team.spentPoints += soldPrice;
    team.playersBought += 1;
    team.availablePoints = team.totalPoints - team.spentPoints;
    await team.save();

    res.json({ message: "Player sold successfully", player, team });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/***************************************************
 * Mark UNSOLD
 ***************************************************/
export const markUnsold = async (req, res) => {
  try {
    const player = await Player.findById(req.params.playerId);
    if (!player) return res.status(404).json({ message: "Player not found" });

    await refundTeamIfSold(player);

    player.status = "UNSOLD";
    player.teamId = null;
    player.soldPrice = null;
    await player.save();

    res.json({ message: "Player marked UNSOLD", player });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/***************************************************
 * Remove Player From Team
 ***************************************************/
export const removePlayerFromTeam = async (req, res) => {
  try {
    const player = await Player.findById(req.params.playerId);
    if (!player) return res.status(404).json({ message: "Player not found" });

    await refundTeamIfSold(player);

    player.status = "UNSOLD";
    player.teamId = null;
    player.soldPrice = null;
    await player.save();

    res.json({ message: "Player removed from team", player });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/***************************************************
 * Relist Player
 ***************************************************/
export const relistPlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.playerId);
    if (!player) return res.status(404).json({ message: "Player not found" });

    player.status = "UNSOLD";
    player.teamId = null;
    player.soldPrice = null;
    await player.save();

    res.json({ message: "Player relisted", player });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};