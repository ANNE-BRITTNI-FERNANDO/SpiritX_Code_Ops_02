const mongoose = require('mongoose');

const userTeamSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  totalPoints: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  },
  isComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Validate team composition
userTeamSchema.methods.validateTeamComposition = function() {
  const batsmenCount = this.players.filter(p => p.role === 'Batsman').length;
  const bowlersCount = this.players.filter(p => p.role === 'Bowler').length;
  const allRoundersCount = this.players.filter(p => p.role === 'All-rounder').length;
  const wicketKeepersCount = this.players.filter(p => p.role === 'WicketKeeper').length;

  // Check individual role limits
  if (batsmenCount > 5) {
    throw new Error('Team cannot have more than 5 batsmen');
  }
  if (bowlersCount > 4) {
    throw new Error('Team cannot have more than 4 bowlers');
  }
  if (allRoundersCount > 2) {
    throw new Error('Team cannot have more than 2 all-rounders');
  }
  if (wicketKeepersCount > 1) {
    throw new Error('Team cannot have more than 1 wicket keeper');
  }

  // Team is valid if it reaches here
  return true;
};

// Get team composition stats
userTeamSchema.methods.getTeamComposition = function() {
  return {
    total: this.players.length,
    batsmen: this.players.filter(p => p.role === 'Batsman').length,
    bowlers: this.players.filter(p => p.role === 'Bowler').length,
    allRounders: this.players.filter(p => p.role === 'All-rounder').length,
    wicketKeeper: this.players.filter(p => p.role === 'WicketKeeper').length,
    isComplete: this.players.length === 11
  };
};

// Middleware to populate players and calculate points before save
userTeamSchema.pre('save', async function(next) {
  if (this.isModified('players')) {
    try {
      // Populate players if not already populated
      if (!this.populated('players')) {
        await this.populate('players');
      }

      // Validate team composition
      this.validateTeamComposition();
      
      // Calculate total points and value
      this.totalPoints = this.players.reduce((sum, player) => sum + player.points, 0);
      this.totalValue = this.players.reduce((sum, player) => sum + player.price, 0);
      
      // Check if team is complete (exactly 11 players)
      this.isComplete = this.players.length === 11;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const UserTeam = mongoose.model('UserTeam', userTeamSchema);

module.exports = UserTeam;
