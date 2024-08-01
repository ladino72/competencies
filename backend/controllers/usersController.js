const User = require('../models/User')
const Course = require('../models/Course')
const Group = require('../models/Group')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const mongoose = require('mongoose');
const { ObjectId } = mongoose;
const { validationResult } = require('express-validator');



// @desc Get all users depending on their role: student, teacher, coordinator, director or admin
// @route GET /users
// @access Public
const getUsersByRole = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.query;

    // Fetch users based on the provided role
    const users = await User.find({ roles: role }, { password: 0, genre:0,regCount:0,__v:0,email:0,roles:0, registeredInGroups:0 }); // Excluding the password and ... fields

    if (!users || users.length === 0) {
        return res.status(404).json({ msg: 'No users found for the provided role' });
    }

    res.json(users);
} catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server Error');
}
});


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
const deleteUserN = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { usersToDelete } = req.body;

    const deletedUsers = await User.deleteMany({ _id: { $in: usersToDelete } });

    if (deletedUsers.deletedCount === 0) {
      return res.status(404).json({ message: 'No users found to delete' });
    }

    res.status(200).json({ message: `Users deleted successfully`, deletedUsers });
  } catch (error) {
    console.error('Error deleting users:', error);
    res.status(500).json({ error: 'Something went wrong during user deletion' });
  }
}
);

// @desc Create new user
// @route POST /users
// @access Private
createNewUserN = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, roles,genre } = req.body;

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
            roles,
            genre
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

// @desc Create new user
// @route POST /users
// @access Private
addUsersN = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { users } = req.body;
  
    try {
      const addedUsers = [];
  
      for (const user of users) {
        const existingUser = await User.findOne({ email: user.email });
  
        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          user.password = hashedPassword;
  
          const newUser = await User.create(user);
          // Exclude fields from the output
          addedUsers.push({
            name: user.name, 
            message: 'User added'
          });
        } else {
          // If user already exists, push the name to addedUsers array
          addedUsers.push({ name: user.name, message: 'User already exists' });
        }
      }
  
      return res.status(201).json({addedUsers });
    } catch (error) {
      console.error('Error adding users:', error);
      return res.status(500).json({ message: 'Server Error' });
    }
  });

// @desc Search user(s)
// @route GET /users
// @access Public
// Search by Full Name:

// URL: GET http://localhost:3000/users?searchQuery=Felipe Enrique Gomez Tovar

// Search by First Name:

// URL: GET http://localhost:3000/users?searchQuery=Felipe

// Search by Last Name:

// URL: GET http://localhost:3000/users?searchQuery=Gomez

// Search by Role:

// URL: GET http://localhost:3000/users?searchQuery=teacher

// Partial Name Search:

// URL: GET http://localhost:3000/users?searchQuery=Enrique

searchUserN = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let { searchQuery, page = 1, perPage = 10, sortBy = 'name', sortOrder = 'asc' } = req.query;

    // Parse query parameters
    page = parseInt(page);
    perPage = parseInt(perPage);

    // Validate page and perPage
    if (isNaN(page) || isNaN(perPage) || page < 1 || perPage < 1) {
      return res.status(400).json({ error: 'Invalid page or perPage parameter' });
    }

    // Pagination
    const skip = (page - 1) * perPage;
    const limit = perPage;

    // Sorting
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Aggregation pipeline for counting documents
    const countPipeline = [
      {
        $match: {
          $and: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { roles: 'student' },
          ],
        },
      },
      {
        $count: 'totalCount',
      },
    ];

    // Execute aggregation pipeline to count documents
    const countResult = await User.aggregate(countPipeline);

    // Extract total count from aggregation result
    const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

    // Query to get paginated users
    const users = await User.find({
      $and: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { roles: 'student' },
      ],
    })
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort(sort);

    res.json({ users, totalCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

const getStudentsByGroupIdN = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { groupId } = req.params;

  try {
      const group = await Group.findById(groupId).populate('students', 'name _id');
      if (!group) {
          return res.status(404).json({ message: 'Group not found' });
      }

      const students = group.students.map(student => ({
          name: student.name,
          studentId: student._id
      }));

      res.json(students);
  } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
  }
};



  

module.exports = {
    getUsersByRole,
    createNewUserN,
    updateUserN,
    deleteUserN,
    addUsersN,
    searchUserN,
    getStudentsByGroupIdN
}