const mongoose = require('mongoose');
const { Schema } = mongoose;
const TeacherTopic= require('./rubricSchema'); // Path to your schema file


// Teacher Question Schema for Workshop
const teacherGroupGradeSchema = new Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherTopic', required: true },
  optionId: { type: mongoose.Schema.Types.ObjectId, required: true }
  //optionText: { type: String, required: true },
  //grade: { type: Number, required: true, min: 0, max: 5 }
});

// Teacher Question Schema for Workshop
const selfPeerGradeSchema = new Schema({
  //topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'PeerTopic', required: true }, //New
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  grade: { type: Number, required: true, min: 0, max: 5 }
});

// Responses Schema for Self and Peer Grades
const selfPeerRespSchema = new Schema({
  topic: { type: String, required: true },
  questions: [selfPeerGradeSchema] // Correctly referencing the embedded schema
});

// Self and Peer Grade Schema with detailed responses
const selfPeerResponseSchema = new Schema({
  peerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responses: [selfPeerRespSchema],
  givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hasSubmitted: { type: Boolean, default: false }
});

// Team Schema
const teamSchema = new Schema({
  name: { type: String, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  self_peer_Grades: [selfPeerResponseSchema],
  teacherGrades: [teacherGroupGradeSchema], // Teacher's grades for each question
  teacherHasSubmitted: { type: Boolean, default: false } // Flag to check if the teacher has submitted their grades
});

// Workshop Schema
const workshopSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  term: { type: Number, default: 1 },
  teams: [teamSchema],
  startDate: { type: Date },
  endDate: { type: Date },
});

// Ensure team names are unique within a workshop
workshopSchema.pre('save', function (next) {
  const workshop = this;
  const teamNames = workshop.teams.map(team => team.name);
  const uniqueTeamNames = [...new Set(teamNames)];

  if (teamNames.length !== uniqueTeamNames.length) {
    return next(new Error('Team names must be unique within the workshop.'));
  }

  next();
});

// Create a compound index on name, course, and term
workshopSchema.index({ name: 1, courseId: 1, term: 1 }, { unique: true });

// Define and export the Workshop model
const Workshop = mongoose.model('Workshop', workshopSchema);

module.exports = Workshop;
