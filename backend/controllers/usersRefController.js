
const UserRef  = require("../models/UserRef")
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const mongoose = require('mongoose');
const { ObjectId } = mongoose;
const { validationResult } = require('express-validator');



// @desc Create new user
// @route POST /users
// @access Private
createNewUserN = asyncHandler(async (req, res) => {
  const users = req.body.users;

  try {
    // Find existing users by email or studentId
    const existingUsers = await UserRef.find({
      $or: [
        { email: { $in: users.map(user => user.email) } },
        { studentId: { $in: users.map(user => user.id) } }
      ]
    });

    const existingEmails = existingUsers.map(user => user.email);
    const newUsers = users.filter(user => !existingEmails.includes(user.email));

    // Insert new users
    const createdUsers = await UserRef.insertMany(newUsers);

    res.status(201).json({ createdUsers, repeatedEmails: existingEmails });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate email error
      res.status(400).json({ error: 'One or more emails are already in use' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});


  

module.exports = {
  
    createNewUserN,
  
}