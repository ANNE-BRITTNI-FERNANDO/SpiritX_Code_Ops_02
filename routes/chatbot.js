const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// Helper function to get player stats without revealing points
const getPlayerStats = (player) => {
  const stats = {
    name: player.name,
    university: player.university,
    role: player.role,
    matchesPlayed: player.matchesPlayed || 0,
    runsScored: player.runsScored || 0,
    wicketsTaken: player.wicketsTaken || 0,
    ballsBowled: player.ballsBowled || 0,
    runsConceded: player.runsConceded || 0,
    value: player.value || 0,
    battingAverage: (player.runsScored && player.inningsPlayed) ? 
      (player.runsScored / Math.max(1, player.inningsPlayed)).toFixed(2) : '0.00',
    bowlingAverage: (player.runsConceded && player.wicketsTaken) ? 
      (player.runsConceded / Math.max(1, player.wicketsTaken)).toFixed(2) : '0.00'
  };

  // Calculate form based on recent performance
  stats.form = calculatePlayerForm(player);
  return stats;
};

// Calculate player's recent form (without using points)
const calculatePlayerForm = (player) => {
  if (!player.matchesPlayed) return 'New player';
  
  const battingForm = player.runsScored / Math.max(1, player.matchesPlayed);
  const bowlingForm = player.wicketsTaken / Math.max(1, player.matchesPlayed);
  
  if (battingForm > 30 || bowlingForm > 2) return 'Excellent';
  if (battingForm > 20 || bowlingForm > 1.5) return 'Good';
  if (battingForm > 10 || bowlingForm > 1) return 'Average';
  return 'Developing';
};

// Helper function to find best possible team with explanations
const findBestTeam = async () => {
  const players = await Player.find();
  
  // Sort players by performance metrics within each role
  const batsmen = players
    .filter(p => p.role === 'Batsman')
    .sort((a, b) => {
      const aAvg = a.runsScored / Math.max(1, a.inningsPlayed);
      const bAvg = b.runsScored / Math.max(1, b.inningsPlayed);
      return bAvg - aAvg;
    });

  const bowlers = players
    .filter(p => p.role === 'Bowler')
    .sort((a, b) => {
      const aAvg = a.wicketsTaken / Math.max(1, a.matchesPlayed);
      const bAvg = b.wicketsTaken / Math.max(1, b.matchesPlayed);
      return bAvg - aAvg;
    });

  const allRounders = players
    .filter(p => p.role === 'All-rounder')
    .sort((a, b) => {
      const aScore = (a.runsScored / Math.max(1, a.inningsPlayed)) + 
                    (a.wicketsTaken * 20 / Math.max(1, a.matchesPlayed));
      const bScore = (b.runsScored / Math.max(1, b.inningsPlayed)) + 
                    (b.wicketsTaken * 20 / Math.max(1, b.matchesPlayed));
      return bScore - aScore;
    });

  const wicketKeepers = players
    .filter(p => p.role === 'WicketKeeper')
    .sort((a, b) => {
      const aAvg = a.runsScored / Math.max(1, a.inningsPlayed);
      const bAvg = b.runsScored / Math.max(1, b.inningsPlayed);
      return bAvg - aAvg;
    });

  // Select best players
  const selectedBatsmen = batsmen.slice(0, 4);
  const selectedBowlers = bowlers.slice(0, 4);
  const selectedAllRounders = allRounders.slice(0, 2);
  const selectedWicketKeeper = wicketKeepers.slice(0, 1);

  // Prepare team analysis
  const teamAnalysis = {
    batsmen: selectedBatsmen.map(p => ({
      ...getPlayerStats(p),
      reason: `Selected for consistent batting performance with an average of ${(p.runsScored / Math.max(1, p.inningsPlayed)).toFixed(2)} runs per innings`
    })),
    bowlers: selectedBowlers.map(p => ({
      ...getPlayerStats(p),
      reason: `Selected for strong bowling record with ${p.wicketsTaken} wickets in ${p.matchesPlayed} matches`
    })),
    allRounders: selectedAllRounders.map(p => ({
      ...getPlayerStats(p),
      reason: `Selected for all-round ability with ${p.runsScored} runs and ${p.wicketsTaken} wickets`
    })),
    wicketKeeper: selectedWicketKeeper.map(p => ({
      ...getPlayerStats(p),
      reason: `Selected as the best performing wicket-keeper with ${p.runsScored} runs in ${p.matchesPlayed} matches`
    }))
  };

  return teamAnalysis;
};

router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ response: "Please provide a query." });
    }

    const queryLower = query.toLowerCase();
    
    // Get all players
    const players = await Player.find();
    if (!players || players.length === 0) {
      return res.json({ 
        response: "I don't have any player data available at the moment. Please try again later." 
      });
    }

    // Handle request for best team
    if (queryLower.includes('best team') || queryLower.includes('best possible team')) {
      const teamAnalysis = await findBestTeam();
      let response = "Here's my recommended team with detailed analysis:\n\n";
      
      response += "BATSMEN:\n";
      teamAnalysis.batsmen.forEach(p => {
        response += `• ${p.name} (${p.university})\n  ${p.reason}\n  Current form: ${p.form}\n\n`;
      });
      
      response += "BOWLERS:\n";
      teamAnalysis.bowlers.forEach(p => {
        response += `• ${p.name} (${p.university})\n  ${p.reason}\n  Current form: ${p.form}\n\n`;
      });
      
      response += "ALL-ROUNDERS:\n";
      teamAnalysis.allRounders.forEach(p => {
        response += `• ${p.name} (${p.university})\n  ${p.reason}\n  Current form: ${p.form}\n\n`;
      });
      
      response += "WICKET-KEEPER:\n";
      teamAnalysis.wicketKeeper.forEach(p => {
        response += `• ${p.name} (${p.university})\n  ${p.reason}\n  Current form: ${p.form}\n`;
      });
      
      return res.json({ response });
    }

    // Handle role-specific queries
    if (queryLower.includes('all-rounder') || queryLower.includes('all rounder')) {
      const allRounders = players.filter(p => p.role === 'All-rounder');
      if (allRounders.length === 0) {
        return res.json({ response: "No all-rounders found in the database." });
      }

      let response = "Here are the all-rounders' performances:\n\n";
      allRounders.forEach(player => {
        const stats = getPlayerStats(player);
        response += `${stats.name} (${stats.university}):\n` +
          `• Batting: ${stats.runsScored} runs (Avg: ${stats.battingAverage})\n` +
          `• Bowling: ${stats.wicketsTaken} wickets (Avg: ${stats.bowlingAverage})\n` +
          `• Form: ${stats.form}\n\n`;
      });
      return res.json({ response });
    }

    // Handle player-specific queries
    let matchedPlayer = null;
    for (const player of players) {
      if (queryLower.includes(player.name.toLowerCase())) {
        matchedPlayer = player;
        break;
      }
    }

    if (matchedPlayer) {
      const stats = getPlayerStats(matchedPlayer);
      
      // Handle specific stat queries
      if (queryLower.includes('wicket')) {
        return res.json({
          response: `${stats.name} has taken ${stats.wicketsTaken} wickets in ${stats.matchesPlayed} matches.\n` +
            `Current form: ${stats.form}`
        });
      }
      
      if (queryLower.includes('batting') || queryLower.includes('runs')) {
        return res.json({
          response: `${stats.name}'s batting statistics:\n` +
            `• Matches: ${stats.matchesPlayed}\n` +
            `• Runs: ${stats.runsScored}\n` +
            `• Average: ${stats.battingAverage}\n` +
            `• Current form: ${stats.form}`
        });
      }
      
      if (queryLower.includes('bowling')) {
        return res.json({
          response: `${stats.name}'s bowling statistics:\n` +
            `• Wickets: ${stats.wicketsTaken}\n` +
            `• Balls Bowled: ${stats.ballsBowled}\n` +
            `• Runs Conceded: ${stats.runsConceded}\n` +
            `• Average: ${stats.bowlingAverage}\n` +
            `• Current form: ${stats.form}`
        });
      }

      // General player info
      return res.json({
        response: `${stats.name} is a ${stats.role} from ${stats.university}.\n\n` +
          `Career Statistics:\n` +
          `• Matches Played: ${stats.matchesPlayed}\n` +
          `• Runs Scored: ${stats.runsScored}\n` +
          `• Wickets Taken: ${stats.wicketsTaken}\n` +
          `• Current Form: ${stats.form}`
      });
    }

    // Handle team selection help
    if (queryLower.includes('help') && queryLower.includes('team')) {
      return res.json({
        response: "Here's how to select your team:\n\n" +
          "1. Team Composition Requirements:\n" +
          "   • 4 Batsmen\n" +
          "   • 4 Bowlers\n" +
          "   • 2 All-rounders\n" +
          "   • 1 Wicket-keeper\n\n" +
          "2. Budget Management:\n" +
          "   • Total budget: 9,000,000 LKR\n" +
          "   • Allocate budget wisely across all roles\n" +
          "   • Consider value for money\n\n" +
          "3. Selection Tips:\n" +
          "   • Look for players in good form\n" +
          "   • Check batting and bowling averages\n" +
          "   • Consider player's experience (matches played)\n" +
          "   • Balance team with both aggressive and consistent players\n\n" +
          "Would you like to:\n" +
          "• See the best possible team?\n" +
          "• Check specific player statistics?\n" +
          "• View all-rounders' performance?"
      });
    }

    // If no specific match found
    return res.json({
      response: "I can help you with:\n" +
        "• Player statistics (e.g., 'Show me Sandun's bowling figures')\n" +
        "• Role-specific performance (e.g., 'Show all-rounders' performance')\n" +
        "• Best possible team ('Show me the best team')\n" +
        "• Team selection help ('Help me select my team')\n\n" +
        "Please try one of these queries!"
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({
      response: "I'm having trouble accessing the player database right now. Please try again in a moment."
    });
  }
});

module.exports = router;
