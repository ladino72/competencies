const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Group = require('../models/Group');
const Course = require('../models/Course');
const User = require('../models/User');
const Grade = require('../models/Grade');
const { validationResult } = require('express-validator');


// @desc Create a new group
// @route GET /groups
// @access Private

const getAllStudentsInAGroupsByTeacherAndCourseN = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
   
    const { teacherId, courseId } = req.params;

    // Find the group that matches the teacherId and courseId
    const group = await Group.findOne({ teacherId, courseId });

    if (!group) {
      return res.status(404).json({ message: 'No group found for this teacher and course combination' });
    }

    // Get the students in the found group
    const students = await User.find({ _id: { $in: group.students } } ,{password:0, __v:0, roles:0})

    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found in this group' });
    }

    res.status(200).json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc Create a new group
// @route POST /groups
// @access Private

const createGroupN = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
    try {
        const { courseId, teacherId, g_Id } = req.body;
    
        // Check if courseId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          return res.status(400).json({ error: 'Invalid courseId' });
        }
    
        // Check if teacherId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
          return res.status(400).json({ error: 'Invalid teacherId' });
        }
    
        // Check if the course and teacher exist
        const [existingCourse, existingTeacher] = await Promise.all([
          Course.findById(courseId),
          User.findById(teacherId)
        ]);
    
        if (!existingCourse) {
          return res.status(404).json({ error: 'Course not found with the provided courseId' });
        }
    
        if (!existingTeacher || existingTeacher.roles[0] !== 'teacher') {
          return res.status(404).json({ error: 'Teacher not found with the provided teacherId' });
        }
    
        // Check if a group with the same g_Id already exists for the course
        const existingGroup = await Group.findOne({ courseId, g_Id });
        if (existingGroup) {
          return res.status(400).json({ error: 'Group with the same g_Id already exists for the course' });
        }
    
        // Create a new group
        const newGroup = new Group({
          courseId,
          teacherId,
          g_Id,
          students: [], // Initially an empty array
          activities: [] // Initially an empty array
        });
    
        // Save the new group
        const savedGroup = await newGroup.save();
    
        // Update the course with the new group
        existingCourse.groups.push(savedGroup._id);
        await existingCourse.save();
    
        // Respond with the created group
        res.status(201).json(savedGroup);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

// @desc Delete group
// @route DELETE/groups
// @access Private

const deleteGroupN = asyncHandler(async (req, res) => {
        
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }     

  try {
    const { groupId } = req.params;

    // Check if groupId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: 'Invalid groupId' });
    }

    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found with the provided groupId' });
    }

    // Find the corresponding course
    const course = await Course.findOne({ groups: group._id });
    if (!course) {
      return res.status(404).json({ error: 'Corresponding course not found for the group' });
    }

    // Remove the group from the course
    course.groups.pull(group._id);
    await course.save();

    // Remove the group
    await Group.findByIdAndRemove(groupId);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// @desc Create a new group
// @route POST/groups/add-to-group/
// @access Private

const AddExistingStudentToGroupN = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, groupId } = req.body;

    // Check if the student and group exist
    const student = await User.findById(studentId);
    const group = await Group.findById(groupId);

    if (!student || !group) {
      return res.status(404).json({ message: 'Student or Group not found' });
    }

    // Find the student's current group
    const studentCurrentGroup = await Group.findOne({ courseId: group.courseId, students: studentId });

    // If the student is in a different group within the same course, remove them from that group along with associated grades
    if (studentCurrentGroup && !studentCurrentGroup._id.equals(groupId)) {
      const index = studentCurrentGroup.students.indexOf(studentId);
      if (index !== -1) {
        // Remove the student ID from the old group
        studentCurrentGroup.students.splice(index, 1);

        // Remove associated grades of the student from the old group
        await Grade.deleteMany({ studentId, activityId: { $in: studentCurrentGroup.activities } });

        await studentCurrentGroup.save();
      }
    }

    // Check if the student is already in the group
    const isStudentInGroup = group.students.some((id) => id.equals(studentId));
    if (isStudentInGroup) {
      return res.status(400).json({ message: 'Student is already in the group' });
    }

    // Add student to the new group
    group.students.push(studentId);
    await group.save();

    res.status(200).json({ message: 'Student added to the group successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

    

module.exports = {
    getAllStudentsInAGroupsByTeacherAndCourseN,
    createGroupN,
    deleteGroupN,
    AddExistingStudentToGroupN
}