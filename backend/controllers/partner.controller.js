import Partner from "../models/Partner.js";

// Get All Partners (Public)
export const getPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Partner (Admin Only)
export const createPartner = async (req, res) => {
  try {
    const { name, title, description, mobile, type, website, order } = req.body;

    // Check for image
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (!imageUrl) return res.status(400).json({ message: "Image is required" });

    const partner = await Partner.create({
      type: type || 'OWNER', // Default
      name,
      title,
      description,
      mobile,
      website,
      order: order ? parseInt(order) : 0,
      imageUrl
    });

    res.status(201).json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Partner (Admin Only)
export const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    await Partner.findByIdAndDelete(id);
    res.json({ message: "Partner deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
