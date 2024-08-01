const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const GradeSchema = new Schema({
  studentId: {
    type: ObjectId,
    ref: 'User',
    required: true
  }, // ID of the student who received the grade

  activityId: {
    type: ObjectId,
    ref: 'Activity',
    required: true
  }, // ID of the activity that the grade is for
  isValidGrade: {
    type: Boolean,
    default: true
  }, 

  scores: [{
    n1: { type: String, default: '' },
    n2: { type: String, default: '' },
    n3: { type: String, default: '' },
    cp: { type: String, default: 'CL' },
    checked: { type: Boolean, default: false }
  },
  {
    n1: { type: String, default: '' },
    n2: { type: String, default: '' },
    n3: { type: String, default: '' },
    cp: { type: String, default: 'UTF' },
    checked: { type: Boolean, default: false }
  },

  {
    n1: { type: String, default: '' },
    n2: { type: String, default: '' },
    n3: { type: String, default: '' },
    cp: { type: String, default: 'PRC' },
    checked: { type: Boolean, default: false }
  },
  {
    n1: { type: String, default: '' },
    n2: { type: String, default: '' },
    n3: { type: String, default: '' },
    cp: { type: String, default: 'UCM' },
    checked: { type: Boolean, default: false }
  },
  {
    n1: { type: String, default: '' },
    n2: { type: String, default: '' },
    n3: { type: String, default: '' },
    cp: { type: String, default: 'ULC' },
    checked: { type: Boolean, default: false }
  }]


  
});

const Grade = mongoose.model('Grade', GradeSchema);

module.exports = Grade;

