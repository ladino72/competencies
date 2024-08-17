const express = require('express')
const router = express.Router()
const mfaController = require('../controllers/mfaController')

const { body } = require('express-validator');

 router.route('/enable-MFA',[body('userId').isMongoId().withMessage('Invalid user ID')]).post(mfaController.enableMFAgenerateQR);

 router.route('/verify-MFA',[
    body('userId').isMongoId().withMessage('Invalid user ID'),
    body('authCode').isLength({ min: 6, max: 6 }).withMessage('Auth code must be 6 digits'),
]).post(mfaController.veryfyMFAcode);


module.exports = router