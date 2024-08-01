const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the grade schema for self and peer assessments
const gradeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: Schema.Types.ObjectId, ref: 'StudentTopic.questions', required: true },
  givenBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  grades: [{
    type: Number,
    required: true,
    min: 0,
    max: 5
  }],
  timestamp: { type: Date, default: Date.now }
});

// Create the model for the grade
const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade;
