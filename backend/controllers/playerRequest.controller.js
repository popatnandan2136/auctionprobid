import PlayerRequest from "../models/PlayerRequest.js";
import Player from "../models/Player.js";
import PlayerStats from "../models/PlayerStats.js"; // 🔥 Import
import mongoose from "mongoose";

const genOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

// sendOtp
export const sendOtp = async (req, res) => {
    try {
        const { mobile } = req.body;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // DELETE OLD OTP FOR SAME MOBILE (IMPORTANT)
        await PlayerRequest.deleteMany({ mobile });

        const request = await PlayerRequest.create({
            mobile,
            otp,              // 🔥 STORED AS STRING
            status: "OTP_SENT"
        });

        console.log(`OTP for ${mobile} is ${otp}`);

        res.json({
            message: "OTP sent successfully",
            mobile
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const verifySubmit = async (req, res) => {
    try {
        const { mobile, otp, auctionId } = req.body;

        const request = await PlayerRequest.findOne({
            mobile,
            status: "OTP_SENT"
        });

        if (!request) {
            return res.status(400).json({ message: "OTP expired or not found" });
        }

        console.log("Saved OTP:", request.otp);
        console.log("Entered OTP:", otp);

        // 🔥 STRING COMPARISON ONLY
        if (request.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // OTP VERIFIED
        request.auctionId = auctionId;
        request.status = "SUBMITTED";

        // Save Player Details
        console.log("VERIFY SUBMIT PAYLOAD:", req.body);

        // Save Player Details
        if (req.body.name) request.name = req.body.name;
        if (req.body.categoryId) request.categoryId = req.body.categoryId; // FIXED: Use categoryId
        if (req.body.role) request.role = req.body.role;
        if (req.body.categoryId) request.categoryId = req.body.categoryId; // FIXED: Use categoryId
        if (req.body.role) request.role = req.body.role;
        if (req.body.basePrice) request.basePrice = req.body.basePrice;
        if (req.body.stats) request.stats = req.body.stats; // 🔥 Save stats to request

        await request.save();

        res.json({
            message: "OTP verified & player request submitted",
            requestId: request._id
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const approveRequest = async (req, res) => {
    try {
        const requestId = req.params.id.trim();

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: "Invalid request id" });
        }

        const request = await PlayerRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Player request not found" });
        }

        if (request.status !== "SUBMITTED") {
            return res.status(400).json({
                message: `Cannot approve request with status ${request.status}`,
            });
        }

        // 🔥 CREATE PLAYER (THIS WAS MISSING)
        // 🔥 CREATE PLAYER (Fixed mapping)
        const player = await Player.create({
            name: request.name || "Approved Player",
            categoryId: request.categoryId, // Fixed: Use ID
            role: request.role || "",
            basePrice: request.basePrice || 0,

            auctionId: request.auctionId.toString().trim(),
            status: "IN_AUCTION",
            mobile: request.mobile // 🔥 Save mobile number
        });

        // 🔥 Create PlayerStats if exists
        if (request.stats) {
            await PlayerStats.create({
                playerId: player._id,
                auctionId: request.auctionId,
                stats: request.stats
            });
        }

        // Update request status
        request.status = "APPROVED";
        await request.save();

        res.json({
            message: "Player approved and added to auction",
            playerId: player._id,
        });
    } catch (err) {
        console.error("Approve Error:", err);
        res.status(500).json({ message: err.message });
    }
};