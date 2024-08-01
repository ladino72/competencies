const Activity = require('../models/Activity');
const Course = require('../models/Course');
const DateInfo = require('../models/DateInfo');
const Group = require('../models/Group');
const User = require('../models/User');
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;






// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    // Get all users from MongoDB
    const users = await User.find().select('-password').lean()


    // If no users 
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    res.json(users)
})


// @desc Update a user
// @route PUT/users
// @access Private
const updateUserN = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, password, roles } = req.body;

              
        //if you're encountering a TypeError: ObjectId.isValid is not a function, it might be because isValid is not a direct function on the ObjectId itself.
        // Instead, it's a method provided by the mongoose library.

        // Check if userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        // Check if the user exists
        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404).json({ error: 'User not found with the provided userId' });
        }

        // Update user fields
        existingUser.name = name || existingUser.name;
        existingUser.email = email || existingUser.email;

        // Update the password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            existingUser.password = hashedPassword;
        }

        // Update roles if provided
        existingUser.roles = roles || existingUser.roles;

        // Save the updated user
        const updatedUser = await existingUser.save();

        // Respond with the updated user
        res.json(updatedUser);
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

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }

    // Does the user still have assigned notes?
    const note = await Note.findOne({ user: id }).lean().exec()
    if (note) {
        return res.status(400).json({ message: 'User has assigned notes' })
    }

    // Does the user exist to delete?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUserN = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, roles } = req.body;

        // Check if the user already exists with the provided email
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            roles
        });

        // Save the new user
        const savedUser = await newUser.save();

        // Respond with the created user
        res.status(201).json(savedUser);
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

//-------------------------------------------------------------------------
// @desc Create new user
// @route POST /users
// @access Private
const getTeacher_CoursesGroupsActivitiesByCurrentTimeN = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  try {
      const { teacherId } = req.params;

      // Find the date info based on the current time
      const currentDate = new Date();
      const dateInfo = await DateInfo.findOne({
          $or: [
              { initDateT1: { $lt: currentDate }, endDateT1: { $gt: currentDate } },
              { initDateT2: { $lt: currentDate }, endDateT2: { $gt: currentDate } },
              { initDateT3: { $lt: currentDate }, endDateT3: { $gt: currentDate } },
          ],
      });

      if (!dateInfo) {
          return res.status(404).json({ msg: 'No active term found' });
      }

      // Determine the current term based on the date
      let term;
      if (dateInfo.initDateT1 < currentDate && currentDate < dateInfo.endDateT1) {
          term = '1';
      } else if (dateInfo.initDateT2 < currentDate && currentDate < dateInfo.endDateT2) {
          term = '2';
      } else if (dateInfo.initDateT3 < currentDate && currentDate < dateInfo.endDateT3) {
          term = '3';
      }

      // Use MongoDB Aggregation to fetch courses and groups
      const result = await Course.aggregate([
          {
              $lookup: {
                  from: 'groups',
                  localField: '_id',
                  foreignField: 'courseId',
                  as: 'groups',
              },
          },
          {
              $unwind: '$groups',
          },
          {
              $match: {
                  'groups.teacherId': ObjectId(teacherId),
              },
          },
          {
              $lookup: {
                  from: 'activities',
                  localField: 'groups._id',
                  foreignField: 'groupId',
                  as: 'activities',
              },
          },
          {
              $lookup: {
                  from: 'users',
                  localField: 'groups.students',
                  foreignField: '_id',
                  as: 'students',
              },
          },
          {
            $addFields: {
                'groups.activityCount': { $size: '$activities' },
                'activeStudents': {
                    $filter: {
                        input: '$students',
                        as: 'student',
                        cond: {
                            $and: [
                                { $in: ['$$student._id', '$groups.students'] }, // Check if student _id is in the array of group students
                                { $eq: [{ $arrayElemAt: ["$$student.registeredInGroups.isActive", 0] }, true] } // Check if the student's isActive property is true
                            ]
                        }
                    }
                }
            }
        },
        //Also works!
        // {
        //     $addFields: {
        //       'groups.activityCount': { $size: '$activities' },
        //       'activeStudents': {
        //         $filter: {
        //           input: '$students',
        //           as: 'student',
        //           cond: {
        //             $and: [
        //               { $in: ['$$student._id', '$groups.students'] }, // Check if student is in group
        //               { $ne: [{ $indexOfArray: ['$groups.students', '$$student._id'] }, -1] }, // Check if student is found in group
        //               { $in: [{ $toString: '$$student._id' }, { $map: { input: '$groups.students', as: 'grpStudent', in: { $toString: '$$grpStudent' } } }] }, // Convert student ID to string for comparison
        //               { $gte: [{ $indexOfArray: ['$groups.students', '$$student._id'] }, 0] }, // Check if student is found in the group array
        //               { $isArray: '$$student.registeredInGroups' }, // Check if registeredInGroups is an array
        //               { $gt: [{ $size: { $ifNull: ['$$student.registeredInGroups', []] } }, 0] }, // Check if registeredInGroups array is not empty
        //               { $gt: [{ $size: { $filter: { input: '$$student.registeredInGroups', as: 'reg', cond: '$$reg.isActive' } } }, 0] } // Check if any registration of the student is active
        //             ]
        //           }
        //         }
        //       }
        //     }
        //   },
          {
            $project: {
                _id: 1,
                name: 1,
                'groups._id': 1,
                'groups.g_Id': 1,
                'groups.students': {
                    $map: {
                        input: '$activeStudents',
                        as: 'student',
                        in: {
                            'id': '$$student._id',
                            'name': '$$student.name',
                        },
                    },
                },
                'groups.activityCount': 1,
                'groups.activities': {
                    $map: {
                        input: '$activities',
                        as: 'activity',
                        in: {
                            'id': '$$activity._id',
                            'type': '$$activity.type',
                        },
                    },
                },
                // 'activeStudents': {
                //     $map: {
                //         input: '$activeStudents',
                //         as: 'student',
                //         in: {
                //             'id': '$$student._id',
                //             'name': '$$student.name',
                //         },
                //     },
                // },
            },
        },
        {
            $unset: ['groups.students._id', 'students'] // Unset unnecessary fields
        }
      ]);

      // Return the result
      res.json({ term, courses: result });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});




const getCourses_GroupsOfATeacherN = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { teacherId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ error: 'Invalid teacher ID' });
      }
  
      // Aggregation pipeline with a lookup stage
      const pipeline = [
        {
          $match: {
            teacherId: mongoose.Types.ObjectId(teacherId),
          },
        },
        {
          $lookup: {
            from: 'courses', // Collection name for courses
            localField: 'courseId', // Field in Group referencing Course
            foreignField: '_id', // Field in Course referencing Group
            as: 'courses', // Name for the joined course data
            pipeline: [
              {
                $lookup: {
                  from: 'groups', // Collection name for groups
                  localField: '_id', // Field in Course referencing Group
                  foreignField: 'courseId', // Field in Group referencing Course
                  as: 'groups', // Name for the joined group data
                  pipeline: [
                    {
                      $project: {
                        activityCounterT1: 0,
                        activityCounterT2: 0,
                        activityCounterT3: 0,
                        students: 0,
                        activities: 0,
                        classSize: 0,
                        courseId: 0,
                        teacherId: 0,
                        __v: 0
                      }
                    }
                  ]
                }
              },
              {
                $project: {
                  description: 0,
                  coordinator: 0,
                  __v: 0
                }
              }
            ]
          }
        },
        {
          $unwind: '$courses',
        },
        {
          $group: {
            _id: '$courses._id',
            course: { $first: '$courses' } // Group by unique courseId (Avoiding reapeated courses)
          }
        },
        {
          $replaceRoot: { newRoot: '$course' }
        }
      ];
  
      const result = await Group.aggregate(pipeline);
  
      // Return courses within groups
      res.json({ courses: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


module.exports = {
    getAllUsers,
    createNewUserN,
    updateUserN,
    deleteUser,
    getTeacher_CoursesGroupsActivitiesByCurrentTimeN,
    getCourses_GroupsOfATeacherN

}