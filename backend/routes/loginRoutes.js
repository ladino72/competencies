const express = require('express');
const router = express.Router();
const { body} = require('express-validator');
const loginNController = require('../controllers/loginNController')


router.route('/',[
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ])
    .post(loginNController.loginN)

module.exports = router