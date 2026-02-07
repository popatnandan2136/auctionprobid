import Partner from "../models/partner.js";
export const createPartner = async (req, res) => {
  try {
    const partner = await Partner.create(req.body);

    res.status(201).json({
      message: "Partner created successfully",
      partner,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPartners = async (req, res) => {
  try {
    const partners = await Partner.find();

    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    res.json({
      message: "Partner updated successfully",
      partner,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    res.json({ message: "Partner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
