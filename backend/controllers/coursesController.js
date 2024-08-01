const express = require('express');
const Course = require('../models/Course'); // Assuming the Course model is defined in Course.js
const Group = require('../models/Group'); // Assuming the Group model is defined in Group.js
const User = require('../models/User'); // Assuming the User model is defined in User.js
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const router = express.Router();
const asyncHandler = require('express-async-handler');


// @desc Create new course
// @route GET /courses
// @access Private
const getAllCoursesAndGroupsN = asyncHandler(async (req, res) => {
  try {
    // Fetch courses with groups data
    const coursesWithGroups = await Course.find({}).populate('groups', 'g_Id');

    // Initialize an empty object to store the formatted data
    const formattedData = {};

    // Loop through coursesWithGroups to structure the data
    coursesWithGroups.forEach((course) => {
      const courseId = course.c_Id;
      formattedData[courseId] = course.groups.map((group) => ({
        //id: `${courseId}${group.g_Id.slice(-2)}`,
        id: group._id,
        g_Id: group.g_Id.slice(-2),
      }));
    });

    // Send the response
    res.status(200).json(formattedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// @desc get all groups for a course
// @route GET /courses
// @access Private
const getAllGroupsForACourseN = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId } = req.params;

    console.log("----------courseId---------",courseId)

    // Find groups that belong to the given courseId, excluding unnecessary fields
    const groups = await Group.find({ courseId }, { activities: 0, __v: 0 })
      .populate('teacherId', 'name') // Populate the teacher's name
      .populate('courseId', 'c_Id') // Populate the course ID
      .populate('students', 'name'); // Populate the students' names

    if (!groups || groups.length === 0) {
      return res.status(404).json({ message: 'No groups found for this course ID' });
    }


      // // Assuming you have a Group model Just for exploring
      // const groupsN = await Group.find({})
      //   .populate('students'); // Populate the 'students' field with User data

      // // Log the retrieved groups
      // console.log(groupsN);


    // Constructing the desired response
    const formattedGroups = groups.map(group => ({
      g_Id: group.g_Id,
      teacher: group.teacherId.name,
      c_Id: group.courseId.c_Id,
      students: group.students.map(student => student.name), // Extracting student names
      num_students:group.students.length
    }));

    res.status(200).json({ groups: formattedGroups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc Create new course
// @route POST /courses
// @access Private
const createNewCourseN = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }     
  try {
    const { name, c_Id, coordinator } = req.body;

    // Check if the course already exists by name
    const existingCourse = await Course.findOne({ name });
    if (existingCourse) {
        return res.status(400).json({ error: 'Course with the same name already exists' });
    }

    // Check if coordinatorId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(coordinator)) {
        return res.status(400).json({ error: 'Invalid coordinatorId' });
    }

    // Create a new course
    const newCourse = new Course({
        name,
        c_Id,
        coordinator,
        groups: [], // Initialize as an empty array
    });

    // Save the new course
    const savedCourse = await newCourse.save();

    res.status(201).json(savedCourse);
} catch (error) {
    // Handle other errors
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
}
});

// @desc Create new course
// @route PUT /courses
// @access Private
const updateCourseN = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.params;
        const { coordinatorId, name, c_Id, description } = req.body;
    
        // Check if courseId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          return res.status(400).json({ error: 'Invalid courseId' });
        }
    
        // Check if coordinatorId is a valid ObjectId
        if (coordinatorId && !mongoose.Types.ObjectId.isValid(coordinatorId)) {
          return res.status(400).json({ error: 'Invalid coordinatorId' });
        }
    
        // Check if the course exists
        const existingCourse = await Course.findById(courseId);
        if (!existingCourse) {
          return res.status(404).json({ error: 'Course not found with the provided courseId' });
        }
    
        // Check if the new coordinator exists
        if (coordinatorId) {
            const existingCoordinator = await User.findById(coordinatorId);
        
            // Check if the coordinator exists and has at least the 'coordinator' role
            if (!existingCoordinator || !existingCoordinator.roles.includes('coordinator')) {
            return res.status(404).json({ error: 'Coordinator not found with the provided coordinatorId' });
            }
        
            // Update the course with the new coordinator
            existingCourse.coordinator = coordinatorId;
        }
    
        // Update other fields if provided
        if (name) {
          existingCourse.name = name;
        }
    
        if (c_Id) {
          existingCourse.c_Id = c_Id;
        }
    
        if (description) {
          existingCourse.description = description;
        }
    
        // Save the updated course
        const updatedCourse = await existingCourse.save();
    
        // Respond with the updated course
        res.json(updatedCourse);
      } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
          const validationErrors = {};
          for (const field in error.errors) {
            validationErrors[field] = error.errors[field].message;
          }
          return res.status(400).json({ errors: validationErrors });
        }
    
        // Handle other errors
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

 // @desc Create new course
// @route GET /courses
// @access Private
const getCoursesByMnemonicN = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { mnemonic } = req.body;
      const courses = await Course.find({ c_Id:mnemonic }, { name: 1, c_Id: 1, _id: 1 }).lean(); // Projection to include only 'name' and 'c_Id' and .lean() is used at the end of the query to get plain JavaScript objects instead of Mongoose documents.
      res.json(courses);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);
 
// @desc Get all courses
// @route GET /courses
// @access Private
const getAllCoursesN = asyncHandler(async (req, res) => {
  try {
    const courses = await Course.find({}, { name: 1, c_Id: 1, _id: 1 }).lean();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc Create new course
// @route GET /courses
// @access Private
const getCourseByCoordinatorIdN = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { coordinatorId } = req.params;

    const courses = await Course.aggregate([
      {
        $match: {
          coordinator: mongoose.Types.ObjectId(coordinatorId),
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
        }
      }
    ]);

    if (!courses.length) { // Check for empty array
      return res.status(404).json({ error: 'No courses found for the coordinator Id' });
    }

    res.status(200).json({ courses });  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// @desc get all groups for a course
// @route GET /courses
// @access Private
const getAllTeachersForACourseN = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId } = req.params;

    const teachers = await Group.aggregate([
      {
        $match: {
          courseId: mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $group: {
          _id: '$user._id',
          name: { $first: '$user.name' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
        },
      },
    ]);

    res.status(200).json({ teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

const  getCoursesStudentRegisteredInN = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.params.userId;

    // Aggregate pipeline to find the courses of a student
    const courses = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } }, // Match user by ID
      { $unwind: "$registeredInGroups" }, // Unwind the array
      { $lookup: { // Perform a left outer join with Group collection
          from: "groups",
          localField: "registeredInGroups.groupId",
          foreignField: "_id",
          as: "group"
        }
      },
      { $unwind: "$group" }, // Unwind the group array
      { $lookup: { // Perform a left outer join with Course collection
          from: "courses",
          localField: "group.courseId",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" }, // Unwind the course array
      { $project: { // Project only required fields
        _id:0,
          "course.name": 1,
          "course._id":1,
          "course.c_Id": 1,
          
        }
      }
    ]);

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const getCourseIdsByteacherIdN = asyncHandler(async (req, res) => {
 // Handle validation errors
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
   return res.status(400).json({ errors: errors.array() });
 }

 const { teacherId } = req.params;

 try {
   // Find all groups assigned to the teacher
   const groups = await Group.find({ teacherId }).select('courseId').populate('courseId', 'name');

   // Extract unique course IDs from the groups
   const courseIds = [...new Set(groups.map(group => group.courseId._id.toString()))];

   // Find all courses by their IDs
   const courses = await Course.find({ _id: { $in: courseIds } }).select('name');

   // Format the response
   const response = courses.map(course => ({
     name: course.name,
     _id: course._id
   }));

   res.status(200).json({courses:response});
 } catch (error) {
   console.error('Error fetching courses:', error);
   res.status(500).json({ error: 'Server error' });
 }
});
    

module.exports = {
    getAllCoursesAndGroupsN,
    getAllGroupsForACourseN,
    createNewCourseN,
    updateCourseN,
    getCoursesByMnemonicN,
    getAllCoursesN,

    getCourseByCoordinatorIdN,

    getAllTeachersForACourseN,
    getCoursesStudentRegisteredInN,
    getCourseIdsByteacherIdN

    

}