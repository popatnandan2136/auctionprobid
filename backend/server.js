import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
import connectDB from './config/db.js';
connectDB();

// Basic Route
app.get('/', (req, res) => {
    res.send('Auction Management System Backend is running');
});

// Define Routes
import authRoutes from './routes/authRoutes.js';
import auctionRoutes from './routes/auction.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
