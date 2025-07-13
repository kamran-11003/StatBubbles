const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  athleteId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  displayName: { type: String, required: true },
  jersey: { type: String },
  position: { type: String },
  teamId: { type: String, required: true },
  teamColor: { type: String },
  teamDisplayName: { type: String },
  headshot: {
    href: { type: String },
    alt: { type: String }
  },
  stats: { type: mongoose.Schema.Types.Mixed, default: {} },
  // Qualification fields
  qualifiedBatting: { type: Boolean, default: false },
  qualifiedFielding: { type: Boolean, default: false },
  qualifiedPitching: { type: Boolean, default: false },
  statsUpdatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for athleteId
playerSchema.index({ athleteId: 1 });

// Index for displayName for search
playerSchema.index({ displayName: 1 });

// Index for teamId
playerSchema.index({ teamId: 1 });

// Compound index for stats sorting (will work with any stat field)
playerSchema.index({ 'stats': 1 });

module.exports = mongoose.model('MLBPlayer', playerSchema); 