import Auction from "../models/Auction.js";

export const addSponsor = async (req, res) => {
    try {
        const { auctionId } = req.params;
        let { name, logoUrl, mobile, address, website } = req.body;

        if (req.file) {
            logoUrl = `http://localhost:5000/uploads/sponsors/${req.file.filename}`;
        }

        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ message: "Auction not found" });

        auction.sponsors.push({ name, logoUrl, mobile, address, website });
        await auction.save();

        res.json({ message: "Sponsor added", sponsors: auction.sponsors });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const removeSponsor = async (req, res) => {
    try {
        const { auctionId, sponsorId } = req.params;

        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ message: "Auction not found" });

        auction.sponsors = auction.sponsors.filter(s => String(s._id) !== sponsorId);
        await auction.save();

        res.json({ message: "Sponsor removed", sponsors: auction.sponsors });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateSponsor = async (req, res) => {
    try {
        const { auctionId, sponsorId } = req.params;
        let { name, logoUrl, mobile, address, website } = req.body;

        if (req.file) {
            logoUrl = `http://localhost:5000/uploads/sponsors/${req.file.filename}`;
        }

        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ message: "Auction not found" });

        const sponsor = auction.sponsors.id(sponsorId);
        if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });

        if (name) sponsor.name = name;
        if (logoUrl) sponsor.logoUrl = logoUrl;
        if (mobile) sponsor.mobile = mobile;
        if (address) sponsor.address = address;
        if (website) sponsor.website = website;

        await auction.save();

        res.json({ message: "Sponsor updated", sponsors: auction.sponsors });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getSponsors = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const auction = await Auction.findById(auctionId).select("sponsors");
        if (!auction) return res.status(404).json({ message: "Auction not found" });

        res.json(auction.sponsors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
