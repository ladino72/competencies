const express = require('express')
const router = express.Router()
const { check, body, param} = require('express-validator');
const groupsController = require('../controllers/groupsController')
const mongoose = require('mongoose');

// Validation middleware using Express Validator

const validate = (method) => {
    switch (method) {
      case 'AddExistingStudentToGroup':
        return [
            body('studentId').custom((value) => {
              if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid studentId');
              }
              return true;
            }),
            body('groupId').custom((value) => {
              if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid groupId');
              }
              return true;
            }),
          ];
          case 'createGroupValidator':
        return [
          body('courseId').exists().withMessage('CourseId is required'),
          body('teacherId').exists().withMessage('TeacherId is required'),
          body('g_Id').exists().withMessage('Group ID is required'),
          ];
          case 'deleteGroupValidation':
        return [
          param('groupId').isMongoId().withMessage('Invalid groupId'),
          ];

          case 'getAllStudentsInAGroupsByTeacherAndCourseNValidation':
        return [
          check('teacherId').isMongoId().withMessage('Invalid Teacher ID'),
          check('courseId').isMongoId().withMessage('Invalid Course ID'),
          ];
   
      default:
        return [];
    }
  };    

router.get('/:teacherId/:courseId/students',validate('getAllStudentsInAGroupsByTeacherAndCourseNValidation') , groupsController.getAllStudentsInAGroupsByTeacherAndCourseN);

router.post('/',validate('createGroupValidator'),groupsController.createGroupN)


router.delete('/:groupId/delete',validate('deleteGroupValidation'),groupsController.deleteGroupN)

  

router.post('/add-to-group',validate('AddExistingStudentToGroup'),groupsController.AddExistingStudentToGroupN)



module.exports = router