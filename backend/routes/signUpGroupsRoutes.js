const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { body, param , check} = require('express-validator');


const signUpGroupsController = require('../controllers/signUpGroupsController')

const allowedDomains = ['escuelaing.edu.co', 'mail.escuelaing.edu.co'];
const excludedCharacters = /[!#$%/()=?¿:";]+/;


//----------------------------------------------------------------------------------------------------------------------------------
  // Validation middleware using Express Validator

  const validateSignUpGroups= (method) => {
    switch (method) {
      case 'signUpGroups':
        return [
         
          check('selectedGroups').isArray().withMessage('Selected groups must be an array'),
          check('selectedGroups.*').isMongoId().withMessage('Invalid group ID'),


          //body('name').trim().notEmpty().withMessage('Name is required'),
         // body('email')
          //.trim()
          //.isLength({ min: 6, max: 64 }).withMessage('Email should be between 10 to 64 characters')
          //   .isEmail().withMessage('Valid email is required')
          //.custom((value) => {
               //if (!value.endsWith('@hotmail.com')) {
                // throw new Error('Invalid domain. Please use @escuelaing.edu.co');
              //}
          //     if (/[A-Z]/.test(value)) {
          //       throw new Error('Email should not contain capital letters');
          //     }
              //  if (/[0-9]/.test(value)) {
              //    throw new Error('Email should not contain numbers');
              //   }
          //     if (/(\w)\1{3,}/.test(value)) {
          //       throw new Error('Email should not have more than 3 repeated letters');
          //     }
            //    if (/[+\-$&?!¡=%¿:/]/.test(value)) {
            //     throw new Error('Email should not contain +, -, $, &, ?, ¡, =, %,¿,:');
            //    }
            //    return true;
            //  }),
           //body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
          // body('courseIds').isArray().withMessage('CourseIds must be an array'),
          // body('groupIds').isArray().withMessage('GroupIds must be an array'),
          // body('courseIds.*').custom((value) => {
          //   if (!mongoose.Types.ObjectId.isValid(value)) {
          //     throw new Error('Invalid courseId');
          //   }
          //   return true;
          // }),
          // body('groupIds.*').custom((value) => {
          //   if (!mongoose.Types.ObjectId.isValid(value)) {
          //     throw new Error('Invalid groupId');
          //   }
          //   return true;
          // }),
        ];
 
      default:
        return [];
    }
  };
  
  router.post('/', validateSignUpGroups('signUpGroups'), signUpGroupsController.signUpGroups);


 
module.exports = router