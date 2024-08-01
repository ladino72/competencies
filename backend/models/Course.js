const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const CourseSchema = new Schema({
  name: {
    type: String,
    required: true,
  }, // Name of the course

  description: {
    type: String,
  }, // Description of the course

  c_Id: {
    type: String,
    required: true,
  }, // Identifier of the course

  coordinator: {
    type: ObjectId,
    ref: 'User',
  }, // Coordinator ID for the course

  groups: [
    {
      type: ObjectId,
      ref: 'Group',
    },
  ], // An array of group IDs for the course
});


const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;




