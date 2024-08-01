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




// @desc 
// @route GET /activities/course/:courseId/term/:term
// @access Private

const getInfoCourseActivitiesByTermN= asyncHandler(async (req, res) => {
  // Validation using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }



try {
  const { courseId, term } = req.params;
 
  // Retrieve teachers and corresponding groups with activity counts for the given term
  const activitiesInfo = await Group.aggregate([
    {
      $match: { courseId: mongoose.Types.ObjectId(courseId) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'teacherId',
        foreignField: '_id',
        as: 'teacher',
      },
    },
    {
      $unwind: '$teacher',
    },
    {
      $lookup: {
        from: 'activities',
        localField: 'activities',
        foreignField: '_id',
        as: 'activities',
      },
    },
    {
      $project: {
        teacher: {
          name: '$teacher.name',
         
        },
        group: '$g_Id',
        description:"$activities.description",
        type: {
          $reduce: {
            input: "$activities.type", // The nested array field
            initialValue: [], // Initialize an empty array
            in: { $concatArrays: ["$$value", "$$this"] } // Concatenate each element to the accumulator
          }
        },
        rubric: {
          $reduce: {
            input: "$activities.rubric", // The nested array field
            initialValue: [], // Initialize an empty array
            in: { $concatArrays: ["$$value", "$$this"] } // Concatenate each element to the accumulator
          }
        },
        applieddate: {
          $map: {
            input: "$activities.activityAppliedDate", // The original dates array
            as: "date", // Alias for each element in the array
            in: {
              $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$$date", timezone: "UTC" } // Convert to desired format
            }
          }
      },
         
        term:term,
        
        activityCount: {
          $size: {
            $filter: {
              input: '$activities',
              as: 'activity',
              cond: { $eq: ['$$activity.term', term] },
            },
          },
        },
      },
    },
  ]);

  res.json({ activitiesInfo });
} catch (err) {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
}
});

// @desc 
// @route GET /activities/course/:courseId/term/:term
// @access Private

const getInfoCourseActivitiesAlltermsN = asyncHandler(async (req, res) => {
  // Validation using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { courseId } = req.params;

    // Retrieve teachers and corresponding groups with activity counts for the given term
    const activitiesInfo = await Group.aggregate([
      {
        $match: { courseId: mongoose.Types.ObjectId(courseId) },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'teacher',
        },
      },
      {
        $unwind: '$teacher',
      },
      {
        $lookup: {
          from: 'activities',
          localField: 'activities',
          foreignField: '_id',
          as: 'activities',
        },
      },
      {
        $unwind: '$activities',
      },
      {
        $match: {
          "activities.completed": true,
        },
      },
      {
        $group: {
          _id: {
            term: "$activities.term",
            group: "$_id",
          },
          teacher: { $first: '$teacher.name' },
          descriptions: { $push: "$activities.description" },
          types: { $push: "$activities.type" },
          rubrics: { $push: "$activities.rubric" },
          activityAppliedDates: {
            $push: {
              $dateToString: {
                format: "%Y-%m-%d %H:%M:%S",
                date: "$activities.activityAppliedDate",
                timezone: "UTC"
              }
            }
          },
          g_Id: { $first: "$g_Id" }
        },
      },
      {
        $sort: { "_id.term": 1 } // Sort by term in ascending order
      },
      {
        $group: {
          _id: "$g_Id",
          teacher: { $first: '$teacher' },
          terms: {
            $push: {
              term: "$_id.term",
              description: "$descriptions",
              type: {
                $reduce: {
                  input: "$types",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this"] }
                }
              },
              rubric: {
                $reduce: {
                  input: "$rubrics",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this"] }
                }
              },
              activityAppliedDate: "$activityAppliedDates",
              activityCount: {
                $reduce: {
                  input: "$rubrics",  //I used rubrics but it could be use types or description.
                  initialValue: 0,
                  in: { $add: ["$$value", { $size: "$$this" }] }
                }
              }
            },
          },
        },
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          _id: 0,
          g_Id: "$_id",
          teacher: 1,
          terms: 1,
        }
      },
    ]);

    res.json({ activitiesInfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});





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

    //To ensure a clean slate before creating a new activity, this code section performs essential cleanup tasks.
    //This part of the code delete all activities with attribute completed=false associated to the teacherId, courseId and groupId BEFORE creating a new activity. 
    //Also delete all student grades associated to this activity and delete the activity from the corresponding groupId. 
    //Please remember that at the moment a new activity is created it is also added to the corresponding gropuId

    // Delete activities and associated grades based on teacherId, courseId, groupId, and completed=false
    const deletedActivities = await Activity.find({ teacherId, courseId, groupId, completed: false });

    // Delete associated grades
    await Grade.deleteMany({ activityId: { $in: deletedActivities.map(activity => activity._id) } });

    // Delete activities
    await Activity.deleteMany({ teacherId, courseId, groupId, completed: false });

    // Delete the deleted activities from the group
    group.activities = group.activities.filter(activityId => !deletedActivities.find(activity => activity._id.equals(activityId)));
    await group.save();
    // End of deleteting activity/////

      

    // Fetch date ranges for terms
    const dateInfo = await DateInfo.findOne();

    // Determine the term for the activity based on the applied date
    let term = '';
    if (activityAppliedDate >= dateInfo.initDateT1 && activityAppliedDate <= dateInfo.endDateT1) {
      term = '1';
      if(group){
        group.activityCounterT1 += 1;
        // Save the updated group with the incremented counter
        await group.save();
       }
    } else if (activityAppliedDate >= dateInfo.initDateT2 && activityAppliedDate <= dateInfo.endDateT2) {
      term = '2';
      if(group){
        group.activityCounterT2 += 1;
        // Save the updated group with the incremented counter
        await group.save();
       }
    } else if (activityAppliedDate >= dateInfo.initDateT3 && activityAppliedDate <= dateInfo.endDateT3) {
      term = '3';
      if(group){
        group.activityCounterT3 += 1;
        // Save the updated group with the incremented counter
        await group.save();
       }
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




// @desc Uddate the completed attribute to true
// @route PUT /activitty
// @access Private

const updateActivityN = asyncHandler(async (req, res) => {
 // Check for validation errors
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
   return res.status(400).json({ errors: errors.array() });
 }

 // Destructure the values from the request body
 const { activityId } = req.params;
 const { completed } = req.body;

 
 try {
   // Find the activity by ID
   const activity = await Activity.findById(activityId);

   // Check if the activity exists
   if (!activity) {
     return res.status(404).json({ error: 'Activity not found' });
   }

   // Update the completed attribute
   activity.completed = completed;

   // Save the updated activity
   await activity.save();

   // Return the updated activity
   return res.json(activity);
 } catch (error) {
   console.error(error);
   return res.status(500).json({ error: 'Internal Server Error' });
 }
});

// @desc Delete activity by Id, it also delete the student grades associated to the activity and the activity from the corresponding group
// @route DELETE /activitty
// @access Private

const deleteActivityN = asyncHandler(async (req, res) => {
  try {
    // Validate the incoming parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { activityId } = req.params;

    // Delete the activity
    const deletedActivity = await Activity.findByIdAndDelete(activityId);
    
    if (!deletedActivity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Delete all grades associated with the activity
    await Grade.deleteMany({ activityId });

    // Remove the activity from the corresponding group
    await Group.updateMany({}, { $pull: { activities: activityId } });

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


    

module.exports = {
  getInfoCourseActivitiesByTermN,
  getInfoCourseActivitiesAlltermsN,
  getActivitiesByTeacherByCourseByGroupAndByTermN,
  getActivitiesByTeacherCourseAllGroupsByTermN,
  getActivitiesByTeacherByCourseAllGroupsAnByAllTermsN,
  createActivityN,
  updateActivityN,
  deleteActivityN


}