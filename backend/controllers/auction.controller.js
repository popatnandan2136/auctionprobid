import Auction from "../models/Auction.js";
import Player from "../models/Player.js";
import Team from "../models/Team.js";

/****************************************************
 * CREATE AUCTION
 ****************************************************/
export const createAuction = async (req, res) => {
  try {
    if (req.file) {
      const url = `${req.protocol}://${req.get("host")}/uploads/auctions/${req.file.filename}`;
      req.body.logoUrl = url;
    }

    // Parse JSON fields from FormData
    if (typeof req.body.incrementSteps === "string") {
      try { req.body.incrementSteps = JSON.parse(req.body.incrementSteps); } catch (e) { }
    }
    if (typeof req.body.enabledStats === "string") {
      try { req.body.enabledStats = JSON.parse(req.body.enabledStats); } catch (e) { }
    }
    // 🔥 Parse Custom Categories & Roles
    if (typeof req.body.customCategories === "string") {
      try { req.body.customCategories = JSON.parse(req.body.customCategories); } catch (e) { }
    }
    if (typeof req.body.customRoles === "string") {
      try { req.body.customRoles = JSON.parse(req.body.customRoles); } catch (e) { }
    }

    // Parse Numeric fields from FormData
    ["pointsPerTeam", "totalTeams", "minPlayersPerTeam", "maxPlayersPerTeam"].forEach(field => {
      if (req.body[field] !== undefined) req.body[field] = Number(req.body[field]);
    });

    const auction = await Auction.create({
      ...req.body,
      createdBy: req.user?.id,
      status: "NOT_STARTED", // 🔥 ensure default
      isLive: false,
    });

    res.status(201).json({ message: "Auction created", auction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/****************************************************
 * GET ALL AUCTIONS (PUBLIC)
 ****************************************************/
export const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find().sort({ createdAt: -1 });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/****************************************************
 * GET AUCTION BY ID (PUBLIC)
 ****************************************************/
export const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate("currentPlayerId")
      .populate("createdBy", "name email");

    if (!auction)
      return res.status(404).json({ message: "Auction not found" });

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/****************************************************
 * UPDATE AUCTION (ADMIN)
 ****************************************************/
export const updateAuction = async (req, res) => {
  try {
    if (req.file) {
      const url = `${req.protocol}://${req.get("host")}/uploads/auctions/${req.file.filename}`;
      req.body.logoUrl = url;
    }

    // Parse JSON fields from FormData
    if (typeof req.body.incrementSteps === "string") {
      try { req.body.incrementSteps = JSON.parse(req.body.incrementSteps); } catch (e) { }
    }
    if (typeof req.body.enabledStats === "string") {
      try { req.body.enabledStats = JSON.parse(req.body.enabledStats); } catch (e) { }
    }

    // Parse Numeric fields from FormData
    ["pointsPerTeam", "totalTeams", "minPlayersPerTeam", "maxPlayersPerTeam"].forEach(field => {
      if (req.body[field] !== undefined) req.body[field] = Number(req.body[field]);
    });

    const updated = await Auction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Auction not found" });

    res.json({ message: "Auction updated", auction: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/****************************************************
 * ADD SPONSOR
 ****************************************************/
export const addSponsor = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction)
      return res.status(404).json({ message: "Auction not found" });

    auction.sponsors = auction.sponsors || [];
    auction.sponsors.push({
      name: req.body.name,
      logoUrl: req.body.logoUrl,
    });

    await auction.save();

    res.json({
      message: "Sponsor added",
      sponsors: auction.sponsors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/****************************************************
 * START AUCTION
 ****************************************************/
export const startAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction)
      return res.status(404).json({ message: "Auction not found" });

    if (auction.status === "FINISHED") {
      return res
        .status(400)
        .json({ message: "Auction already finished" });
    }

    auction.status = "LIVE";
    auction.isLive = true;

    await auction.save();

    res.json({ message: "Auction started", auction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/****************************************************
 * RESUME AUCTION (NEW)
 ****************************************************/
export const resumeAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction)
      return res.status(404).json({ message: "Auction not found" });

    if (auction.status !== "FINISHED") {
      return res.status(400).json({
        message: "Only finished auctions can be resumed",
      });
    }

    auction.status = "LIVE";
    auction.isLive = true;

    await auction.save();

    res.json({
      message: "Auction resumed successfully",
      auction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/****************************************************
 * FINISH AUCTION (NEW)
 ****************************************************/
export const finishAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction)
      return res.status(404).json({ message: "Auction not found" });

    auction.status = "FINISHED";
    auction.isLive = false;
    auction.currentPlayerId = null;

    await auction.save();

    res.json({
      message: "Auction finished successfully",
      auction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/****************************************************
 * SELECT CURRENT PLAYER
 ****************************************************/
export const selectCurrentPlayer = async (req, res) => {
  try {
    const { playerId } = req.body;

    const auction = await Auction.findById(req.params.id);
    if (!auction)
      return res.status(404).json({ message: "Auction not found" });

    if (auction.status !== "LIVE") {
      return res.status(400).json({
        message: "Auction is not live",
      });
    }

    const player = await Player.findById(playerId);
    if (!player || String(player.auctionId) !== String(auction._id)) {
      return res.status(400).json({
        message: "Player not part of this auction",
      });
    }

    auction.currentPlayerId = playerId;
    await auction.save();

    res.json({
      message: "Current player selected",
      currentPlayerId: playerId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/****************************************************
 * MARK PLAYER SOLD
 ****************************************************/
export const markPlayerSold = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { teamId, soldPrice } = req.body;

    const player = await Player.findById(playerId);
    if (!player)
      return res.status(404).json({ message: "Player not found" });

    const auction = await Auction.findById(player.auctionId);
    if (!auction || auction.status !== "LIVE") {
      return res.status(400).json({
        message: "Auction is not live",
      });
    }

    player.status = "SOLD";
    player.soldPrice = soldPrice;
    player.teamId = teamId;
    await player.save();

    const team = await Team.findById(teamId);
    if (team) {
      team.spentPoints = (team.spentPoints || 0) + soldPrice;
      team.availablePoints = team.totalPoints - team.spentPoints;
      team.playersBought = (team.playersBought || 0) + 1;
      await team.save();
    }

    res.json({ message: "Player sold", player });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/****************************************************
 * MARK PLAYER UNSOLD
 ****************************************************/
export const markPlayerUnsold = async (req, res) => {
  try {
    const player = await Player.findById(req.params.playerId);
    if (!player)
      return res.status(404).json({ message: "Player not found" });

    player.status = "UNSOLD";
    player.soldPrice = null;
    player.teamId = null;
    await player.save();

    res.json({ message: "Player marked UNSOLD", player });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/****************************************************
 * REMOVE PLAYER FROM TEAM
 ****************************************************/
export const removePlayerFromTeam = async (req, res) => {
  try {
    const player = await Player.findById(req.params.playerId);
    if (!player)
      return res.status(404).json({ message: "Player not found" });

    const refund = player.soldPrice || 0;
    const teamId = player.teamId;

    player.status = "UNSOLD";
    player.soldPrice = null;
    player.teamId = null;
    await player.save();

    const team = await Team.findById(teamId);
    if (team) {
      team.spentPoints = (team.spentPoints || 0) - refund;
      team.availablePoints = team.totalPoints - team.spentPoints;
      team.playersBought = Math.max((team.playersBought || 1) - 1, 0);
      await team.save();
    }

    res.json({
      message: "Player removed & recalculated",
      player,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/****************************************************
 * RELIST PLAYER
 ****************************************************/
export const relistPlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.playerId);
    if (!player)
      return res.status(404).json({ message: "Player not found" });

    player.status = "UNSOLD";
    player.teamId = null;
    player.soldPrice = null;
    res.json({ message: "Player relisted", player });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/****************************************************
 * TOGGLE REGISTRATION LINK
 ****************************************************/
export const toggleRegistration = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    // Toggle the boolean
    auction.isRegistrationOpen = !auction.isRegistrationOpen;
    await auction.save();

    res.json({
      message: `Registration is now ${auction.isRegistrationOpen ? "OPEN" : "CLOSED"}`,
      isRegistrationOpen: auction.isRegistrationOpen
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/****************************************************
 * DELETE AUCTION (HARD DELETE)
 ****************************************************/
import PlayerRequest from "../models/PlayerRequest.js";

export const deleteAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    // Hard Delete Cascade
    await Team.deleteMany({ auctionId: id });
    await Player.deleteMany({ auctionId: id });
    await PlayerRequest.deleteMany({ auctionId: id });
    await Auction.findByIdAndDelete(id);

    res.json({ message: "Auction and all related data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};