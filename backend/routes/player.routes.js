const express = require("express");
const playerController = require("../controllers/player.controller.js");
const auth = require("../middleware/auth.middleware.js"); // Ensure this exists (I created it)
const authorize = require("../middleware/role.middleware.js");

const router = express.Router();

// Public Routes
router.get("/", playerController.getAllPlayers);
router.get("/:id", playerController.getPlayerById);
router.get("/auction/:auctionId", playerController.getPlayersByAuction);

// Protected Routes
// Protected Routes
router.post("/", playerController.createPlayer);
router.put("/:id", playerController.updatePlayer);
router.delete("/:id", playerController.deletePlayer);

module.exports = router;