const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the individual question schema
const questionSchema = new Schema({
  question_number: { type: Number, required: true },
  question_text: { type: String, required: true }
}, { _id: true });

// Define the topic schema for student, and peer questions
const topicSchema = new Schema({
  topic: { type: String, required: true },
  questions: [questionSchema]
});


// Define the individual question schema
const questionSchemaForTeacher = new Schema({
  grade: { type: Number, required: true, min: 0, max: 5 },
  optionText: { type: String, required: true }
}, { _id: true });


// Define the topic schema for student, and peer questions
const topicSchemaForTeacher = new Schema({
  topic: { type: String, required: true },
  options: [questionSchemaForTeacher ]
});

// Create models for the topics
const TeacherTopic = mongoose.model('TeacherTopic', topicSchemaForTeacher );
const StudentTopic = mongoose.model('StudentTopic', topicSchema);
const PeerTopic = mongoose.model('PeerTopic', topicSchema);

module.exports = { TeacherTopic, StudentTopic, PeerTopic };
