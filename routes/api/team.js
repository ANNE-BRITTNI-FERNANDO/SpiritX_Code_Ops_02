const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const UserTeam = require('../../models/UserTeam');
const Player = require('../../models/Player');

// @route   GET api/team/myteam
// @desc    Get current user's team
// @access  Private
router.get('/myteam', auth, async (req, res) => {
  try {
    let team = await UserTeam.findOne({ userId: req.user.id }).populate('players');
    
    if (!team) {
      team = new UserTeam({ userId: req.user.id });
      await team.save();
    }

    res.json({
      players: team.players,
      totalPoints: team.totalPoints,
      totalValue: team.totalValue,
      budget: team.budget,
      isComplete: team.isComplete
    });
  } catch (err) {
    console.error('Error in GET /myteam:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/team/add-player/:playerId
// @desc    Add a player to user's team
// @access  Private
router.post('/add-player/:playerId', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.params.playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    let team = await UserTeam.findOne({ userId: req.user.id }).populate('players');
    if (!team) {
      team = new UserTeam({ userId: req.user.id });
    }

    // Check if player is already in team
    if (team.players.some(p => p._id.toString() === player._id.toString())) {
      return res.status(400).json({ message: 'Player already in team' });
    }

    team.players.push(player._id);

    try {
      await team.save();
      await team.populate('players');
      
      res.json({
        players: team.players,
        totalPoints: team.totalPoints,
        totalValue: team.totalValue,
        budget: team.budget,
        isComplete: team.isComplete
      });
    } catch (validationError) {
      return res.status(400).json({ message: validationError.message });
    }
  } catch (err) {
    console.error('Error in POST /add-player:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/team/remove-player/:playerId
// @desc    Remove a player from user's team
// @access  Private
router.delete('/remove-player/:playerId', auth, async (req, res) => {
  try {
    let team = await UserTeam.findOne({ userId: req.user.id }).populate('players');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Remove player
    team.players = team.players.filter(
      player => player._id.toString() !== req.params.playerId
    );

    await team.save();
    
    res.json({
      players: team.players,
      totalPoints: team.totalPoints,
      totalValue: team.totalValue,
      budget: team.budget,
      isComplete: team.isComplete
    });
  } catch (err) {
    console.error('Error in DELETE /remove-player:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
