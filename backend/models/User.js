const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const UserSchema = new Schema({

  name: {
    type: String,
    required: true
  }, // Name of the user

  email: {
    type: String,
    required: true,
    unique: true
  }, // Email address of the user

  password: {
    type: String,
    required: true
  }, // Password for the user

  roles: {
    type: [String],
    enum: ["student", "teacher", "coordinator", "admin","director"],
    default: ["student"],
    required: true
  }, // Array of roles for the user
  genre: {
    type: [String], // Option 1: String
    enum: ['male', 'female', 'other'], // Option 2: Enumeration
    required: true // Ensure the field has a value
  },
  regCount: {
    type: Number, // Use Number for integers in Mongoose
    default: 3,

  },
  registeredInGroups: [{
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group' // Reference to the Group model
    },
    isActive: Boolean, // Default to true for new registrations
  }],
});

const User = mongoose.model('User', UserSchema);

module.exports = User;


