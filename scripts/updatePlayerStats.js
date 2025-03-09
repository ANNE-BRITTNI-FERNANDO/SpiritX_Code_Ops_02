require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('../models/Player');

async function updatePlayerStats() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Spirit11');
    console.log('Connected to MongoDB');

    // Get all players
    const players = await Player.find({});
    console.log(`Found ${players.length} players to update`);

    // Update each player
    for (const player of players) {
      // Calculate new points and value
      player.points = player.calculatePoints();
      player.price = player.calculateValue();
      
      // Save the player
      await player.save();
      console.log(`Updated ${player.name}: Points=${player.points.toFixed(2)}, Value=${player.price.toLocaleString('si-LK', { style: 'currency', currency: 'LKR' })}`);
    }

    console.log('All players updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating players:', error);
    process.exit(1);
  }
}

updatePlayerStats();
