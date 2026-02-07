const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Basic Route
app.get('/', (req, res) => {
    res.send('Auction Management System Backend is running');
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auctions', require('./routes/auction.routes'));
app.use('/api/players', require('./routes/player.routes'));
app.use('/api/teams', require('./routes/team.routes'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
