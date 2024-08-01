const express = require('express');
const router = express.Router();
const { check, body, param , query} = require('express-validator');
const workshopController = require('../controllers/workshopController');

const mongoose = require('mongoose');

// Validation middleware using Express Validator

const validate = (method) => {
  switch (method) {

    case 'createTeam':
      return [
        body('workshopName').notEmpty().withMessage('Workshop name is required'),
        body('teamNames').isArray({ min: 1 }).withMessage('Team names must be an array with at least one name'),
        body('teamNames.*').notEmpty().withMessage('Each team name must be non-empty'),
        body('courseId').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid Course ID'),
        body('groupId').notEmpty().withMessage('GroupID is required').isMongoId().withMessage('Invalid Group ID'),
        body('term').notEmpty().withMessage('Term is required').isInt({ min: 1, max: 3 }).withMessage('Term must be an integer between 1 and 3'),
      
      ];

    case 'createWorkshop':
      return [
        body('description').notEmpty().withMessage('Description is required'),
        body('courseId').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid Course ID'),
        body('groupId').notEmpty().withMessage('Group ID is required').isMongoId().withMessage('Invalid Group ID'),
        body('endDate').notEmpty().withMessage('Expiration date is required').isISO8601().withMessage('Invalid date format for expiration date'),
        body('teamNames').isArray({ min: 1 }).withMessage('Team names must be an array with at least one name'),
        body('teamNames.*').notEmpty().withMessage('Each team name must be non-empty'),
      
      ];
      case 'joinTeam':
        return [
            body('studentId').notEmpty().withMessage('Student ID is required').isMongoId().withMessage('Invalid Student ID'),
            body('workshopName').notEmpty().withMessage('Workshop name is required'),
            body('courseId').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid Course ID'),
            body('groupId').notEmpty().withMessage('Group ID is required').isMongoId().withMessage('Invalid Group ID'),
            body('teamName').notEmpty().withMessage('Team name is required')
        ];
        case 'getWorkshops':
        return [
          param('workshopId')
          .notEmpty()
          .withMessage('Workshop ID is required')
          .isMongoId()
          .withMessage('Invalid Workshop ID')
        ];
        case 'courseId&studentId':
        return [
          param('courseId').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid Course ID'),
          param('studentId').notEmpty().withMessage('Student ID is required').isMongoId().withMessage('Invalid Student ID')
        ];

        case 'getAllWorkshopsNew':
        return [
          param('studentId').notEmpty().withMessage('Student ID is required').isMongoId().withMessage('Invalid Student ID')
        ];

        case 'getAllWorkShopsToEnterGradesN':
        return [
          param('studentId').notEmpty().withMessage('Student ID is required').isMongoId().withMessage('Invalid Student ID')
        ];
        case 'removeStudentFromTeam':
        return [
          body('studentId').isMongoId().withMessage('Invalid student ID'),
          body('workshopId').isMongoId().withMessage('Invalid workshop ID'),
          body('teamId').isMongoId().withMessage('Invalid team ID')
        ];

        case 'self-peer-grades':
    return [
        check('workshopId').isMongoId().withMessage('Invalid Workshop ID'),
        check('teamId').isMongoId().withMessage('Invalid Team ID'),
        check('peerStudentId').isMongoId().withMessage('Invalid Peer Student ID'),
        check('givenById').isMongoId().withMessage('Invalid Given By ID'),
        check('responses').isArray().withMessage('Responses must be an array'),
        check('responses.*.topic').isString().withMessage('Topic is required'),
        check('responses.*.questions').isArray().withMessage('Questions must be an array'),
        check('responses.*.questions.*.questionId').isMongoId().withMessage('Invalid Question ID'),
        check('responses.*.questions.*.grade').isInt({ min: 0, max: 5 }).withMessage('Grade must be between 0 and 5')
       
    ];

        case 'create_update_TeacherGradeGroup-rubric':
          return [
            check('teacherRubric').isArray().withMessage('Teacher rubric must be an array'),
            check('teacherRubric.*.topic').isString().withMessage('Topic must be a string'),
            check('teacherRubric.*.options').isArray().withMessage('Options must be an array'),
            check('teacherRubric.*.options.*.grade').isInt({ min: 1, max: 5 }).withMessage('Grade must be an integer between 1 and 5'),
            check('teacherRubric.*.options.*.optionText').isString().withMessage('Option text must be a string')
        ];

        case 'create_update_SelfAssessmentGrade-rubric':
        return [
          check('studentRubric').isArray().withMessage('Student rubric must be an array'),
          check('studentRubric.*.topic').isString().withMessage('Topic must be a string'),
          check('studentRubric.*.questions').isArray().withMessage('Questions must be an array'),
          check('studentRubric.*.questions.*.question_number').isInt({ min: 1 }).withMessage('Question number must be an integer greater than 0'),
          check('studentRubric.*.questions.*.question_text').isString().withMessage('Question text must be a string')

        ];

        case 'create_update_PeerGrade-rubric':
        return [
          check('peerRubric').isArray().withMessage('Peer rubric must be an array'),
          check('peerRubric.*.topic').isString().withMessage('Topic must be a string'),
          check('peerRubric.*.questions').isArray().withMessage('Questions must be an array'),
          check('peerRubric.*.questions.*.question_number').isInt({ min: 1 }).withMessage('Question number must be an integer greater than 0'),
          check('peerRubric.*.questions.*.question_text').isString().withMessage('Question text must be a string')

        ];
        
        case 'get_TeacherGroupGrade_rubric':
        return [
          check('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100'),
          check('skip').optional().isInt({ min: 0 }).withMessage('Skip must be a non-negative integer'),
        ];

        case 'get_SelfAssessment_rubric':
        return [
          check('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100'),
          check('skip').optional().isInt({ min: 0 }).withMessage('Skip must be a non-negative integer'),
        ];

        case 'get_PeerGrade_rubric':
        return [
          check('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100'),
          check('skip').optional().isInt({ min: 0 }).withMessage('Skip must be a non-negative integer'),
        ];

        case 'enterTeacherGradeToTeams':
        return [
          check('workshopId').isMongoId().withMessage('Invalid workshop ID'),
          check('courseId').isMongoId().withMessage('Invalid course ID'),
          check('groupId').isMongoId().withMessage('Invalid group ID'),
          check('teamId').isMongoId().withMessage('Invalid team ID'),
          check('grades').isArray().withMessage('Grades must be an array'),
          check('grades.*.topicId').isMongoId().withMessage('Invalid topic ID'),
          check('grades.*.optionId').isMongoId().withMessage('Invalid option ID')
        ];
        case 'updateTeacherGradeToTeams':
          return [
            body('workshopId').notEmpty().isMongoId().withMessage('Workshop ID is required and must be a valid MongoDB ID'),
            body('courseId').notEmpty().isMongoId().withMessage('Course ID is required and must be a valid MongoDB ID'),
            body('groupId').notEmpty().isMongoId().withMessage('Group ID is required and must be a valid MongoDB ID'),
            body('teamId').notEmpty().isMongoId().withMessage('Team ID is required and must be a valid MongoDB ID'),
            body('grades').isArray({ min: 1 }).withMessage('Grades must be an array with at least one grade'),
            body('grades.*.topicId').isMongoId().withMessage('Invalid topic ID'),
            body('grades.*.optionId').isMongoId().withMessage('Invalid option ID')
          ];
      case 'getTeamGivenWorShopIdCourseIdGroupIdTeamIdN':
          return [
            query('workshopId').notEmpty().withMessage('Workshop ID is required').isMongoId().withMessage('Invalid Workshop ID'),
            query('courseId').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid Course ID'),
            query('groupId').notEmpty().withMessage('Group ID is required').isMongoId().withMessage('Invalid Group ID'),
            query('teamId').notEmpty().withMessage('Team ID is required').isMongoId().withMessage('Invalid Team ID')
          ];
        
        case 'get-workshops-in-DB':
        return [
          check('courseId').isMongoId().withMessage('Invalid courseId'),
          check('groupId').isMongoId().withMessage('Invalid groupId'),
        ];

        case 'getTotalTeamGradeGivenByTeacher':
          return [
            body('workshopId').notEmpty().isMongoId().withMessage('Valid Workshop ID is required'),
            body('courseId').notEmpty().isMongoId().withMessage('Valid Course ID is required'),
            body('groupId').notEmpty().isMongoId().withMessage('Valid Group ID is required'),
          ];

          case 'getStudentTotalGradeInWorkshop':
          return [
            body('workshopId').notEmpty().isMongoId().withMessage('Valid Workshop ID is required'),
            //body('courseId').notEmpty().isMongoId().withMessage('Valid Course ID is required'),
            //body('groupId').notEmpty().isMongoId().withMessage('Valid Group ID is required'),
            body('teamId').notEmpty().isMongoId().withMessage('Valid Team ID is required'),
            body('peerId').notEmpty().isMongoId().withMessage('Valid Student ID is required')

          ];
          case 'getStudentsTotalGradeInWorkshopInAGroup':
          return [
            body('workshopId').isMongoId().withMessage('workshopId must be a valid Mongo ID'),
           // body('teamId').isMongoId().withMessage('teamId must be a valid Mongo ID')
          ];
          case 'getSelfPeerEvaluationStatus':
          return [
            check('workshopId').isMongoId().withMessage('Invalid workshopId'),
            check('selectedTeam').isMongoId().withMessage('Invalid selectedTeam'),
            check('userId').isMongoId().withMessage('Invalid userId')

          ];

          case 'setTeamNames':
          return [
            body('category').notEmpty().withMessage('Category is required'),
            body('teamNames').isArray().withMessage('Team names should be an array'),
            body('teamNames.*').notEmpty().withMessage('Each team name must not be empty')  

          ];
          case 'getTeamStudentNamesN':
          return [
            check('workshopId').isMongoId().withMessage('Invalid workshop ID'),
          ];

      

          case 'getTeamNames':
          return [
            query('category').notEmpty().withMessage('Category is required'),
            

          ];

    default:
      // Consider throwing an error or returning a default validation array
      return [];
  }
};




router.post('/createWorkshop',validate('createWorkshop'), workshopController.createWorkshopN);
router.post('/createTeam',validate('createTeam'), workshopController.createTeamN);
 
router.post('/joinTeam',validate('joinTeam'), workshopController.joinTeamN); 
router.get('/getWorkshops/:workshopId',validate('getWorkshops'), workshopController.getWorkshopWithTeamsN); 
router.get('/getWorkshopId/courseId/:courseId/studentId/:studentId',validate('courseId&studentId'), workshopController.getWorkShopIdForACourseN); 

router.get('/getAllWorkshopsNew/studentId/:studentId',validate('getAllWorkshopsNew'), workshopController.getAllWorkShopsNewN); 
router.get('/getAllWorkShopsToEnterGrades/studentId/:studentId',validate('getAllWorkShopsToEnterGrades'), workshopController.getAllWorkShopsToEnterGradesN); 

router.put('/selfPeerGrades',validate('self-peer-grades'), workshopController.self_Peer_GradesN); 
router.post('/removeStudentFromTeam',validate('removeStudentFromTeam'), workshopController.removeStudentFromTeamN); 

router.put('/create-update-teacher-rubric',validate('create_update_TeacherGradeGroup-rubric'), workshopController.create_update_TeacherGradeGroup_rubricN);
router.post('/create-update-student-rubric',validate('create_update_SelfAssessmentGrade-rubric'), workshopController.create_update_SelfAssessmentGrade_rubricN);
router.post('/create-update-peer-rubric',validate('create_update_PeerGrade-rubric'), workshopController.create_update_PeerGrade_rubricN);



router.get('/get-teacher-rubric',validate('get_TeacherGroupGrade_rubric'), workshopController.get_TeacherGroupGrade_rubricN);
router.get('/get-student-rubric',validate('get_SelfAssessment_rubric'), workshopController.get_SelfAssessment_rubricN);
router.get('/get-peer-rubric',validate('get_PeerGrade_rubric'), workshopController.get_PeerGrade_rubricN);



router.post('/teacher-grades-to-teams',validate('enterTeacherGradeToTeams'), workshopController.enterTeacherGradeToTeamsN); 
router.put('/update-teacher-grades-to-teams',validate('updateTeacherGradeToTeams'), workshopController.updateTeacherGradeToTeamsN); 


router.get('/getWorkshopsCourseIdGroupId/courseId/:courseId/groupId/:groupId',validate('get-workshops-in-DB'), workshopController.getWorkShopsForCourseId_GroupIdN); 

router.get('/getTeamGrades',validate('getTeamGivenWorShopIdCourseIdGroupIdTeamId'), workshopController.getTeamGivenWorShopIdCourseIdGroupIdN); 

router.post('/getTotalTeamGradeGivenByTeacher',validate('getTotalTeamGradeGivenByTeacher'), workshopController.getTotalTeamGradeGivenByTeacherN);

router.post('/getStudentTotalGradeInWorkshop',validate('getStudentTotalGradeInWorkshop'), workshopController.getStudentTotalGradeInWorkshopN);

router.get('/getSelfPeerEvaluationStatus',validate('getSelfPeerEvaluationStatus'), workshopController.getSelfPeerEvaluationStatusN);

router.post('/getTotalWorkshopGradeForStudentsInGroup',validate('getStudentsTotalGradeInWorkshopInAGroup'), workshopController.getTotalWorkshopGradeForStudentsInGroupN);
router.post('/setTeamNames',validate('setTeamNames'), workshopController.setTeamNamesN);
router.get('/getTeamNames',validate('getTeamNames'), workshopController.getTeamNamesN) 
router.get('/getcategoryNames', workshopController.getcategoryNamesN)  
router.get('/getTeamStudentNames/workshopId/:workshopId',validate('getTeamStudentNamesN'), workshopController.getTeamStudentNamesN)  
















 
 






module.exports = router