const express = require("express");
const teamController = require("../controllers/team.controller.js");
const auth = require("../middleware/auth.middleware.js");
const authorize = require("../middleware/role.middleware.js");
const { handleUpload, upload } = require("../middleware/upload.middleware.js");

const router = express.Router();

// Public Routes
router.get("/auction/:auctionId", teamController.getTeamsByAuction);
router.get("/:teamId", teamController.getTeamById);

// Protected Routes
// Protected Routes
router.post("/", handleUpload(upload, "logo"), teamController.createTeam);
router.put("/:teamId", handleUpload(upload, "logo"), teamController.updateTeam);
router.delete("/:teamId", teamController.deleteTeam);
router.post("/bonus", teamController.addBonus);

module.exports = router;
