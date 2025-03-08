require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('../models/Player');
const Admin = require('../models/Admin');
const playerData = require('./seedPlayer.js');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Spirit11')
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

const transformPlayerData = (data) => {
  return data.map(player => ({
    name: player.Name,
    university: player.University,
    role: player.Category === 'All-Rounder' ? 'All-rounder' : player.Category,
    matchesPlayed: player['Innings Played'],
    runsScored: player['Total Runs'],
    inningsPlayed: player['Innings Played'],
    ballsFaced: player['Balls Faced'],
    wicketsTaken: player['Wickets'],
    runsConceded: player['Runs Conceded'],
    oversBowled: player['Overs Bowled'],
    ballsBowled: player['Overs Bowled'] * 6, // Convert overs to balls
  }));
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Player.deleteMany({});
    await Admin.deleteMany({});

    // Transform and seed players
    const transformedPlayers = transformPlayerData(playerData);
    await Player.insertMany(transformedPlayers);
    console.log('Players seeded successfully');

    // Create default admin
    const admin = new Admin({
      username: 'admin',
      email: 'admin@spirit11.com',
      password: 'admin123',
      isAdmin: true
    });
    await admin.save();
    console.log('Admin seeded successfully');

    console.log('Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
