const express = require('express')
const router = express.Router()
const { body} = require('express-validator');
const adminController = require('../controllers/adminController')
const  physValidationRules  = require('../models/physCoursesSetup');


router.route('/', physValidationRules(),[
    body('name').notEmpty().withMessage('Course name is required'),
    body('c_Id').notEmpty().withMessage('Course ID is required'),
    body('coordinatorId').notEmpty().withMessage('Coordinator ID is required'),
]).post(adminController.createBaseCourses);

router.route('/',physValidationRules()).get(adminController.getBaseCourses);

router.route('/:courseId',physValidationRules(), [
    body('c_Id').notEmpty().withMessage('Course ID is required'),
]).delete(adminController.deleteBaseCourse);

router.route('/:courseId',physValidationRules(),[
    body('name').notEmpty().withMessage('Course name is required'),
    body('c_Id').notEmpty().withMessage('Course ID is required'),
    body('coordinatorId').notEmpty().withMessage('Coordinator ID is required'),
]).put(adminController.updateBaseCourse);

router.route('/',physValidationRules(),[
    body('name').notEmpty().withMessage('Course name is required'),
    body('c_Id').notEmpty().withMessage('Course ID is required'),
    body('coordinatorId').notEmpty().withMessage('Coordinator ID is required'),
]).put(adminController.updateAllBaseCourses);

module.exports = router


