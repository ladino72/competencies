const express = require('express')
const router = express.Router()
const activitiesController = require('../controllers/activitiesController')
const { param, body,validationResult } = require('express-validator');

const mongoose = require('mongoose');



// 1. Get activities by teacher, course, group, and term (Moved up)
router.get('/teacher/:teacherId/:courseId/:groupId/:term', [
  param('teacherId').notEmpty().withMessage('Teacher ID is required').isMongoId().withMessage('Invalid Teacher ID'),
  param('courseId').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid Course ID'),
  param('groupId').notEmpty().withMessage('Group ID is required').isMongoId().withMessage('Invalid Group ID'),
  param('term').notEmpty().withMessage('Term is required').isIn(['1', '2', '3']).withMessage('Invalid term'),
], activitiesController.getActivitiesByTeacherByCourseByGroupAndByTermN);



// 2. Get activities by teacher and course (all groups, all terms)
router.get('/teacher/:teacherId/:courseId', [
  param('teacherId').notEmpty().withMessage('Teacher ID is required').isMongoId().withMessage('Invalid Teacher ID'),
  param('courseId').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid Course ID'),
  param('term').optional().isIn(['1', '2', '3']), // Optional term with validation
], activitiesController.getActivitiesByTeacherByCourseAllGroupsAnByAllTermsN);


// 3. Get activities by teacher, course, and term (all groups) (Kept after group route)
router.get('/teacher/:teacherId/:courseId/:term', [
  param('teacherId').notEmpty().withMessage('Teacher ID is required').isMongoId().withMessage('Invalid Teacher ID'),
  param('courseId').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid Course ID'),
  param('term').notEmpty().withMessage('Term is required').isIn(['1', '2', '3']).withMessage('Invalid term'),
], activitiesController.getActivitiesByTeacherCourseAllGroupsByTermN);

// 4. Get teachers without activities (course, term)
router.get('/course/:courseId/term/:term', [
  param('courseId').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid Course ID'),
  param('term').isString().withMessage('Term is required').isIn(['1', '2', '3']).withMessage('Invalid term'),
  
], activitiesController.getInfoCourseActivitiesByTermN);

// 5. Get teachers without activities (course, term)
router.get('/course/:courseId', [
  param('courseId').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid Course ID'),
  
], activitiesController.getInfoCourseActivitiesAlltermsN);

//
router.delete('/:activityId', [
  param('activityId').isMongoId().withMessage('Invalid activityId'),
  ], activitiesController.deleteActivityN);



router.post('/', [
  body('type').notEmpty().withMessage('Type is required'),
  body('courseId').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid Course ID'),
  body('groupId').notEmpty().withMessage('Group ID is required').isMongoId().withMessage('Invalid Group ID'),
  body('teacherId').notEmpty().withMessage('Teacher ID is required').isMongoId().withMessage('Invalid Teacher ID'),
  body('description').notEmpty().withMessage('Description is required'),
  body('activityAppliedDate').notEmpty().withMessage('Activity Applied Date is required').isISO8601().toDate(),
  body('rubric').notEmpty().withMessage('Rubric is required').isArray({ min: 1 }).withMessage('Rubric should be an array with at least one item'),
], activitiesController.createActivityN); 


router.put('/:activityId', [
 
    // Express Validator middleware
    body('completed').isBoolean(),
  
    // Custom validation to check if activityId is a valid ObjectId
    
    param('activityId').notEmpty().withMessage('activity ID is required').isMongoId().withMessage('Invalid activity ID'),
  
], activitiesController.updateActivityN); 





module.exports = router