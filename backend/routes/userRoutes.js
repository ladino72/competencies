const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const authController = require("../controllers/authController")
const { check,query } = require('express-validator');

router.route('/',[
  // Assuming the role is sent as a query parameter named 'role'
  query('role')
  .notEmpty().withMessage('Role is required')
  .isIn(['student', 'teacher', 'coordinator', 'admin', 'director']).withMessage('Invalid role'),
]).get(usersController.getUsersByRole)
  .post(usersController.createNewUserN)


router.route('/:userId/update').put(usersController.updateUserN);
router.route('/addusers',[check('users').isArray().withMessage('Users must be an array')]).post(usersController.addUsersN);

// router.route('/search',[
//     check('searchQuery').notEmpty().withMessage('Search query cannot be empty'),
//   ]).get(usersController.searchUserN);

 router.route('/search',[
  query('searchQuery').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('perPage').optional().isInt({ min: 1 }).withMessage('Invalid perPage number'),
  query('sortBy').optional().isIn(['name', 'createdAt']).withMessage('Invalid sortBy field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sortOrder value'),
  ]).get(usersController.searchUserN);



  router.route('/deleteUser',[
    check('usersToDelete').isArray().withMessage('Users to delete must be an array'),
    check('usersToDelete.*').isMongoId().withMessage('Invalid user ID format'),
  ]).delete(usersController.deleteUserN);

  router.route('/getStudents/group/:groupId',[
    check('groupId').isMongoId().withMessage('Invalid groupId'),
  ]).get(usersController.getStudentsByGroupIdN);

  


module.exports = router
