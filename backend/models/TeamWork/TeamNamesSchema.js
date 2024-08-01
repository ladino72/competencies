const mongoose = require('mongoose');
const { Schema } = mongoose;

const TeamNamesSchema = new Schema({
  categories: {
    type: Map,
    of: [String],  // Array of strings for each category
  },
});

// Pre-save hook to ensure categories is always a Map
TeamNamesSchema.pre('save', function (next) {
  if (!(this.categories instanceof Map)) {
    this.categories = new Map();
  }
  next();
});

const TeamNames = mongoose.model('TeamNames', TeamNamesSchema);

module.exports = TeamNames;