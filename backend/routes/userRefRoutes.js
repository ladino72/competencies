const express = require('express')
const router = express.Router()
const usersRefController = require('../controllers/usersRefController')
const { check,query, body } = require('express-validator');

router.route('/createUsers',[
  // Assuming the role is sent as a query parameter named 'role'
  body('users').isArray().withMessage('Users should be an array'),
  body('users.*.email').isEmail().withMessage('Email is invalid'),
  body('users.*.studentId').notEmpty().withMessage('Student ID is required')
]).post(usersRefController.createNewUserN)


module.exports = router
