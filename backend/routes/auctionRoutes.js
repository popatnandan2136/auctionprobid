const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

// No auth middleware
router.post('/', auctionController.createAuction);
router.get('/', auctionController.getAuctions);

module.exports = router;
