const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');


// @desc User login
// @route POST /login
// @access Public
const loginN = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const existingUser = await User.findOne({ email });

  
      if (!existingUser) {
        return res.status(400).json({ error: 'Invalid credentials.' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid credentials.' });
      }

      const expirationTimeHours = 1// 1 hour
      const expirationTimeSeconds = expirationTimeHours*3600
  
      // If the credentials are valid, generate a new token (https://jwt.io/)
      const user = {id:existingUser._id, name:existingUser.name, roles:existingUser.roles};
      const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: expirationTimeSeconds });
  
      // Return the token and other user data in the response
      res.status(200).json({ token});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  module.exports = {
    loginN,
  };

// When a user signs up, providing a token in the response is typically useful for immediately allowing the user to access protected routes or resources without needing to log in again. It saves an extra step where the user would otherwise have to log in after signing up.

// However, in some applications, sending a token at signup might not be necessary or might pose security risks. Sending a token again at login ensures that the user's authentication information is up-to-date and still valid, even if the user just signed up. It also serves as a confirmation that the user's login credentials are correct and that they're authorized to access the application's resources.

// Additionally, tokens can have different expiration times or scopes based on the use case. Tokens sent during signup might have different permissions or limitations compared to tokens sent during login, offering more control over user access and security.
  