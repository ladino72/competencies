const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const UserRefSchema = new Schema({

  
  email: {
    type: String,
    required: true,
    unique: true
  }, // Email address of the user

  studentId: {
    type: String,
    required: true
  }, // student Id for the user

  
});

const UserRef = mongoose.model('UserRef', UserRefSchema);

module.exports = UserRef;


