import Team from "../models/Team.js";
import User from "../models/User.js";
import Auction from "../models/Auction.js";
import bcrypt from "bcryptjs";

/***************************************************
 * Utility: Generate Random Password
 **************************************************/
function generatePassword() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let pwd = "";
  for (let i = 0; i < 8; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

/***************************************************
 * CREATE TEAM + AUTO-GENERATE TEAM LOGIN USER
 **************************************************/
export const createTeam = async (req, res) => {
  try {
    const {
      name,
      ownerName,
      ownerEmail,
      ownerMobile,
      auctionId,
    } = req.body;

    let logoUrl = req.body.logoUrl;
    if (req.file) {
      logoUrl = `http://localhost:5000/uploads/teams/${req.file.filename}`;
    }

    // 1. Check auction
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // 2. Check for Existing User (Reusable Owner)
    let teamUser = await User.findOne({
      $or: [{ mobile: ownerMobile }, { email: ownerEmail }]
    });

    if (teamUser) {
      // 2a. Check Removed: Admins ARE allowed to own teams now.
      // if (teamUser.role === "MASTER_ADMIN" || teamUser.role === "ADMIN") { ... }

      // Info: We will reuse this 'teamUser._id'
    } else {
      // 2b. Create New User if not exists
      const autoPassword = generatePassword();
      const passwordHash = await bcrypt.hash(autoPassword, 10);

      teamUser = await User.create({
        name: ownerName,
        email: ownerEmail,
        mobile: ownerMobile,
        passwordHash,
        role: "TEAM",
        status: "ACTIVE"
      });

      // Attach raw password for initial response only
      teamUser.tempPassword = autoPassword;
    }

    // 3. Create Team
    const team = await Team.create({
      name,
      logoUrl,
      ownerName,
      ownerEmail,
      ownerMobile,
      auctionId,
      totalPoints: auction.pointsPerTeam,
      availablePoints: auction.pointsPerTeam,
      spentPoints: 0,
      userId: teamUser._id // Link to User (New or Existing)
    });

    // 4. Update User's teamId (Enable switching or just link latest)
    // Note: If user owns multiple teams, teamId field might need to be array in future, 
    // but for now we just link the latest or keep specific logic. 
    // Common pattern: User has many teams (one to many). 
    // If User Model `teamId` is single, it points to ONE team. 
    // We update it to the new team so they login to this one by default or handle logic elsewhere.
    teamUser.teamId = team._id;
    await teamUser.save();

    // 5. Update auction team count - REMOVED (totalTeams is a limit, not a counter)
    // auction.totalTeams = (auction.totalTeams || 0) + 1;
    // await auction.save();

    res.status(201).json({
      message: "Team created successfully",
      team,
      loginDetails: teamUser.tempPassword ? {
        mobile: ownerMobile,
        email: ownerEmail,
        password: teamUser.tempPassword,
      } : {
        message: "User already exists. Please login with existing credentials."
      },
    });
  } catch (error) {
    console.error("Team Create Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/***************************************************
 * GET TEAMS BY AUCTION
 **************************************************/
export const getTeamsByAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const teams = await Team.find({ auctionId });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/***************************************************
 * GET TEAM BY ID  ✅ THIS WAS MISSING
 **************************************************/
export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/***************************************************
 * UPDATE TEAM
 **************************************************/
export const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const updates = req.body;

    // 1. Fetch current team
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // 2. Apply updates manually to check for points change
    Object.keys(updates).forEach((key) => {
      team[key] = updates[key];
    });

    if (req.file) {
      team.logoUrl = `http://localhost:5000/uploads/teams/${req.file.filename}`;
    }

    // 3. Recalculate Available Points (Self-Healing)
    if (team.totalPoints !== undefined || team.spentPoints !== undefined) {
      team.spentPoints = team.spentPoints || 0;
      team.availablePoints = team.totalPoints - team.spentPoints;
    }

    const updatedTeam = await team.save();

    // 4. Sync updates to User (Login Credentials)
    let user = null;
    if (team.userId) {
      user = await User.findById(team.userId);
    }

    // Fallback: If no linked userId, try to find the user who owns this team
    if (!user) {
      user = await User.findOne({ teamId: team._id });
      if (user) {
        // Backfill the link for future
        team.userId = user._id;
        await team.save();
      }
    }

    if (user) {
      console.log(`Syncing Team update to User: ${user._id}`);
      if (updates.ownerName) user.name = updates.ownerName;
      if (updates.ownerMobile) user.mobile = updates.ownerMobile;
      if (updates.ownerEmail) user.email = updates.ownerEmail;

      // If password is being reset (optional, future proofing)
      // if (updates.password) { ... } 

      await user.save();
    } else {
      console.warn(`No linked user found for team ${team._id} to sync updates.`);
    }

    res.json({
      message: "Team updated successfully",
      team: updatedTeam,
      userSynced: !!user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.userId) {
      await User.findByIdAndDelete(team.userId);
    }

    await Team.findByIdAndDelete(teamId);

    res.json({ message: "Team and associated user deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/***************************************************
 * ADD BONUS POINTS
 **************************************************/
export const addBonus = async (req, res) => {
  try {
    const { amount, teamId, auctionId } = req.body;
    const bonus = parseInt(amount);

    if (isNaN(bonus)) {
      return res.status(400).json({ message: "Invalid bonus amount" });
    }

    if (teamId === "ALL") {
      const teams = await Team.find({ auctionId });

      for (const team of teams) {
        team.totalPoints = (team.totalPoints || 0) + bonus;
        team.spentPoints = team.spentPoints || 0;
        team.availablePoints = team.totalPoints - team.spentPoints; // Self-heal
        await team.save();
      }

      return res.json({ message: `Added ${bonus} points to ALL teams` });
    } else {
      const team = await Team.findById(teamId);
      if (!team) return res.status(404).json({ message: "Team not found" });

      team.totalPoints = (team.totalPoints || 0) + bonus;
      team.spentPoints = team.spentPoints || 0;
      team.availablePoints = team.totalPoints - team.spentPoints;

      await team.save();

      return res.json({ message: `Added ${bonus} points to ${team.name}` });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};