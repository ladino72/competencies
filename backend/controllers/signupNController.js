const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Group = require('../models/Group');
const Course = require('../models/Course');

const asyncHandler = require('express-async-handler');



// @desc get average grade for a specific cp and level
// @route POST/signup
// @access Private


const signUpN = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, genre, selectedGroups } = req.body;


  try {
     

      let existingUser = await User.findOne({ email });

      const salt = await bcrypt.genSalt(10);

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

      const userGroups = await Group.find({ students: existingUser._id });
      const userGroupIds = userGroups.map(group => group._id.toString());

      const groupsToAdd = [];
      const groupsToRemove = [];

      // Remove user from old groups
      for (const groupId of userGroupIds) {
          if (!selectedGroups.includes(groupId)) {
              groupsToRemove.push(groupId);
              const group = await Group.findById(groupId);
              if (group) {
                  group.students = group.students.filter(studentId => studentId.toString() !== existingUser._id.toString());
                  await group.save();
              }
          }
      }

      // Add user to new groups
      for (const groupId of selectedGroups) {
          if (!userGroupIds.includes(groupId)) {
              const group = await Group.findById(groupId);
              if (!group) {
                  return res.status(404).json({ error: `Group with ID ${groupId} not found` });
              }
              if (group.students.length >= group.classSize) {
                  return res.status(400).json({ error: `Group with ID ${group.g_Id} exceeds its capacity` });
              }
              groupsToAdd.push(groupId);
              group.students.push(existingUser._id);
              await group.save();
          }
      }

      const addedToGroups = await Group.find({ _id: { $in: groupsToAdd } });
      const removedFromGroups = await Group.find({ _id: { $in: groupsToRemove } });

      const formattedAddedGroups = addedToGroups.map(group => {
          const { activities, __v, activityCounterT1, activityCounterT2, activityCounterT3, ...rest } = group.toObject();
          return rest;
      });

      const formattedRemovedGroups = removedFromGroups.map(group => {
          const { activities, __v, activityCounterT1, activityCounterT2, activityCounterT3, ...rest } = group.toObject();
          return rest;
      });

      // After successfully saving user information, generate token (https://jwt.io/)
      const user = { id: existingUser._id, name: existingUser.name, roles: existingUser.roles };
      const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '1d' });

      // Return the token along with other data in the response as a part of the response object
      res.status(201).json({ token, addedToGroups: formattedAddedGroups, removedFromGroups: formattedRemovedGroups, regCount: existingUser.regCount });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = {
  signUpN,
};
  