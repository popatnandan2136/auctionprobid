import Team from "../models/team.js";
import User from "../models/user.js";
import Auction from "../models/Auction.js";
import bcrypt from "bcryptjs";

function generatePassword() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let pwd = "";
  for (let i = 0; i < 8; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

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

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    let teamUser = await User.findOne({
      $or: [{ mobile: ownerMobile }, { email: ownerEmail }]
    });

    if (!teamUser) {
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

      teamUser.tempPassword = autoPassword;
    }

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
      userId: teamUser._id
    });

    teamUser.teamId = team._id;
    await teamUser.save();

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

export const getTeamsByAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const teams = await Team.find({ auctionId });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

export const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const updates = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    Object.keys(updates).forEach((key) => {
      team[key] = updates[key];
    });

    if (req.file) {
      team.logoUrl = `http://localhost:5000/uploads/teams/${req.file.filename}`;
    }

    if (team.totalPoints !== undefined || team.spentPoints !== undefined) {
      team.spentPoints = team.spentPoints || 0;
      team.availablePoints = team.totalPoints - team.spentPoints;
    }

    const updatedTeam = await team.save();

    let user = null;
    if (team.userId) {
      user = await User.findById(team.userId);
    }

    if (!user) {
      user = await User.findOne({ teamId: team._id });
      if (user) {
        team.userId = user._id;
        await team.save();
      }
    }

    if (user) {
      console.log(`Syncing Team update to User: ${user._id}`);
      if (updates.ownerName) user.name = updates.ownerName;
      if (updates.ownerMobile) user.mobile = updates.ownerMobile;
      if (updates.ownerEmail) user.email = updates.ownerEmail;
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
        team.availablePoints = team.totalPoints - team.spentPoints;
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
