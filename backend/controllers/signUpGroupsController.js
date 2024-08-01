const express = require('express');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Group = require('../models/Group');
const asyncHandler = require('express-async-handler');



// @desc User enters groups
// @route POST/signUpGroups
// @access Private


const signUpGroups= asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { selectedGroups } = req.body;
    const userId = req.user.user.id; // Assuming the authenticated user ID is available in the request
    const user = await User.findOne({_id: userId })
  
  
    try {

      const userGroups = await Group.find({ students: userId });
      const userGroupIds = userGroups.map(group => group._id.toString());

 
      const groupsToAdd = [];
      const groupsToRemove = [];


  
      // Remove user from old groups
      for (const groupId of userGroupIds) {
        if (!selectedGroups.includes(groupId)) {
          groupsToRemove.push(groupId);
          const group = await Group.findById(groupId);
          if (group) {
            group.students = group.students.filter(studentId => studentId.toString() !== userId.toString());
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
          group.students.push(userId);
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

      //Add groups to the user
      //Before making changes to the registerdInGroups we need to clean this array
     
     // Clear registeredInGroups array and retrieve the updated user
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { registeredInGroups: [] } },
        { new: true } // Return updated document
      );

      console.log("updatedUser::::::",updatedUser)
      // Concatenate new groups with cleaned user's registeredInGroups
      const updatedRegisteredInGroups = updatedUser.registeredInGroups.concat(
        selectedGroups.map((group) => ({ groupId: group, isActive: true }))
      );

      console.log("groupsToAdd::::::",selectedGroups)
      console.log("updatedRegisteredInGroups::::::",updatedRegisteredInGroups)
      
      // Update user with new registeredInGroups
      const finalUpdatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { registeredInGroups: updatedRegisteredInGroups } },
        { new: true } // Return updated document
      );
      console.log("finalUpdatedUser::::::",finalUpdatedUser) 
      
      //res.status(201).json({ regCount:existingUser.regCount });
      res.status(200).json({ addedToGroups: formattedAddedGroups, removedFromGroups: formattedRemovedGroups, regCount:user.regCount });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
  
  


  module.exports = {
    signUpGroups,
}
  