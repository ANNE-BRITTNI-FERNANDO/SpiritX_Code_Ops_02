const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  university: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Batsman', 'Bowler', 'All-rounder', 'WicketKeeper'],
    set: function(role) {
      // Normalize role names
      const roleMap = {
        'AllRounder': 'All-rounder',
        'Wicket Keeper': 'WicketKeeper',
        'Wicket-Keeper': 'WicketKeeper',
        'All Rounder': 'All-rounder',
        'All-Rounder': 'All-rounder'
      };
      return roleMap[role] || role;
    }
  },
  matchesPlayed: {
    type: Number,
    default: 0
  },
  runsScored: {
    type: Number,
    default: 0
  },
  ballsFaced: {
    type: Number,
    default: 0
  },
  inningsPlayed: {
    type: Number,
    default: 0
  },
  wicketsTaken: {
    type: Number,
    default: 0
  },
  ballsBowled: {
    type: Number,
    default: 0
  },
  runsConceded: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate batting average
playerSchema.methods.calculateBattingAverage = function() {
  if (this.inningsPlayed === 0) return 0;
  return this.runsScored / this.inningsPlayed;
};

// Calculate batting strike rate
playerSchema.methods.calculateBattingStrikeRate = function() {
  if (this.ballsFaced === 0) return 0;
  return (this.runsScored / this.ballsFaced) * 100;
};

// Calculate bowling strike rate
playerSchema.methods.calculateBowlingStrikeRate = function() {
  if (this.wicketsTaken === 0) return undefined;
  return this.ballsBowled / this.wicketsTaken;
};

// Calculate bowling average
playerSchema.methods.calculateBowlingAverage = function() {
  if (this.wicketsTaken === 0) return undefined;
  return this.runsConceded / this.wicketsTaken;
};

// Calculate economy rate
playerSchema.methods.calculateEconomyRate = function() {
  if (this.ballsBowled === 0) return 0;
  const overs = this.ballsBowled / 6; // Convert balls to overs
  return this.runsConceded / overs;
};

// Calculate player points
playerSchema.methods.calculatePoints = function() {
  const battingAverage = this.calculateBattingAverage();
  const battingStrikeRate = this.calculateBattingStrikeRate();
  const economyRate = this.calculateEconomyRate();

  // Calculate batting points: (Batting Strike Rate / 5 + Batting Average × 0.8)
  const battingPoints = (battingStrikeRate / 5) + (battingAverage * 0.8);
  
  // Calculate bowling points
  let bowlingPoints = 0;
  if (this.wicketsTaken > 0) {
    const bowlingStrikeRate = this.ballsBowled / this.wicketsTaken;
    bowlingPoints = (500 / bowlingStrikeRate) + (140 / economyRate);
  } else if (this.ballsBowled > 0) {
    // If no wickets taken but has bowled, only use economy rate component
    bowlingPoints = 140 / economyRate;
  }

  const totalPoints = battingPoints + bowlingPoints;
  return totalPoints;
};

// Calculate player value
playerSchema.methods.calculateValue = function() {
  const points = this.calculatePoints();
  // Value in Rupees = (9 × Points + 100) × 1000
  const value = (9 * points + 100) * 1000;
  // Round to nearest 50,000
  return Math.round(value / 50000) * 50000;
};

// Pre-save middleware to update points and price
playerSchema.pre('save', async function(next) {
  if (this.isModified('runsScored') || 
      this.isModified('ballsFaced') || 
      this.isModified('inningsPlayed') || 
      this.isModified('wicketsTaken') || 
      this.isModified('ballsBowled') || 
      this.isModified('runsConceded')) {
    
    this.points = this.calculatePoints();
    this.price = this.calculateValue();
  }
  next();
});

// Virtual fields for calculated statistics
playerSchema.virtual('battingAverage').get(function() {
  return this.calculateBattingAverage();
});

playerSchema.virtual('battingStrikeRate').get(function() {
  return this.calculateBattingStrikeRate();
});

playerSchema.virtual('bowlingStrikeRate').get(function() {
  const strikeRate = this.calculateBowlingStrikeRate();
  return strikeRate === undefined ? 'Not Available' : strikeRate;
});

playerSchema.virtual('bowlingAverage').get(function() {
  const average = this.calculateBowlingAverage();
  return average === undefined ? 'Not Available' : average;
});

playerSchema.virtual('economyRate').get(function() {
  return this.calculateEconomyRate();
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;