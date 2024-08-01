const express = require('express')
const router = express.Router()
const refreshTokenController = require('../controllers/refreshTokenController')
const { body, validationResult } = require('express-validator');

router.post('/', refreshTokenController.refreshToken);

module.exports = router