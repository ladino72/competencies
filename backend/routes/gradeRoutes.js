const express = require('express')
const router = express.Router()
const { body, param, query, validationResult } = require('express-validator');
const gradesController = require('../controllers/gradesController')



 

router.get('/topGrades/courseId/:courseId/threshold/:threshold',[
  // param('studentId').isMongoId().withMessage('Invalid student ID'),
   param('courseId').isMongoId().withMessage('Invalid course ID'),
   param('threshold').exists().withMessage('Invalid threshold'),
   

  // query('groupId').isString().withMessage('Invalid group ID'),
  // query('term').isString().withMessage('Invalid term')
],gradesController.getTopStudentGradesByCourseGroupsAllTermsN)

router.get('/studentGradesFullAnalysis/studentId/:studentId',[
  // param('courseId').isMongoId().withMessage('Invalid course ID'),
   param('studentId').isMongoId().withMessage('Invalid student ID'),
  // param('threshold').exists().withMessage('Invalid threshold')
],gradesController.getStudentGradesAllTermsFullAnalisysN) 

router.get('/studentGradesForStudents/studentId/:studentId',[
   param('studentId').isMongoId().withMessage('Invalid student ID'),
],gradesController.getStudentGradesAllTermsForStudentsN) 

router.get('/statsTeacherForDirector/teacherId/:teacherId',[
  param('teacherId').isMongoId().withMessage('Invalid teacher ID'),
],gradesController.getStatsTeacherForDirectorN) 

router.get('/statsTeacherForCoordinator/teacherId/:teacherId/courseId/:courseId',[
  param('teacherId').isMongoId().withMessage('Invalid teacher ID'),
  param('courseId').isMongoId().withMessage('Invalid course ID'),
],gradesController.getStatsTeacherForCoordinatorN) 



router.get('/student/:studentId',[
    param('studentId').isMongoId().withMessage('Invalid student ID'),
    query('courseId').isMongoId().withMessage('Invalid course ID'),
    query('groupId').isString().withMessage('Invalid group ID'),
    query('term').isString().withMessage('Invalid term')
],gradesController.getStudentGradesByCouseByGroupAndByTermN)

router.get('/getActivityGrades/:activityId',[
  param('activityId').isMongoId().withMessage('Invalid student ID'),
  
],gradesController.getActivityGradesN)

router.get('/:studentId/term/:term',[
  param('studentId').isMongoId().withMessage('Invalid student ID'),
  param('term').isString().withMessage('Invalid student ID'),
],gradesController.getStudentGradesAllCoursesByTermN,)

router.get('/:studentId',[
  param('studentId').isMongoId().withMessage('Invalid student ID'),
 
],gradesController.getStudentGradesAllCoursesAllTermsN,)

router.get('/percentiles/:studentId',[
  param('studentId').isMongoId().withMessage('Student ID must be a valid MongoDB ObjectId'),
],gradesController.getPercentilesByCourseGroupStudentN)              

router.post("/",[
  body('studentId').isMongoId().withMessage('Invalid studentId'),
  body('activityId').isMongoId().withMessage('Invalid activityId'),
  // Validation for scores (you can add more specific rules here based on your schema)
  body('scores').isArray().withMessage('Scores must be an array'),
],gradesController.createGradeN)

router.put('/:gradeId/update', [
  // Validation using express-validator
  body('scores.*.n1').isInt({ min: 0, max: 2 }).withMessage('Each score must be between 0 and 2'),
  body('scores.*.n2').isInt({ min: 0, max: 2 }).withMessage('Each score must be between 0 and 2'),
  body('scores.*.n3').isInt({ min: 0, max: 2 }).withMessage('Each score must be between 0 and 2'),
], gradesController.updateGradeN);

router.put('/UpdateStudentGrades/:studentId/:activityId', [
  param('studentId').isMongoId().withMessage('Invalid studentId'),
    param('activityId').isMongoId().withMessage('Invalid activityId'),
    body('scores.*.n1').isIn(['0', '1', '2', '']).withMessage('Invalid grade for n1'),
    body('scores.*.n2').isIn(['0', '1', '2', '']).withMessage('Invalid grade for n2'),
    body('scores.*.n3').isIn(['0', '1', '2', '']).withMessage('Invalid grade for n3'),
    body('scores.*.cp').isString().notEmpty().withMessage('Invalid cp'),
    body('scores.*.checked').isBoolean().withMessage('Invalid checked value'),
], gradesController.updateStudentGradesN);



// router.put('/setStatusGrade', [
//   body('studentId').isMongoId().withMessage('Invalid studentId'),
//   body('groupId').isMongoId().withMessage('Invalid groupId'),
//   body('status').exists().withMessage('status field is required').isBoolean().withMessage('status must be true or false'),
    
// ], gradesController.setStatusGradeByStudentByGroupN);  

router.put('/setStatusGrade/:groupId/deactivate', [
  param('groupId').exists().withMessage('Group ID is required').isMongoId().withMessage('Invalid Group ID format'), // Validate group ID
  body('students').isArray().withMessage('Students must be an array'), // Validate students array
  body('students.*').isMongoId().withMessage('Invalid Student ID format') // Validate each student ID in the array

    
], gradesController.deactivateStudentsGradesInAGroup);



//Possible problem, please check the order of the router
router.put('/:gradeId/:cp', [
  // Validation using express-validator
  body('n1').isInt({ min: 0, max: 2 }).withMessage('n1 must be between 0 and 2'),
  body('n2').isInt({ min: 0, max: 2 }).withMessage('n2 must be between 0 and 2'),
  body('n3').isInt({ min: 0, max: 2 }).withMessage('n3 must be between 0 and 2'),
], gradesController.updateOneCompetencyGradeN);

 
  
  
module.exports = router


