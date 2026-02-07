import bcrypt from "bcryptjs";
import User from "../models/user.js";

export const createAdmin = async (req, res) => {
  try {
    const { name, mobile, email, role: adminRole } = req.body;

    // Check if mobile or email exists
    const exists = await User.findOne({ $or: [{ mobile }, { email }] });
    if (exists) return res.status(400).json({ message: "Mobile or Email already registered" });

    // Auto-generate password
    const password = Math.random().toString(36).slice(-8); // Simple random password
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      mobile,
      email,
      passwordHash,
      role: adminRole || "ADMIN", // Allow creating MASTER_ADMIN if needed, default ADMIN
      createdBy: req.user.id,
      status: "ACTIVE"
    });

    // In a real app, send credentials via SMS/Email here using 'password'
    console.log(`[Mock SMS] Creds for ${name} (${mobile}): PWD=${password}`);

    res.status(201).json({
      message: "Admin created successfully",
      admin: { _id: admin._id, name, mobile, email, role: admin.role, status: admin.status }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ["ADMIN", "MASTER_ADMIN"] } }).select("-passwordHash");
    res.json(admins);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

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