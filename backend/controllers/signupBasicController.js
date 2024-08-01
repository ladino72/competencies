const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const UserRef = require('../models/UserRef')
const asyncHandler = require('express-async-handler');



// @desc get average grade for a specific cp and level
// @route POST/signupBasic
// @access Private


const signupBasic = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { name, email, password, studentId, genre} = req.body;
     
    try {
      // Check if the email and studentId match in UserRef
     const userRef = await UserRef.findOne({ email,studentId });
        if (!userRef) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }


      let existingUser = await User.findOne({ email });

      const salt = await bcrypt.genSalt(10)
  
      // If it's the first-time user registration, save the user
      if (!existingUser) {
        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, salt);
  
        const newUser = new User({
          name,
          email,
          password: hashedPassword,
          genre,
        });

  
        existingUser = await newUser.save();
      } else {
        // For subsequent requests:
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  
        if (!isPasswordValid || existingUser.email !== email) {
          return res.status(400).json({ error: 'Invalid credentials.' });
        }
      }

      // Check the user's regCount field
    if (existingUser.regCount <= 0) {
      return res.status(403).json({ error: 'No changes allowed. Limit reached.' });
    }

    // Decrement regCount by 1
    existingUser.regCount -= 1;
    await existingUser.save();
  
      // After successfully saving user information. Generate token  (https://jwt.io/)
      const user = {id:existingUser._id,name:existingUser.name,roles:existingUser.roles};
      
      const expirationTimeHours = 1   // Time in hours
      const expirationTimeSeconds = expirationTimeHours*3600

      const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: expirationTimeSeconds });
     // Return the token along with other data 
      res.status(201).json({ token, regCount:existingUser.regCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
  
  


  module.exports = {
    signupBasic,
}
  