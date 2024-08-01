const express = require('express')
const router = express.Router()
const coursesController = require('../controllers/coursesController')
const { check, body,param } = require('express-validator');



router.get('/:courseId/groups', [check('courseId').isMongoId().withMessage('Invalid Course ID')], coursesController.getAllGroupsForACourseN);


router.get('/courses-and-groups', [], coursesController.getAllCoursesAndGroupsN);



router.post('/',[
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('c_Id').trim().notEmpty().withMessage('Course ID is required'),
  body('coordinator').trim().notEmpty().withMessage('Coordinator ID is required')],coursesController.createNewCourseN)


router.route('/:courseId/update').put(coursesController.updateCourseN)

router.get('/',  [
    body('mnemonic').notEmpty().withMessage('Course name cannot be empty'),
  ], coursesController.getCoursesByMnemonicN); 


  router.get('/coordinator/:coordinatorId',  [
    param('coordinatorId').isMongoId().withMessage('Invalid coordinator ID')
  ], coursesController.getCourseByCoordinatorIdN);  

  router.get('/teacher-courses/:teacherId',  [
    param('teacherId').isMongoId().withMessage('Invalid teacher ID')
  ], coursesController.getCourseIdsByteacherIdN);  


  router.get('/coordinator/courseId/:courseId',  [
    param('courseId').isMongoId().withMessage('Invalid course ID')
  ], coursesController.getAllTeachersForACourseN );  

router.get('/allcourses' , coursesController.getAllCoursesN); 

router.get('/courses/userId/:userId',[param('userId').isMongoId().withMessage('Invalid user ID')],coursesController.getCoursesStudentRegisteredInN); 



module.exports = router