const express = require('express');
const router = express.Router();
const UserTeam = require('../models/UserTeam');
const User = require('../models/User');
const Player = require('../models/Player');
const auth = require('../middleware/auth');

// Get user's team
router.get('/myteam', auth, async (req, res) => {
  try {
    // First try to find existing team
    let team = await UserTeam.findOne({ userId: req.user.id });
    
    if (!team) {
      // Create new team if doesn't exist
      team = new UserTeam({ 
        userId: req.user.id,
        players: [],
        totalPoints: 0,
        totalValue: 0,
        isComplete: false
      });
      await team.save();
    }

    // Populate players
    const populatedTeam = await UserTeam.findById(team._id)
      .populate({
        path: 'players',
        model: 'Player',
        select: 'name university role price points battingAverage battingStrikeRate bowlingAverage bowlingStrikeRate matchesPlayed runsScored wicketsTaken'
      });

    res.json(populatedTeam);
  } catch (err) {
    console.error('Error in /myteam:', err);
    res.status(500).json({ message: 'Error fetching team', error: err.message });
  }
});

const validateTeamComposition = (players) => {
  const batsmenCount = players.filter(p => p.role === 'Batsman').length;
  const bowlersCount = players.filter(p => p.role === 'Bowler').length;
  const allRoundersCount = players.filter(p => p.role === 'All-rounder').length;
  const wicketKeepersCount = players.filter(p => p.role === 'WicketKeeper').length;

  // Check individual role limits
  if (batsmenCount > 5) {
    return { valid: false, message: 'Team cannot have more than 5 batsmen' };
  }
  if (bowlersCount > 4) {
    return { valid: false, message: 'Team cannot have more than 4 bowlers' };
  }
  if (allRoundersCount > 2) {
    return { valid: false, message: 'Team cannot have more than 2 all-rounders' };
  }
  if (wicketKeepersCount > 1) {
    return { valid: false, message: 'Team cannot have more than 1 wicket keeper' };
  }

  return { valid: true };
};

// Add player to team
router.post('/add-player/:playerId', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.params.playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    let team = await UserTeam.findOne({ userId: req.user.id })
      .populate('players');
    
    if (!team) {
      team = new UserTeam({ 
        userId: req.user.id,
        players: [],
        totalPoints: 0,
        totalValue: 0,
        isComplete: false
      });
    }

    // Check if player is already in team
    if (team.players.some(p => p._id.toString() === req.params.playerId)) {
      return res.status(400).json({ message: 'Player already in team' });
    }

    // Check team size
    if (team.players.length >= 11) {
      return res.status(400).json({ message: 'Team is already full (11 players maximum)' });
    }

    // Check role limits before adding the new player
    const simulatedTeam = [...team.players, player];
    const compositionValidation = validateTeamComposition(simulatedTeam);
    if (!compositionValidation.valid) {
      return res.status(400).json({ message: compositionValidation.message });
    }

    // Add player
    team.players.push(player._id);

    // Update team completion status
    team.isComplete = team.players.length === 11;
    
    await team.save();

    // Return updated team with populated players
    const updatedTeam = await UserTeam.findById(team._id)
      .populate({
        path: 'players',
        model: 'Player',
        select: 'name university role price points battingAverage battingStrikeRate bowlingAverage bowlingStrikeRate matchesPlayed runsScored wicketsTaken'
      });

    res.json(updatedTeam);
  } catch (err) {
    console.error('Error in /add-player:', err);
    res.status(500).json({ message: 'Error adding player to team', error: err.message });
  }
});

// Remove player from team
router.delete('/remove-player/:playerId', auth, async (req, res) => {
  try {
    let team = await UserTeam.findOne({ userId: req.user.id });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.players = team.players.filter(
      player => player.toString() !== req.params.playerId
    );

    // Update team completion status
    team.isComplete = team.players.length === 11;
    
    await team.save();

    // Return updated team with populated players
    const updatedTeam = await UserTeam.findById(team._id)
      .populate({
        path: 'players',
        model: 'Player',
        select: 'name university role price points battingAverage battingStrikeRate bowlingAverage bowlingStrikeRate matchesPlayed runsScored wicketsTaken'
      });

    res.json(updatedTeam);
  } catch (err) {
    console.error('Error in /remove-player:', err);
    res.status(500).json({ message: 'Error removing player from team', error: err.message });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const teams = await UserTeam.find({ isComplete: true })
      .populate('userId', 'username')
      .populate('players')
      .sort('-totalPoints');

    const leaderboard = await Promise.all(teams.map(async (team) => {
      const user = await User.findById(team.userId);
      return {
        username: user ? user.username : 'Unknown User',
        points: team.totalPoints,
        teamValue: team.totalValue,
        _id: team._id
      };
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error('Error in /leaderboard:', err);
    res.status(500).json({ message: 'Error fetching leaderboard', error: err.message });
  }
});

module.exports = router;
