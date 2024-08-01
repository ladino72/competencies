const express = require('express');
const router = express.Router();
const { param } = require('express-validator');


// Endpoint to get average grade for a specific cp and level


const statisticsController = require('../controllers/statisticsController')


//----------------------------------------------------------------------------------------------------------------------------------
  // Validation middleware using Express Validator

  const validate = (method) => {
    switch (method) {
      case 'averageOneCompetencyOneLevelN':
        return [
          param('activityId').exists().isMongoId().withMessage('Invalid activityId'),
          param('cp')
            .exists()
            .isIn(['CLF', 'UTF', 'PRC', 'UCM', 'ULC'])
            .withMessage('Invalid competency'),
          param('level').exists().isIn(['n1', 'n2', 'n3']).withMessage('Invalid level')
        ];
      case 'averageOneCompetencyByLevelAndByCourseN':
        return [
          param('courseId').exists().isMongoId().withMessage('Invalid courseId'),
          param('competency')
            .exists()
            .isIn(['CLF', 'UTF', 'PRC', 'UCM', 'ULC'])
            .withMessage('Invalid competency'),
          param('level').exists().isIn(['n1', 'n2', 'n3']).withMessage('Invalid level')
        ];
      case 'averageAllLevelsByCompetencyAndByCourseN':
        return [
          param('courseId').exists().isMongoId().withMessage('Invalid courseId'),
          param('competency')
            .exists()
            .isIn(['CLF', 'UTF', 'PRC', 'UCM', 'ULC'])
            .withMessage('Invalid competency')
        ];
      case 'averageAllCompetenciesAllLevelsByCourseByTermN':  //---------- 
          return [
            param('courseId').exists().isMongoId().withMessage('Invalid courseId'),
            param('term').exists().withMessage('Invalid term'),
           
          ];
       case 'averageAllCompetenciesAllLevelsByCourseAllTermsN':  //---------- 
          return [
            param('courseId').exists().isMongoId().withMessage('Invalid courseId'),
            param('threshold').exists().withMessage('Invalid courseId'),
          ];
      case 'AverageOneCompetencyByLevelAndByGroupByCourseByTeacherByTermN': //????
        return [
          param('teacherId').exists().isMongoId().withMessage('Invalid teacherId'),
          param('courseId').exists().isMongoId().withMessage('Invalid courseId'),
          param('groupId').exists().isMongoId().withMessage('Invalid groupId'),
          param('competency')
            .exists()
            .isIn(['CLF', 'UTF', 'PRC', 'UCM', 'ULC'])
            .withMessage('Invalid competency'),
          param('level').exists().isIn(['n1', 'n2', 'n3']).withMessage('Invalid level'),
          param('term').exists().withMessage('Invalid term')
        ];
        case 'averageOneCompetencyAllLevelslByGroupByCourseByTeacherByTermN': //-----------
          return [
            param('teacherId').exists().isMongoId().withMessage('Invalid teacherId'),
            param('courseId').exists().isMongoId().withMessage('Invalid courseId'),
            param('groupId').exists().isMongoId().withMessage('Invalid groupId'),
            param('competency')
              .exists()
              .isIn(['CLF', 'UTF', 'PRC', 'UCM', 'ULC'])
              .withMessage('Invalid competency'),
            param('term').exists().withMessage('Invalid term')

          ];
        case 'averageOneCompetencyAllLevelslByGroupByCourseByTeacherAllTermsN':
          return [
            param('teacherId').exists().isMongoId().withMessage('Invalid teacherId'),
            param('courseId').exists().isMongoId().withMessage('Invalid courseId'),
            param('groupId').exists().isMongoId().withMessage('Invalid groupId'),
            param('competency')
              .exists()
              .isIn(['CLF', 'UTF', 'PRC', 'UCM', 'ULC'])
              .withMessage('Invalid competency'),

          ];
          case 'averageAllCompetenciesAllLevelslByCourseByTeacherAllTermsN':
          return [
            param('teacherId').exists().isMongoId().withMessage('Invalid teacherId'),
            param('courseId').exists().isMongoId().withMessage('Invalid courseId'),
          ];

          case 'histogramAllCompetenciesAllLevelslByCourseAllTermsN':
            return [
              param('courseId').exists().isMongoId().withMessage('Invalid courseId'),
              // param('competency')
              // .exists()
              // .isIn(['CLF', 'UTF', 'PRC', 'UCM', 'ULC'])
              // .withMessage('Invalid competency'),

            ];

            case 'getTotalStudentsActiveInACourseN':
              return [
                param('courseId').exists().isMongoId().withMessage('Invalid courseId'),
  
              ];

      default:
        return [];
    }
  };

  
  
 router.get('/activity/:activityId/competency/:cp/level/:level/term/:term',validate('averageOneCompetencyOneLevelN'), statisticsController.AverageOneActivityByCompetencyByLevelAndByTermN );
 router.get('/activity/:activityId/competency/:cp/level/:level',validate('averageOneCompetencyOneLevelN'), statisticsController.AverageOneActivityByCompetencyByLevelAndByAllTermN );

 router.get('/course/:courseId/competency/:competency/level/:level/term/:term/average',validate('averageOneCompetencyByLevelAndByCourseN'),statisticsController.AverageOneCompetencyByLevelByCourseAndByTermN)
 router.get('/course/:courseId/competency/:competency/level/:level/average',validate('averageOneCompetencyByLevelAndByCourseN'),statisticsController.AverageOneCompetencyByLevelByCourseAndAllTermsN)

    
 router.get('/course/:courseId/competency/:competency/average',validate('averageAllLevelsByCompetencyAndByCourseN'),statisticsController.AverageOneCompetencyAllLevelsByCourseAllterms)


 router.get('/course/:courseId/term/:term',validate('averageAllCompetenciesAllLevelsByCourseByTermN'),statisticsController.AverageAllCompetenciesAllLevelsByCourseByTermN) //--------
 router.get('/course/:courseId/threshold/:threshold',validate('averageAllCompetenciesAllLevelsByCourseAllTermsN'),statisticsController.AverageAllCompetenciesAllLevelsByCourseAllTermsN) //--------
 

 
 router.get('/teacher/:teacherId/course/:courseId/group/:groupId/competency/:competency/level/:level/term/:term/average',validate('averageOneCompetencyByLevelAndByGroupByCourseByTeacherByTermN'),statisticsController.AverageOneCompetencyByLevelAndByGroupByCourseByTeacherByTermN)

//Ok
 router.get('/teacher/:teacherId/course/:courseId/group/:groupId/competency/:competency/term/:term/average',validate('averageOneCompetencyAllLevelslByGroupByCourseByTeacherByTermN'),statisticsController.AverageOneCompetencyAllLevelslByGroupByCourseByTeacherByTermN)
//OK
 router.get('/teacher/:teacherId/course/:courseId/group/:groupId/competency/:competency/average',validate('averageOneCompetencyAllLevelslByGroupByCourseByTeacherAllTermsN'),statisticsController.AverageOneCompetencyAllLevelslByGroupByCourseByTeacherAllTermsN)

 router.get('/teacher/:teacherId/course/:courseId',validate('averageAllCompetenciesAllLevelslByCourseByTeacherAllTermsN'),statisticsController.AverageAllCompetenciesAllLevelslByCourseByTeacherAllTermsN)
 
 
 router.get('/histogram/courseId/:courseId/competency',validate('histogramAllCompetenciesAllLevelslByCourseAllTermsN'),statisticsController.HistogramAllCompetenciesAllLevelslByCourseAllTermsN)


 router.get('/totalStudentsCourse/courseId/:courseId',validate('getTotalStudentsActiveInACourseN'),statisticsController.GetTotalStudentsActiveInACourseN)

 //---------------------------------------------------------------------------------------------------------------------------------------------------


module.exports = router