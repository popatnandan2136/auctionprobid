import Auction from "../models/Auction.js";

/* CREATE AUCTION (POST) */
export const createAuction = async (req, res) => {
  try {
    const auction = await Auction.create(req.body);

    res.status(201).json({
      message: "Auction created successfully",
      auction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET ALL AUCTIONS (GET) */
export const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find();

    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET AUCTION BY ID (GET) */
export const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* UPDATE AUCTION (PUT) */
export const updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    res.json({
      message: "Auction updated successfully",
      auction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* DELETE AUCTION (DELETE) */
export const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findByIdAndDelete(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    res.json({ message: "Auction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
