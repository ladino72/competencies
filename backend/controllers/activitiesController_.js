const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Group = require('../models/Group');
const Course = require('../models/Course');
const User = require('../models/User');
const Grade = require('../models/Grade');
const Activity = require('../models/Activity');
const { validationResult } = require('express-validator');
const DateInfo = require("../models/DateInfo")


// @desc Create a new activity
// @route GET /activities/:teacherId/:courseId/:groupId/:term
// @access Private

const getActivitiesByTeacherByCourseByGroupAndByTermN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { teacherId, courseId, groupId, term } = req.params;

    // Validate IDs and term
    if (
      !mongoose.Types.ObjectId.isValid(teacherId) ||
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !['1', '2', '3'].includes(term)
    ) {
      return res.status(400).json({ errors: { term: 'Invalid term or IDs provided' } });
    }

    // Retrieve activities based on teacherId, courseId, groupId, and term
    const activities = await Activity.find({
      teacherId: mongoose.Types.ObjectId(teacherId),
      courseId: mongoose.Types.ObjectId(courseId),
      groupId: mongoose.Types.ObjectId(groupId),
      term: term,
    }).select('description activityAppliedDate rubric type');

   // Fetch additional details for the output
   const [teacher, course, group] = await Promise.all([
    User.findById(teacherId).select('name'), // Fetch teacher name
    Course.findById(courseId).select('c_Id'), // Fetch course c_Id
    Group.findById(groupId).select('g_Id'), // Fetch group g_Id
  ]);

  const totalActivities = activities.length;

  // Respond with the fetched data
  res.json({
    teacher: teacher.name,
    course: course.c_Id,
    group: group.g_Id,
    totalActivities: totalActivities,
    //activities: activities,
  });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
});


// @desc Create a new activity
// @route GET /activities/:teacherId/:courseId/:term
// @access Private

const getActivitiesByTeacherCourseAllGroupsByTermN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { teacherId, courseId, term } = req.params;

    // Validate IDs and term
    if (
      !mongoose.Types.ObjectId.isValid(teacherId) ||
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !['1', '2', '3'].includes(term)
    ) {
      return res.status(400).json({ errors: { term: 'Invalid term or IDs provided' } });
    }

 
    // Find all distinct groups that match the teacher, course, and term
    const groups = await Activity.find({
      teacherId: mongoose.Types.ObjectId(teacherId),
      courseId: mongoose.Types.ObjectId(courseId),
      term,
    }).distinct('groupId');

    const teacher = await User.findById(mongoose.Types.ObjectId(teacherId)).select('name');
    const course = await Course.findById( mongoose.Types.ObjectId(courseId)).select('c_Id');

      // Fetching additional information about the groups along with activities
      const groupsInfo = await Group.aggregate([
        { $match: { _id: { $in: groups } } },
        {
          $lookup: {
            from: 'activities', // Replace 'activities' with your actual activities collection name
            localField: '_id',
            foreignField: 'groupId',
            as: 'activities',
          },
        },
        {
          $project: {
            _id: 0,
            g_Id: 1,
            totalActivities: { $size: '$activities' },
          },
        },
      ]);
  
      // Total activities by teacher
      const totalActivitiesByTeacher = await Activity.countDocuments({
        teacherId: mongoose.Types.ObjectId(teacherId),
        term,
      });
  
      res.json({
        teacher: teacher ? teacher.name : '',
        course: course ? course.c_Id : '',
        groups: groupsInfo.map(({ g_Id, totalActivities }) => ({ g_Id, totalActivities })),
        totalActivitiesByTeacher,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  // @desc Create a new activity
// @route GET /activities/:teacherId/:courseId/:term
// @access Private

const getActivitiesByTeacherByCourseAllGroupsAnByAllTermsN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { teacherId, courseId} = req.params;

    console.log(":::::::::",req.params)

    // Validate IDs and term
    if (
      !mongoose.Types.ObjectId.isValid(teacherId) ||
      !mongoose.Types.ObjectId.isValid(courseId)
      
    ) {
      return res.status(400).json({ errors: { term: 'Invalid term or IDs provided' } });
    }

 
    // Find all distinct groups that match the teacher, course, and term
    const groups = await Activity.find({
      teacherId: mongoose.Types.ObjectId(teacherId),
      courseId: mongoose.Types.ObjectId(courseId)
      
    }).distinct('groupId');

    const teacher = await User.findById(mongoose.Types.ObjectId(teacherId)).select('name');
    const course = await Course.findById( mongoose.Types.ObjectId(courseId)).select('c_Id');

      // Fetching additional information about the groups along with activities
      const groupsInfo = await Group.aggregate([
        { $match: { _id: { $in: groups } } },
        {
          $lookup: {
            from: 'activities', // Replace 'activities' with your actual activities collection name
            localField: '_id',
            foreignField: 'groupId',
            as: 'activities',
          },
        },
        {
          $project: {
            _id: 0,
            g_Id: 1,
            totalActivities: { $size: '$activities' },
          },
        },
      ]);
  
      // Total activities by teacher
      const totalActivitiesByTeacher = await Activity.countDocuments({
        teacherId: mongoose.Types.ObjectId(teacherId)
        
      });
  
      res.json({
        teacher: teacher ? teacher.name : '',
        course: course ? course.c_Id : '',
        groups: groupsInfo.map(({ g_Id, totalActivities }) => ({ g_Id, totalActivities })),
        totalActivitiesByTeacher,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });




// @desc Create a new activity
// @route POST /groups
// @access Private

const createActivityN = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { type, courseId, groupId, teacherId, description, activityAppliedDate, rubric } = req.body;

       // Check if courseId, groupId, and teacherId are valid ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(teacherId)
    ) {
      return res.status(400).json({ errors: 'Invalid IDs' });
    }

    // Check if the course, group, and teacher exist
    const [course, group,teacher] = await Promise.all([
      Course.findById(courseId),
      Group.findById(groupId),
      User.findById(teacherId),
    ]);

    if (!course || !group || !teacher) {
      return res.status(404).json({ errors: 'Course, group, or teacher not found' });
    }

    

    // Delete activities and associated grades based on teacherId, courseId, groupId, and completed=false
    await Promise.all([
      Activity.deleteMany({ teacherId, courseId, groupId, completed: false }),
      Grade.deleteMany({ activityId: { $in: group.activities } }),
    ]);

    console.log("Info to delete activities::::", teacherId, courseId,groupId)

    // Fetch date ranges for terms
    const dateInfo = await DateInfo.findOne();

    // Determine the term for the activity based on the applied date
    let term = '';
    if (activityAppliedDate >= dateInfo.initDateT1 && activityAppliedDate <= dateInfo.endDateT1) {
      term = '1';
    } else if (activityAppliedDate >= dateInfo.initDateT2 && activityAppliedDate <= dateInfo.endDateT2) {
      term = '2';
    } else if (activityAppliedDate >= dateInfo.initDateT3 && activityAppliedDate <= dateInfo.endDateT3) {
      term = '3';
    } else {
      return res.status(400).json({ errors: 'Invalid activityAppliedDate' });
    }

    // Create a new activity with the determined term
    const newActivity = new Activity({
      type,
      courseId,
      groupId,
      teacherId,
      description,
      activityAppliedDate,
      rubric,
      term,
    });

    // Save the new activity
    const savedActivity = await newActivity.save();

    // Add the activity to the group
    group.activities.push(savedActivity._id);
    await group.save();

    // Respond with the created activity
    res.status(201).json(savedActivity);
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({ errors: validationErrors });
    }

    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// @desc Create a new activity
// @route GET /activities/:teacherId/:courseId/:groupId/:term
// @access Private

const getTeachersWithoutActivitiesN= asyncHandler(async (req, res) => {
  // Validation using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

const { courseId, term } = req.params;
console.log("::::::(((())))::::")

try {
  // Fetch groups based on courseId
  const groups = await Group.aggregate([
    { 
      $match: { courseId: mongoose.Types.ObjectId(courseId) } 
    },
    {
      $lookup: {
        from: 'activities',
        localField: '_id',
        foreignField: 'groupId',
        as: 'activities',
      },
    },
    {
      $project: {
        _id: 0,
        teacherId: 1,
        activitiesCount: { $size: "$activities" } // Calculate the size of 'activities'
      },
    },
    {
      $match: {
        activitiesCount: { $eq: 0 } // Filter groups with zero activities
      }
    }
  ]);


  // Extract teacher IDs from groups without activities
  const teacherIds = groups.map((group) => group.teacherId.toString());

  // Fetch all teachers
  const allTeachers = await User.find({ roles: 'teacher' });

  // Find corresponding teachers based on teacher IDs
  const teachersWithoutActivities = allTeachers
    .filter((teacher) => teacherIds.includes(teacher._id.toString()))
    .map((teacher) => {
      // Find groups associated with each teacher
      const associatedGroups = groups.filter(
        (group) => group.teacherId.toString() === teacher._id.toString()
      );

      // Extract group details for each teacher
      const groupsInfo = associatedGroups.map((group) => ({
        g_Id: group.g_Id,
        courseId: group.courseId,
        // Add other group details as needed
      }));

      return {
        name: teacher.name,
        groups: groupsInfo,
      };
    });

  res.json({ teachers: teachersWithoutActivities });
} catch (error) {
  res.status(500).json({ message: error.message });
}
})
    

module.exports = {
  getActivitiesByTeacherByCourseByGroupAndByTermN,
  getActivitiesByTeacherCourseAllGroupsByTermN,
  getActivitiesByTeacherByCourseAllGroupsAnByAllTermsN,
  createActivityN,
  getTeachersWithoutActivitiesN,

}