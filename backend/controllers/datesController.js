const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Group = require('../models/Group');
const Course = require('../models/Course');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { validationResult } = require('express-validator');
const DateInfo = require('../models/DateInfo');



// @desc Create deadlines for activities
// @route POST /dates/
// @access Private

const createDatesN = asyncHandler(async (req, res) => {
  //console.log('Request Body:', req.body); // Log request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation Errors:', errors.array()); // Log validation errors
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { initDateT1, endDateT1, initDateT2, endDateT2, initDateT3, endDateT3 } = req.body;

    const dateObject = {
      initDateT1,
      endDateT1,
      initDateT2,
      endDateT2,
      initDateT3,
      endDateT3,
    };

    const savedDate = await DateInfo.findOneAndUpdate({}, dateObject, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    res.status(200).json(savedDate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = {
    createDatesN 

}