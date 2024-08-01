const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const datesController = require('../controllers/datesController');

const validateDates = [
  body('initDateT1').isISO8601().toDate().withMessage('Invalid initial date for T1'),
  body('endDateT1').isISO8601().toDate().withMessage('Invalid end date for T1')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.initDateT1)) {
        throw new Error('endDateT1 must be after initDateT1');
      }
      return true;
    }),
  body('initDateT2').isISO8601().toDate().withMessage('Invalid initial date for T2')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.endDateT1)) {
        // Changed from strict equality to "less than"
        throw new Error('initDateT2 must be after or equal to endDateT1');
      }
      return true;
    }),
  body('endDateT2').isISO8601().toDate().withMessage('Invalid end date for T2')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.initDateT2)) {
        throw new Error('endDateT2 must be after initDateT2');
      }
      return true;
    }),
  body('initDateT3').isISO8601().toDate().withMessage('Invalid initial date for T3')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.endDateT2)) {
        // Changed from strict equality to "less than"
        throw new Error('initDateT3 must be after or equal to endDateT2');
      }
      return true;
    }),
  body('endDateT3').isISO8601().toDate().withMessage('Invalid end date for T3')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.initDateT3)) {
        throw new Error('endDateT3 must be after initDateT3');
      }
      return true;
    }),
];

router.post('/', validateDates, datesController.createDatesN);

module.exports = router;