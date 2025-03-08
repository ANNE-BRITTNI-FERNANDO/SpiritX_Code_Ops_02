const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Player name is required'],
    trim: true
  },
  university: {
    type: String,
    required: [true, 'University name is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Player role is required'],
    enum: ['Batsman', 'Bowler', 'AllRounder', 'WicketKeeper'],
    trim: true
  },
  matchesPlayed: {
    type: Number,
    default: 0,
    min: [0, 'Matches played cannot be negative']
  },
  // Batting Statistics
  runsScored: {
    type: Number,
    default: 0,
    min: [0, 'Runs scored cannot be negative']
  },
  ballsFaced: {
    type: Number,
    default: 0,
    min: [0, 'Balls faced cannot be negative']
  },
  inningsPlayed: {
    type: Number,
    default: 0,
    min: [0, 'Innings played cannot be negative']
  },
  notOuts: {
    type: Number,
    default: 0,
    min: [0, 'Not outs cannot be negative']
  },
  highestScore: {
    type: Number,
    default: 0,
    min: [0, 'Highest score cannot be negative']
  },
  fifties: {
    type: Number,
    default: 0,
    min: [0, 'Number of fifties cannot be negative']
  },
  hundreds: {
    type: Number,
    default: 0,
    min: [0, 'Number of hundreds cannot be negative']
  },
  ducks: {
    type: Number,
    default: 0,
    min: [0, 'Number of ducks cannot be negative']
  },
  // Bowling Statistics
  wicketsTaken: {
    type: Number,
    default: 0,
    min: [0, 'Wickets taken cannot be negative']
  },
  oversBowled: {
    type: Number,
    default: 0,
    min: [0, 'Overs bowled cannot be negative']
  },
  runsConceded: {
    type: Number,
    default: 0,
    min: [0, 'Runs conceded cannot be negative']
  },
  bestBowlingFigures: {
    wickets: {
      type: Number,
      default: 0,
      min: [0, 'Best bowling wickets cannot be negative']
    },
    runs: {
      type: Number,
      default: 0,
      min: [0, 'Best bowling runs cannot be negative']
    }
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

// Virtual fields for calculated statistics
playerSchema.virtual('battingAverage').get(function() {
  const innings = this.inningsPlayed - this.notOuts;
  return innings > 0 ? (this.runsScored / innings).toFixed(2) : 'N/A';
});

playerSchema.virtual('strikeRate').get(function() {
  return this.ballsFaced > 0 
    ? ((this.runsScored / this.ballsFaced) * 100).toFixed(2) 
    : 'N/A';
});

playerSchema.virtual('bowlingAverage').get(function() {
  return this.wicketsTaken > 0 
    ? (this.runsConceded / this.wicketsTaken).toFixed(2) 
    : 'N/A';
});

playerSchema.virtual('economyRate').get(function() {
  return this.oversBowled > 0 
    ? (this.runsConceded / this.oversBowled).toFixed(2) 
    : 'N/A';
});

playerSchema.virtual('bowlingStrikeRate').get(function() {
  const ballsBowled = Math.floor(this.oversBowled) * 6 + (this.oversBowled % 1) * 10;
  return this.wicketsTaken > 0 
    ? (ballsBowled / this.wicketsTaken).toFixed(2) 
    : 'Undefined';
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;