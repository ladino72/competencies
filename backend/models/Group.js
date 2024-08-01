const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const GroupSchema = new Schema({
  courseId: {
    type: ObjectId,
    ref: 'Course',
    required: true
  }, // ID of the course that the group belongs to

  teacherId: {
    type: ObjectId,
    ref: 'User',
    required: true
  }, // ID of the teacher assigned to the group

  g_Id: {
    type: String,
    required: true
  }, // Name of the group

  students: [
    {
      type: ObjectId,
      ref: 'User'
    }
  ], // An array of student IDs in the group
  
  activityCounterT1: {
    type: Number,
    default: 0,
  },

  activityCounterT2: {
    type: Number,
    default: 0,
  },
  activityCounterT3: {
    type: Number,
    default: 0,
  },

  classSize: {
    type: Number,
    default: 30,
  },

  activities: [
    {
      type: ObjectId,
      ref: 'Activity'
    }
  ] // An array of activity IDs assigned to the group
});

const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;

