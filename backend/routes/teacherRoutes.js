const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const teachersController = require('../controllers/teachersController');

// Correct usage of express-validator for route parameter validation
router.get(
  '/:teacherId',
  [
    param('teacherId').isMongoId().withMessage('Invalid teacher ID'),
  ],
  teachersController.getTeacher_CoursesGroupsActivitiesByCurrentTimeN
);


router.get(
  '/getCoursesForATeacher/:teacherId',
  [
    param('teacherId').isMongoId().withMessage('Invalid teacher ID'),
  ],
  teachersController.getCourses_GroupsOfATeacherN
);



module.exports = router;
