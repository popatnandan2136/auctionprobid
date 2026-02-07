const Auction = require('../models/Auction');

exports.createAuction = async (req, res) => {
    try {
        const newAuction = new Auction(req.body);
        const auction = await newAuction.save();
        res.json(auction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find().sort({ createdAt: -1 });
        res.json(auctions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
