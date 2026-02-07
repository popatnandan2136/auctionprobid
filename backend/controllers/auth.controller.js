import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ================= REGISTER ADMIN ================= */

/* ================= REGISTER ADMIN ================= */

/* ================= REGISTER ADMIN ================= */

export const registerAdmin = async (req, res) => {
    try {
        const { name, email, mobile, password, role } = req.body;

        // Ensure only MASTER_ADMIN can create other admins (already protected by middleware, but role validation is good)
        const allowedRoles = ["ADMIN", "MASTER_ADMIN"];
        const newRole = allowedRoles.includes(role) ? role : "ADMIN";

        const exists = await User.findOne({
            $or: [{ email }, { mobile }]
        });
        if (exists)
            return res.status(400).json({ message: "User already exists (Email or Mobile)" });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            mobile,
            passwordHash,
            role: newRole,
            status: "ACTIVE"
        });

        res.status(201).json({
            message: `${newRole} registered successfully`,
            user: newUser,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= LOGIN ================= */

export const login = async (req, res) => {
    try {
        // accept 'mobile' OR 'email' in request body, or a single 'loginId'
        const { mobile, email, password, loginId } = req.body;

        // Determine the identifier to search
        const identifier = loginId || mobile || email;

        if (!identifier) {
            return res.status(400).json({ message: "Mobile or Email is required" });
        }

        // Search by Email OR Mobile
        const user = await User.findOne({
            $or: [{ mobile: identifier }, { email: identifier }]
        });

        if (!user)
            return res.status(404).json({ message: "Invalid mobile number or email" });

        // ... status check ...

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match)
            return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                teamId: user.teamId ?? null,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= FORGOT PASSWORD (SEND OTP) ================= */

export const forgotPassword = async (req, res) => {
    try {
        const { mobile } = req.body;

        const user = await User.findOne({ mobile });
        if (!user)
            return res.status(404).json({ message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetOtp = otp;
        user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save();

        console.log(`[Mock OTP] Sent to ${mobile}: ${otp}`);

        res.json({
            message: "OTP sent successfully",
            otp, // ⚠️ visible for testing only
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= RESET PASSWORD (SELF w/ OTP) ================= */

export const resetPassword = async (req, res) => {
    try {
        const { mobile, otp, newPassword } = req.body;

        const user = await User.findOne({ mobile });
        if (!user)
            return res.status(404).json({ message: "User not found" });

        if (
            user.resetOtp !== otp ||
            !user.resetOtpExpires ||
            user.resetOtpExpires < new Date()
        ) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);

        user.resetOtp = null;
        user.resetOtpExpires = null;

        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= MASTER ADMIN: RESET USER PASSWORD ================= */
export const resetUserPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: `Password for ${user.name} updated successfully` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


/* ================= GET ADMINS ================= */
export const getAdmins = async (req, res) => {
    try {
        // If MASTER_ADMIN, return all ADMIN and MASTER_ADMIN (except self if desired, but all is fine)
        // If ADMIN, permission denied by middleware usually, but if allowed, return only ADMINs
        const admins = await User.find({ role: { $in: ["ADMIN", "MASTER_ADMIN", "TEAM"] } }).select("-passwordHash").sort({ createdAt: -1 });
        res.json(admins);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= DELETE ADMIN ================= */
export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await User.findById(id);

        if (!admin) return res.status(404).json({ message: "Admin not found" });
        if (admin.role === "MASTER_ADMIN") return res.status(403).json({ message: "Cannot delete Master Admin" });

        await User.findByIdAndDelete(id);
        res.json({ message: "Admin deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= TOGGLE ADMIN STATUS ================= */
export const toggleAdminStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Toggle
        user.status = user.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
        await user.save();

        res.json({ message: `Admin ${user.status}`, user });
    } catch (err) { res.status(500).json({ message: err.message }); }
};