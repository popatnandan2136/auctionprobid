import PlayerRequest from "../models/playerRequest.js";
import Player from "../models/player.js";

export const sendOtp = async (req, res) => {
    try {
        const { mobile } = req.body;
        // Mock OTP logic
        const otp = "123456";
        await PlayerRequest.findOneAndUpdate(
            { mobile },
            { otp, status: "OTP_SENT" },
            { upsert: true, new: true }
        );
        res.json({ message: "OTP sent successfully (mock)" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const verifySubmit = async (req, res) => {
    try {
        const { mobile, otp, ...playerData } = req.body;
        const request = await PlayerRequest.findOne({ mobile, otp });
        if (!request) return res.status(400).json({ message: "Invalid OTP" });

        Object.assign(request, playerData, { status: "SUBMITTED" });
        await request.save();
        res.json({ message: "Player request submitted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const approveRequest = async (req, res) => {
    try {
        const request = await PlayerRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        // Create player from request
        const player = await Player.create({
            name: request.name,
            mobile: request.mobile,
            auctionId: request.auctionId,
            status: "IN_AUCTION"
        });

        request.status = "APPROVED";
        await request.save();

        res.json({ message: "Request approved and player created", player });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
