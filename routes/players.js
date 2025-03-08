const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// Get all players
router.get('/', async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new player
router.post('/', async (req, res) => {
  try {
    const player = new Player(req.body);
    const newPlayer = await player.save();
    res.status(201).json(newPlayer);
  } catch (err) {
    console.error('Error creating player:', err);
    res.status(400).json({ 
      message: err.message || 'Failed to create player' 
    });
  }
});

// Update player
router.put('/:id', async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete player
router.delete('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    await player.deleteOne();
    res.json({ message: 'Player deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get tournament summary
router.get('/tournament-summary', async (req, res) => {
  try {
    const players = await Player.find();
    
    // Calculate tournament summary
    const summary = players.reduce((acc, player) => {
      // Update total runs and wickets
      acc.totalRuns += player.runsScored;
      acc.totalWickets += player.wicketsTaken;
      
      // Check for highest scorer
      if (player.runsScored > (acc.highestScorer?.runs || 0)) {
        acc.highestScorer = {
          name: player.name,
          runs: player.runsScored
        };
      }
      
      // Check for highest wicket taker
      if (player.wicketsTaken > (acc.highestWicketTaker?.wickets || 0)) {
        acc.highestWicketTaker = {
          name: player.name,
          wickets: player.wicketsTaken
        };
      }
      
      return acc;
    }, {
      totalRuns: 0,
      totalWickets: 0,
      highestScorer: null,
      highestWicketTaker: null
    });
    
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;