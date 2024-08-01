const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const ActivitySchema = new Schema({

  
  type: {
    type: [String],
    enum: ["quiz", "tarea", "taller", "presentación","informe","problemas","examen"],
    default: ["quiz"],
    required: true
  },  

  courseId: {
    type: ObjectId,
    ref: 'Course',
    required: true
  }, // ID of the course that the activity belongs to

  groupId: {
    type: ObjectId,
    ref: 'Group',
    required: true
  }, // ID of the group that the activity is assigned to

  teacherId: {
    type: ObjectId,
    ref: 'User',
    required: true
  }, // ID of the teacher who created the activity

 
  description: {
    type: String,
    required: true
  }, // Description of the activity

  activityAppliedDate: {
    type: Date,
    required: true
  }, // Due date for the activity

//https://www.studocu.com/co/document/universidad-de-pamplona/etica/rubrica-de-valoracion-ciencias-naturales-y-educacion-ambiental-9o/23585837
  rubric: {
    type: [String],
    enum: ["specific", "holistic"],
    default: ["specific"],
    required: true
  }, // Array of roles for the activity

  completed:{
    type:Boolean,
    default:false
  },

  term:{
    type:String,
    required:true
  }


});



const Activity = mongoose.model('Activity', ActivitySchema);

module.exports = Activity;

