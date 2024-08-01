const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { validationResult, param } = require('express-validator');
const { ObjectId } = require('mongoose').Types;
const Grade = require('../models/Grade');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Group = require('../models/Group');
const Course = require('../models/Course');





// @desc get average grade for a specific cp and level
// @route GET/statistics
// @access Private

const AverageOneActivityByCompetencyByLevelAndByTermN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { activityId, cp, level,term} = req.params;
    //console.log("Here I am:", req.params)

    const fieldToAverage = level;

    const activityId_ = await Activity.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(activityId),term:term}
      },

    ]);

    if(activityId_.length == 0 || !mongoose.Types.ObjectId.isValid(activityId_[0]._id)){
      return res.status(404).json({ error: 'No activity found that match the criteria' });
    }

    console.log("Here I am:", activityId_)
    const result = await Grade.aggregate([
      {
        $match: {
          activityId: mongoose.Types.ObjectId(activityId_[0]._id),
          "isValidGrade":true
        }
      },
      {
        $project: {
          filteredScores: {
            $filter: {
              input: "$scores",
              as: "score",
              cond: { $eq: ["$$score.cp", cp] }
            }
          },
          _id: 1,
          studentId: 1,
          activityId: 1
        }
      },
      {
        $unwind: "$filteredScores"
      },
      {
        $match: {
          $expr: { $ne: [`$filteredScores.${fieldToAverage}`, ""] }
        }
      },
      {
        $group: {
          _id: null,
          avgField: {
            $avg: {
              $cond: [
                { $ne: [`$filteredScores.${fieldToAverage}`, ""] },
                { $toDouble: `$filteredScores.${fieldToAverage}` },
                0
              ]
            }
          },

          takers: { $addToSet: "$studentId" } // Count unique student IDs
        }
      },
      {
        $project: {
          _id: 0,
          average: "$avgField",
          takers: { $size: "$takers" },

        }
      }
    ]
    )


   // const result = await Grade.aggregate(aggregationPipeline);

    if (result.length === 0) {
      return res.status(404).json({ error: 'No grades found for the specified criteria' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// @desc get average grade for a specific cp and level
// @route GET/statistics
// @access Private

const AverageOneActivityByCompetencyByLevelAndByAllTermN  = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { activityId, cp, level} = req.params;

    const fieldToAverage = level;

    const aggregationPipeline = [
      {
        $match: {
          activityId: mongoose.Types.ObjectId(activityId),
          "isValidGrade":true

        }
      },
      {
        $project: {
          filteredScores: {
            $filter: {
              input: "$scores",
              as: "score",
              cond: { $eq: ["$$score.cp", cp] }
            }
          },
          _id: 1,
          studentId: 1,
          activityId: 1
        }
      },
      {
        $unwind: "$filteredScores"
      },
      {
        $match: {
          $expr: { $ne: [`$filteredScores.${fieldToAverage}`, ""] }
        }
      },
      {
        $group: {
          _id: null,
          avgField: {
            $avg: {
              $cond: [
                { $ne: [`$filteredScores.${fieldToAverage}`, ""] },
                { $toDouble: `$filteredScores.${fieldToAverage}` },
                0
              ]
            }
          },
          studentCount: { $addToSet: "$studentId" } // Count unique student IDs
        }
      },
      {
        $project: {
          _id: 0,
          average: "$avgField",
          studentCount: { $size: "$studentCount" }
        }
      }
    ];


    const result = await Grade.aggregate(aggregationPipeline);

    if (result.length === 0) {
      return res.status(404).json({ error: 'No grades found for the specified criteria' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// @desc get average grade for a specific cp and level and course
// @route GET/statistics
// @access Private

const AverageOneCompetencyByLevelByCourseAndByTermN = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId, competency, level ,term} = req.params;

    try {
      const activityIdsAggregate = await Activity.aggregate([
        {
          $match: { courseId: mongoose.Types.ObjectId(courseId), term: term }
        },
        {
          $group: {
            _id: "$groupId",
            activityIds: { $push: "$_id" }
          }
        }
      ]);

      console.log("activities",activityIdsAggregate) 

      const result = await Activity.aggregate([
        {
          $match: { "_id": { $in: activityIdsAggregate.map(group => group.activityIds).flat() } }
        },
       {
        $group:{
        _id:{grupo:"$groupId",activityId:"$_id",term:"$term"},
        //activityIds: { $push: "$_id" },
      }
       },
      {
        $lookup: {
          from: "grades",
          localField: "_id.activityId",
          foreignField: "activityId",
          as: "grades"
        }
      },
      {
        $match: {
          grades: { $exists: true, $ne: [] }, // Ensure grades array exists and is not empty
          "grades.isValidGrade": true, // Filter by isValidGrade being true
          "grades.scores": {
            $elemMatch: {
              $or: [
                { n1: { $nin: ['', null] } },
                { n2: { $nin: ['', null] } },
                { n3: { $nin: ['', null] } }
              ]
            }
          }
        }
      },
      {
        $unwind: "$grades"
      },
      {
        $unwind: "$grades.scores"
      },
      {
        $group: {
          _id: {
            groupId: "$_id.grupo",
            activity:"$_id.activityId",
            competency: "$grades.scores.cp",
            term:"$_id.term"
          },
          avgN1: { $avg: { $cond: [{ $eq: ['$grades.scores.n1', ''] }, null, { $toDouble: '$grades.scores.n1' }]}},
          avgN2: { $avg: { $cond: [{ $eq: ['$grades.scores.n2', ''] }, null, { $toDouble: '$grades.scores.n2' }]}},
          avgN3: { $avg: { $cond: [{ $eq: ['$grades.scores.n3', ''] }, null, { $toDouble: '$grades.scores.n3' }]}},
        }
      },
      {
        $group: {
          _id: {
            groupId: "$_id.groupId",
            competency: "$_id.competency",
            term:"$_id.term"

          },
          avgN1: { $avg: "$avgN1" },
          avgN2: { $avg: "$avgN2" },
          avgN3: { $avg: "$avgN3" }
        }
      },
      {
        $project: {
          _id: 0,
          groupId: "$_id.groupId",
          competency: "$_id.competency",
          term:"$_id.term",
          avgN1: 1,
          avgN2: 1,
          avgN3: 1
        }
      }
      

      

      ]);




        res.json({ result });


    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
//-----------------------------------------------

// @desc get average grrade for a specific cp and level and course
// @route GET/statistics
// @access Private

const AverageOneCompetencyByLevelByCourseAndAllTermsN = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId, competency, level} = req.params;

    try {
      const activityIdsAggregate = await Activity.aggregate([
        {
          $match: { courseId: mongoose.Types.ObjectId(courseId)}
        },
        {
          $group: {
            _id: '$_id',
            studentCount: { $sum: 1 }
          }
        }
      ]);



      if (activityIdsAggregate.length === 0) {
        return res.status(404).json({ message: 'No activities found for the given course' });
      }

      const activityIds = activityIdsAggregate.map((activity) => activity._id);

      const result = await Grade.aggregate([
        {
          $match: {
            'scores.cp': competency,
            activityId: { $in: activityIds },
            "isValidGrade":true
          }
        },
        {
          $unwind: '$scores'
        },
        {
          $match: {
            'scores.cp': competency,
            [`scores.${level}`]: { $nin: ['', null] }
          }
        },
        {
          $group: {
            _id: '$activityId',
            avgLevel: { $avg: { $toDouble: `$scores.${level}` } },
            studentCount: { $addToSet: '$studentId' }
          }
        },
        {
          $group: {
            _id: null,
            results: {
              $push: {
                activityId: '$_id',
                averageGrade: '$avgLevel',
                studentCount: { $size: '$studentCount' }
              }
            }
          }
        }
      ]);

      if (result.length > 0) {
        res.json({ activities: result[0].results });
      } else {
        res.status(404).json({ message: 'No grades found for the given criteria' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);



//------------------------------------------------



// @desc get average grade for all levels, a specific cp and course
// @route GET/statistics
// @access Private

const AverageOneCompetencyAllLevelsByCourseAllterms = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { courseId, competency } = req.params;

  try {
    const courseIdObj = mongoose.Types.ObjectId(courseId);

    const activityIdsAggregate = await Activity.aggregate([
      {
        $match: { courseId: courseIdObj } // Filter activities by courseId
      },

    ]);

    const activityIds = activityIdsAggregate.map((activity) => activity._id);

    const result = await Grade.aggregate([
      {
        $match: {
          'scores.cp': competency,
          activityId: { $in: activityIds },
          "isValidGrade":true
        }
      },
      {
        $unwind: '$scores'
      },
      {
        $match: {
          'scores.cp': competency,
          $or: [
            { 'scores.n1': { $nin: ['', null] } },
            { 'scores.n2': { $nin: ['', null] } },
            { 'scores.n3': { $nin: ['', null] } }
          ]
        }
      },
      {
        $facet: {
          n1: [
            {
              $match: { 'scores.n1': { $nin: ['', null] } }
            },
            {
              $group: {
                _id: null,
                avgGrade: { $avg: { $toDouble: '$scores.n1' } },
                studentCount: { $sum: { $cond: [{ $ne: ['$scores.n1', ''] }, 1, 0] } }
              }
            },
            {
              $project: {
                _id: 0,
                level: 'n1',
                avgGrade: 1,
                studentCount: 1
              }
            }
          ],
          n2: [
            {
              $match: { 'scores.n2': { $nin: ['', null] } }
            },
            {
              $group: {
                _id: null,
                avgGrade: { $avg: { $toDouble: '$scores.n2' } },
                studentCount: { $sum: { $cond: [{ $ne: ['$scores.n2', ''] }, 1, 0] } }
              }
            },
            {
              $project: {
                _id: 0,
                level: 'n2',
                avgGrade: 1,
                studentCount: 1
              }
            }
          ],
          n3: [
            {
              $match: { 'scores.n3': { $nin: ['', null] } }
            },
            {
              $group: {
                _id: null,
                avgGrade: { $avg: { $toDouble: '$scores.n3' } },
                studentCount: { $sum: { $cond: [{ $ne: ['$scores.n3', ''] }, 1, 0] } }
              }
            },
            {
              $project: {
                _id: 0,
                level: 'n3',
                avgGrade: 1,
                studentCount: 1
              }
            }
          ],

        }
      },
      {
        $project: {
          activities: {
            $concatArrays: ['$n1', '$n2', '$n3']
          },

        }
      },

    ]);

    if (result.length > 0) {
      res.json({ activities: result[0].activities });
    } else {
      res.status(404).json({ message: 'No grades found for the specified criteria' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc get average grade for all levels,all competenciesand all groups for a course and term
// @route GET/statistics
// @access Private

const AverageAllCompetenciesAllLevelsByCourseByTermN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array());
    }

    const { term, courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const activityIdsAggregate = await Activity.aggregate([
      {
        $match: {
          $and: [
            { courseId: mongoose.Types.ObjectId(courseId) },
            { term: term }
            //term: { $in: [term] } also works
          ]
        }
      }
    ]);
    const factor = 1.5; // Set your desired threshold value here

    if (activityIdsAggregate.length === 0) {
      return res.status(404).json({ message: 'No activities found for the specified criteria' });
    }

    const activityIds = activityIdsAggregate.map(activity => activity._id);
    console.log("ActivitiesId:::::::",activityIds)


    const result = await Grade.aggregate([
      {
        $match: {
          activityId: { $in: activityIds },
          "isValidGrade":true
       
         // 'scores.n3': { $exists: true, $ne: null } // Filter out documents where avgN3 is null
        }
      },
      {
        $lookup:{
          from: "activities",
          localField: "activityId",
          foreignField: "_id",
          as: "activity"
        }
      },
      { $unwind: "$activity" },
      {
        $lookup:{
          from: "courses",
          localField: "activity.courseId",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },
      {
        $lookup:{
          from: "groups",
          localField: "activity.groupId",
          foreignField: "_id",
          as: "group"
        }
      },
      { $unwind: "$group" },
      {
        $lookup: {
          from: "users",
          localField: "group.teacherId",
          foreignField: "_id",
          as: "teacher"
        }
      },
      { $unwind: "$teacher" },
      { $unwind: "$scores" },
      {
        $match: {
          $or: [
            { 'scores.n1': { $nin: ['', null] } },
            { 'scores.n2': { $nin: ['', null] } },
            { 'scores.n3': { $nin: ['', null] } }
          ]
        }
      },

      {
        $group:{
          _id: {
            course: "$course.name",
            c_Id: "$course.c_Id",
            //group: "$group.g_Id",
            group: "$group",
            competency: "$scores.cp",
            term: "$activity.term",
            estudiante: "$studentId",
            teachername:"$teacher.name"

          },
          
          avgN1: {
            $avg: {
              $cond: [
                { $eq: ['$scores.n1', ''] },
                null,
                { $convert: { input: '$scores.n1', to: "double" } }
              ]
            }
          },
          numScoresN1: {
            $sum: { $cond: [{ $ne: ["$scores.n1", ''] }, 1, 0] }
          },
          avgN2: {
            $avg: {
              $cond: [
                { $eq: ['$scores.n2', ''] },
                null,
                { $convert: { input: '$scores.n2', to: "double" } }
              ]
            }
          },
          numScoresN2: {
            $sum: { $cond: [{ $ne: ["$scores.n2", ''] }, 1, 0] }
          },
          avgN3: {
            $avg: {
              $cond: [
                { $eq: ['$scores.n3', ''] },
                null,
                { $convert: { input: '$scores.n3', to: "double" } }
              ]
            }
          },
          numScoresN3: {
            $sum: { $cond: [{ $ne: ["$scores.n3", ''] }, 1, 0] }
          },
          scoresN1: {
          $push: {$cond: [{ $eq: ['$scores.n1', ''] }, null, { $convert: { input: '$scores.n1', to: "double" } } ]},
          },
          scoresN2: {
          $push: {$cond: [{ $eq: ['$scores.n2', ''] }, null, { $convert: { input: '$scores.n2', to: "double" } }]},
          },
          scoresN3: {
          $push: {$cond: [{ $eq: ['$scores.n3', ''] }, null, { $convert: { input: '$scores.n3', to: "double" } }]},
          },
          numTakers:{
            $sum:1
          },

        }
      },
    

      {
        $group: {
          _id: {
            course: "$_id.course",
            c_Id: "$_id.c_Id",
            group: "$_id.group",
            competency: "$_id.competency",
            term: "$_id.term",
            teacherName: "$_id.teachername",
          },
          avgN1: { $first: "$avgN1" },
          numScoresN1: { $first: "$numScoresN1" },
          avgN2: { $first: "$avgN2" },
          numScoresN2: { $first: "$numScoresN2" },
          avgN3: { $first: "$avgN3" },
          numScoresN3: { $first: "$numScoresN3" },
          numTakers: { $first: "$numTakers" },
        }
      },
      {
        $addFields: {
          avgN1Pass: {
            $cond: [{ $and: [{ $gte: ["$avgN1", factor] }, { $ne: ["$avgN1", null] }] }, 1, 0]
          },
          avgN2Pass: {
            $cond: [{ $and: [{ $gte: ["$avgN2", factor] }, { $ne: ["$avgN2", null] }] }, 1, 0]
          },
          avgN3Pass: {
            $cond: [{ $and: [{ $gte: ["$avgN3", factor] }, { $ne: ["$avgN3", null] }] }, 1, 0]
          }
        }
      },
      {
        $group:{
          _id:{
              course: "$_id.course",
              c_Id: "$_id.c_Id",
              activities: "$_id.group.activities",
              g_Id: "$_id.group.g_Id",
              teacherName:"$_id.teacherName",
              competency: "$_id.competency",
              term: "$_id.term",
              passedN1:"$avgN1Pass",
              passedN2:"$avgN2Pass",
              passedN3:"$avgN3Pass"
            },
            avgN1: { $first: "$avgN1" },
            avgN2: { $first: "$avgN2" },
            avgN3: { $first: "$avgN3" },
            numTakers: { $first: "$numTakers" },
           
            

        }
      },
      {
        $addFields: {
          numActivities: { $size: "$_id.activities" } // Add numActivities field
        }
      },
      {
        $project: {
          "_id.course": 1,
          "_id.c_Id": 1,
          "_id.g_Id": 1,
          "_id.teacherName": 1,
          "_id.competency": 1,
          "_id.term": 1,
           numActivities:1,
          "_id.passedN1": 1,
          "_id.passedN2": 1,
          "_id.passedN3": 1,
         
          avgN1: 1,
          avgN2: 1,
          avgN3: 1,
          numTakers: 1,
          passsedPercentN1: { $multiply: [{ $divide: ["$_id.passedN1", "$numTakers"] }, 100] },
          passsedPercentN2: { $multiply: [{ $divide: ["$_id.passedN2", "$numTakers"] }, 100] },
          passsedPercentN3: { $multiply: [{ $divide: ["$_id.passedN3", "$numTakers"] }, 100] },

        }
      },
          
     
      
    ]);

    if (result.length > 0) {
      res.json({ activities: result });
    } else {
      res.status(404).json({ message: 'No grades found for the specified criteria' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// @desc get average grade for all levels,all competencies and all groups for a course and term
// @route GET/statistics
// @access Private

const AverageAllCompetenciesAllLevelsByCourseAllTermsN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array());
    }

    const { courseId, threshold } = req.params;
    
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    //-------------------------------------------------------------------------
      // Extract group IDs associated with the course
      const courseGroupIds = course.groups.map(groupId => mongoose.Types.ObjectId(groupId));
  
      // Aggregate to count active students
      const totalActiveStudents = await User.aggregate([
        {
          $match: {
            'registeredInGroups.groupId': { $in: courseGroupIds },
            'registeredInGroups.isActive': true
          }
        },
        {
          $group: {
            _id: null,
            totalActiveStudents: { $sum: 1 }
          }
        }
      ]);
  
      if (totalActiveStudents.length === 0) {
        return res.status(404).json({ error: 'No active students in the course' });
      }
  
      const totalActiveStudentsInCourse=totalActiveStudents[0].totalActiveStudents;


    //----------------------------------------------------------------------------


    const activityIdsAggregate = await Activity.aggregate([
      {
        $match: {
         courseId: mongoose.Types.ObjectId(courseId) 
        }
      }
    ]);
    let factor = parseFloat(threshold); // Set your desired threshold value here

    if (activityIdsAggregate.length === 0) {
      return res.status(404).json({ message: 'No activities found for the specified criteria' });
    }

    const activityIds = activityIdsAggregate.map(activity => activity._id);

    const result = await Grade.aggregate([
      {
        $match: {
          activityId: { $in: activityIds },
          "isValidGrade":true
       
        }
      },
      {
        $lookup:{
          from: "activities",
          localField: "activityId",
          foreignField: "_id",
          as: "activity"
        }
      },
      { 
        $unwind: "$activity" 
      },
      {
        $match: {
          "activity.completed": true
        }
      },
      {
        $lookup:{
          from: "courses",
          localField: "activity.courseId",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },
      {
        $lookup:{
          from: "groups",
          localField: "activity.groupId",
          foreignField: "_id",
          as: "group"
        }
      },
      { $unwind: "$group" },
      {
        $lookup: {
          from: "users",
          localField: "group.teacherId",
          foreignField: "_id",
          as: "teacher"
        }
      },
      { $unwind: "$teacher" },
      { $unwind: "$scores" },
      {
        $match: {
          $or: [
            { 'scores.n1': { $nin: ['', null] } },
            { 'scores.n2': { $nin: ['', null] } },
            { 'scores.n3': { $nin: ['', null] } }
          ]
        }
      },

      {
        $group:{
          _id: {
            course: "$course.name",
            group: "$group",
            competency: "$scores.cp",
            estudiante: "$studentId",
          },
         
          avgN1: {
            $avg: {
              $cond: [
                { $eq: ['$scores.n1', ''] },
                null,
                { $convert: { input: '$scores.n1', to: "double" } }
              ]
            }
          },
          numScoresN1: {
            $sum: { $cond: [{ $ne: ["$scores.n1", ''] }, 1, 0] }
          },
          avgN2: {
            $avg: {
              $cond: [
                { $eq: ['$scores.n2', ''] },
                null,
                { $convert: { input: '$scores.n2', to: "double" } }
              ]
            }
          },
          numScoresN2: {
            $sum: { $cond: [{ $ne: ["$scores.n2", ''] }, 1, 0] }
          },
          avgN3: {
            $avg: {
              $cond: [
                { $eq: ['$scores.n3', ''] },
                null,
                { $convert: { input: '$scores.n3', to: "double" } }
              ]
            }
          },
          numScoresN3: {
            $sum: { $cond: [{ $ne: ["$scores.n3", ''] }, 1, 0] }
          },
          scoresN1: {
          $push: {$cond: [{ $eq: ['$scores.n1', ''] }, null, { $convert: { input: '$scores.n1', to: "double" } } ]},
          },
          scoresN2: {
          $push: {$cond: [{ $eq: ['$scores.n2', ''] }, null, { $convert: { input: '$scores.n2', to: "double" } }]},
          },
          scoresN3: {
          $push: {$cond: [{ $eq: ['$scores.n3', ''] }, null, { $convert: { input: '$scores.n3', to: "double" } }]},
          },
          activityDoc: {$push: {term:"$activity.term",description:"$activity.description",activityId:"$activity._id",rubrica:{$arrayElemAt:["$activity.rubric",0]}, numOfActivities:"$group.activities", tipo:{$arrayElemAt:["$activity.type",0]}}},
          teacherName:{$first:"$teacher.name"},
         
        }
      },
      {
      $group:{
        _id: {
          course: "$_id.course",
          group: "$_id.group",
          competency: "$_id.competency",
        },
       
        numTakersN1:{$sum:"$numScoresN1"},         //Number of registers for N1
        numTakersN2:{$sum:"$numScoresN2"},         //Number of registers for N2
        numTakersN3:{$sum:"$numScoresN3"},         //Number of registers for N3
        activityDoc: { $first: "$activityDoc" },
        //activityDoc: { $addToSet: "$activityDoc.activityId" },
        teacherName:{$first:"$teacherName"},
        numStudentsN11:{$push:"$scoresN1"},       //Number of students contributing to N1
        numStudentsN22:{$push:"$scoresN2"},       //Number of students contributing to N2
        numStudentsN33:{$push:"$scoresN3"},        //Number of students contributing to N3
        dataGroupAvgN1: {$push:"$avgN1"} ,
        dataGroupAvgN2: {$push:"$avgN2"} ,
        dataGroupAvgN3: {$push:"$avgN3"},
        numGroupStudents:{$first:"$_id.group.students"}
      }
     },

     {
      $addFields: {

        countStudentsAboveThresholdForN1: {
          $size: {
            $filter: {
              input: "$dataGroupAvgN1",
              as: "score", // Use an alias for clarity
              cond: { $gt: ["$$score", factor] }  // Adjust the threshold value as needed   XXXX
            }
          }
        },
        countStudentsAboveThresholdForN2: {
          $size: {
            $filter: {
              input: "$dataGroupAvgN2",
              as: "score", // Use an alias for clarity
              cond: { $gt: ["$$score", factor] }  // Adjust the threshold value as needed   XXXX
            }
          }
        },
        countStudentsAboveThresholdForN3: {
          $size: {
            $filter: {
              input: "$dataGroupAvgN3",
              as: "score", // Use an alias for clarity
              cond: { $gt: ["$$score", factor] }  // Adjust the threshold value as needed   XXXX
            }
          }
        },

        numOfactivitiesPerformedInTerm: {
          $reduce: {
            input: "$activityDoc",
            initialValue: { T1: 0, T2: 0, T3: 0 },
            in: {
              T1: {
                $cond: { if: { $eq: ["$$this.term", "1"] }, then: { $add: ["$$value.T1", 1] }, else: "$$value.T1" }
              },
              T2: {
                $cond: { if: { $eq: ["$$this.term", "2"] }, then: { $add: ["$$value.T2", 1] }, else: "$$value.T2" }
              },
              T3: {
                $cond: { if: { $eq: ["$$this.term", "3"] }, then: { $add: ["$$value.T3", 1] }, else: "$$value.T3" }
              }
            }
          }
        },
        totalActivities:{$size:"$activityDoc.numOfActivities"},
        
      },
           
    },
{
  $project:{
  passsedPercentN1_RelativeToGroup:{
      $cond: {
        if: { $eq: ["countStudentsAboveThresholdForN1", 0] },
        then: 0,
        else: {
          $multiply: [
            { $divide: ["$countStudentsAboveThresholdForN1", {$size:"$numGroupStudents"}] },
            100
          ]
        }
      }
    },
    passsedPercentN2_RelativeToGroup:{
      $cond: {
        if: { $eq: ["countStudentsAboveThresholdForN2", 0] },
        then: 0,
        else: {
          $multiply: [
            { $divide: ["$countStudentsAboveThresholdForN2", {$size:"$numGroupStudents"}] },
            100
          ]
        }
      }
    },
    passsedPercentN3_RelativeToGroup:{
      $cond: {
        if: { $eq: ["countStudentsAboveThresholdForN3", 0] },
        then: 0,
        else: {
          $multiply: [
            { $divide: ["$countStudentsAboveThresholdForN3", {$size:"$numGroupStudents"}] },
            100
          ]
        }
      }
    },
    passsedPercentN1_RelativeToCourse:{
      $cond: {
        if: { $eq: ["countStudentsAboveThresholdForN1", 0] },
        then: 0,
        else: {
          $multiply: [
            { $divide: ["$countStudentsAboveThresholdForN1", {$literal:totalActiveStudentsInCourse}] },
            100
          ]
        }
      }
    },
    passsedPercentN2_RelativeToCourse:{
      $cond: {
        if: { $eq: ["countStudentsAboveThresholdForN2", 0] },
        then: 0,
        else: {
          $multiply: [
            { $divide: ["$countStudentsAboveThresholdForN2", {$literal:totalActiveStudentsInCourse}] },
            100
          ]
        }
      }
    },
    passsedPercentN3_RelativeToCourse:{
      $cond: {
        if: { $eq: ["countStudentsAboveThresholdForN3", 0] },
        then: 0,
        else: {
          $multiply: [
            { $divide: ["$countStudentsAboveThresholdForN3", {$literal:totalActiveStudentsInCourse}] },
            100
          ]
        }
      }
    },        
    
    numOfactivitiesPerformedInTerm:1,
    totalActivities:1,
    countStudentsAboveThresholdForN1:1,
    countStudentsAboveThresholdForN2:1,
    countStudentsAboveThresholdForN3:1,
    teacherName:1,
    numTakersN1:1,
    numTakersN2:1,
    numTakersN3:1
  }
},



    // {
    //   $addFields: {
    //     avgN1Pass: {
    //       $cond: [{ $and: [{ $gt: ["$avgN1", factor] }, { $ne: ["$avgN1", null] }] }, 1, 0]
    //     },
    //     avgN2Pass: {
    //       $cond: [{ $and: [{ $gt: ["$avgN2", factor] }, { $ne: ["$avgN2", null] }] }, 1, 0]
    //     },
    //     avgN3Pass: {
    //       $cond: [{ $and: [{ $gt: ["$avgN3", factor] }, { $ne: ["$avgN3", null] }] }, 1, 0]
    //     },
    //     // activityPerformedInTerm: {
    //     //   $map: {
    //     //     input: "$activityDoc",
    //     //     as: "item",
    //     //     in: "$$item.term" 
    //     //   }
    //     // },

    //     activityPerformedInTerm: {
    //       $reduce: {
    //         input: "$activityDoc",
    //         initialValue: { T1: 0, T2: 0, T3: 0 },
    //         in: {
    //           T1: {
    //             $cond: { if: { $eq: ["$$this.term", "1"] }, then: { $add: ["$$value.T1", 1] }, else: "$$value.T1" }
    //           },
    //           T2: {
    //             $cond: { if: { $eq: ["$$this.term", "2"] }, then: { $add: ["$$value.T2", 1] }, else: "$$value.T2" }
    //           },
    //           T3: {
    //             $cond: { if: { $eq: ["$$this.term", "3"] }, then: { $add: ["$$value.T3", 1] }, else: "$$value.T3" }
    //           }
    //         }
    //       }
    //     },
    //     numActivities:{$size:"$activityDoc"},
    //   }
    // },

    // {
    //   $project:{
    //     "_id.course": 1,
    //     "g_Id": "$_id.group.g_Id",
    //     "teacherName":1,
    //     "_id.competency": 1,
    //     "numActivities":1,
    //     "activityPerformedInTerm": 1,
    //     "avgN1Pass": 1,
    //     "avgN2Pass": 1,
    //     "avgN3Pass": 1,
    //     numTakersN1:1,
    //       passedPercentN1_RelativeToGroup: {
    //         $cond: {
    //           if: { $eq: ["$numTakersN1", 0] },
    //           then: 0,
    //           else: {
    //             $multiply: [
    //               { $divide: ["$avgN1Pass", "$numTakersN1"] },
    //               100
    //             ]
    //           }
    //         }
    //       },
    //       numTakersN2:1,
    //       passedPercentN2_RelativeToGroup: {
    //         $cond: {
    //           if: { $eq: ["$numTakersN2", 0] },
    //           then: 0,
    //           else: {
    //             $multiply: [
    //               { $divide: ["$avgN2Pass", "$numTakersN2"] },
    //               100
    //             ]
    //           }
    //         }
    //       },
    //       numTakersN3:1,
    //       passedPercentN3_RelativeToGroup: {
    //         $cond: {
    //           if: { $eq: ["$numTakersN3", 0] },
    //           then: 0,
    //           else: {
    //             $multiply: [
    //               { $divide: ["$avgN3Pass", "$numTakersN3"] },
    //               100
    //             ]
    //           }
    //         }
    //       },

    //       totalActiveParticipantsInCourse:{$literal:totalActiveStudentsInCourse},

    //       passsedPercentN1_RelativeToCourse: { $multiply: [{ $divide: ["$avgN1Pass", totalActiveStudentsInCourse] }, 100] },
    //       passsedPercentN2_RelativeToCourse: { $multiply: [{ $divide: ["$avgN2Pass", totalActiveStudentsInCourse] }, 100] },
    //       passsedPercentN3_RelativeToCourse: { $multiply: [{ $divide: ["$avgN3Pass", totalActiveStudentsInCourse] }, 100] },
    //       numStudentsN1: {
    //         $size: {
    //           $filter: {
    //             input: "$numStudentsN11",
    //             cond: {
    //               $gt: [
    //                 {
    //                   $size: {
    //                     $setIntersection: ["$$this", [0, 1, 2]]
    //                   }
    //                 },
    //                 0
    //               ]
    //             }
    //           }
    //         }
    //       },
    //       //numStudentsN1:1,
    //       numStudentsN2: {
    //         $size: {
    //           $filter: {
    //             input: "$numStudentsN22",
    //             cond: {
    //               $gt: [
    //                 {
    //                   $size: {
    //                     $setIntersection: ["$$this", [0, 1, 2]]
    //                   }
    //                 },
    //                 0
    //               ]
    //             }
    //           }
    //         }
    //       },
    //       //numStudentsN22:1,
    //       numStudentsN3: {
    //         $size: {
    //           $filter: {
    //             input: "$numStudentsN33",
    //             cond: {
    //               $gt: [
    //                 {
    //                   $size: {
    //                     $setIntersection: ["$$this", [0, 1, 2]]
    //                   }
    //                 },
    //                 0
    //               ]
    //             }
    //           }
    //         }
    //       },
    //       //numStudentsN33:1


    //   }
    // },
    {
      $group: {
        _id:"$_id.competency",
      info: { $push: "$$ROOT" } // Push the current document to the "groups" array
      },
    },
    {
      $sort:{"_id":1} //Sort competencies alphabetically
    }
   
      
    ]);

   
    if (result.length > 0) {
      res.json({ activities: result });
    } else {
      res.status(404).json({ message: 'No grades found for the specified criteria' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  




// @desc get average grade for one competency one level by course, group teacher and by term
// @route GET/statistics
// @access Private

//This endpoint computes the averages grades for a given competency and level for all students that took part in each of the activities. 
// For each activity is reported the average grade, the number of students that participated in such activity, the frequency ("scoreFrequencies") 
//of each of the possible grades (0, 1 or 2), the number of grades in each bucket ("scoreBuckets") where the range of the buckets is [0,0.5),[0.5,1.0),
//,[1.0,1.5) and ,[1.5,2.01). The last interval is a little bit wider to catch number 2. Finally, the endPoint also calculates the average competency for all
//activities considering the weighted average (promedio ponderado). 
// competencyAvg = Sumation of (AvgCompetency_i*participants_i)/(Sumation of (participants_i))
//
const  AverageOneCompetencyByLevelAndByGroupByCourseByTeacherByTermN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array());
    }

    const { teacherId, courseId, groupId, competency, level, term } = req.params;

    const teacher = await User.findOne({ _id: teacherId, roles: 'teacher' }).select('name');
    const group = await Group.findById(groupId).select('g_Id');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    

    const activityIdsAggregate = await Activity.aggregate([
      {
        $match: {
          courseId: mongoose.Types.ObjectId(courseId),
          groupId: mongoose.Types.ObjectId(groupId),
          teacherId: mongoose.Types.ObjectId(teacherId),
          term:term
        }
      },
      
    ]);

    if (activityIdsAggregate.length === 0) {
      return res.status(404).json({ message: 'No activities found for the specified criteria' });
    }

    const activityIds = activityIdsAggregate.map((activity) => activity._id);

    const numActivities=activityIds.length
    console.log("activityIds:::::::byTerm",activityIds)

    const result = await Grade.aggregate([
      {
        $match: {
          // 'scores.cp': competency,
          activityId: { $in: activityIds },
          "isValidGrade":true
        }
      },
      {
        $unwind: '$scores'
      },
      {
        $match: {
          'scores.cp': competency,
          [`scores.${level}`]: { $nin: ['', null] }
        }
      },
      {
        $group: {
          _id: '$activityId',
          avgLevel: {
            $avg: {
              $cond: [{ $eq: [`$scores.${req.params.level}`, ""] }, null, { $toDouble: `$scores.${req.params.level}` }]
            }
          },
          studentCount: { $addToSet: '$studentId' },
          //scores:{$push:`$scores.${req.params.level}`},
          scores: {$push:{$cond: [{ $eq: [`$scores.${req.params.level}`, ""] }, null, { $toDouble: `$scores.${req.params.level}` }]}},
          

        }
      },
      {
        $addFields: {
          scoreBuckets: {
            $map: {
              input: [
                { start: 0, end: 0.2 },
                { start: 0.2, end: 0.4 },
                { start: 0.4, end: 0.6 },
                { start: 0.6, end: 0.8 },
                { start: 0.8, end: 1.0 },
                { start: 1.0, end: 1.2 },
                { start: 1.2, end: 1.4 },
                { start: 1.4, end: 1.6 },
                { start: 1.6, end: 1.8 },
                { start: 1.8, end: 2.001 },

                
              ],
              as: "range",
              in: {
                bucket: {
                  $concat: [
                    { $toString: "$$range.start" },
                    " - ",
                    { $toString: "$$range.end" }
                  ]
                },
                count: {
                  $size: {
                    $filter: {
                      input: "$scores",
                      as: "score",
                      cond: {
                        $and: [
                          { $gte: ["$$score", "$$range.start"] },
                          { $lt: ["$$score", "$$range.end"] } // Adjusted condition
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
,
      {
        $addFields: {
          scoreFrequencies: {
            $arrayToObject: {
              $map: {
                input: [0, 1, 2],
                as: "score",
                in: {
                  k: { $toString: "$$score" },
                  v: {
                    $reduce: {
                      input: "$scores",
                      initialValue: 0,
                      in: {
                        $cond: [{ $eq: ["$$this", "$$score"] }, { $add: ["$$value", 1] }, "$$value"]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },     
      
      {
        $set: {
          level: req.params.level,  // n1,n2 and n3
          competency: req.params.competency, // CL, UTF, PRC, UCM, ULC
          numActivities:numActivities
          
        }
      },
      {
        $project: {
          _id: 0,
          activityId: '$_id',
          averageGrade: '$avgLevel',
          studentCount: { $size: '$studentCount' },
          teacherName: teacher.name,
          groupId: group.g_Id,
          competency: 1,
          level: 1,
          numActivities:1,
          term: req.params.term, // CL, UTF, PRC, UCM, ULC
          scores:1,
          scoreBuckets:1,
          scoreFrequencies:1
                   
        }
      },
      {
        $group: {
          _id: {
            level: "$level",
            competency: "$competency",
            term: "$term",
            teacherName: "$teacherName",
            groupId: "$groupId",
            numActivities:"$numActivities"
          },
          activities: {
            $push: {
              activityId: "$activityId",
              averageGrade: "$averageGrade",
              studentCount: "$studentCount",
              scores:"$scores",
              scoreBuckets:"$scoreBuckets",
              scoreFrequencies:"$scoreFrequencies",
              
              
            }
          },
          numParticipants:{$sum:"$studentCount"},
          competencyWeight: { $sum: { $multiply: ["$averageGrade", "$studentCount"] } }
        }
      },

      {
        $project: {
          _id: 0,
          groupId:"$_id.groupId",
          teacherName: "$_id.teacherName",
          term: "$_id.term",
          competency: "$_id.competency",
          level: "$_id.level",
          numActivities:"$_id.numActivities",
          activities: 1,
          numParticipants:1,
          competencyAvg:{$divide:["$competencyWeight","$numParticipants"]}
         
        }
      },
      
    ]);

    console.log("result:.......:::",result)

    if (result.length > 0) {
      res.json({ activities: result });
    } else {
      res.status(404).json({ message: 'No grades found for the specified criteria' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  });

const  AverageOneCompetencyAllLevelslByGroupByCourseByTeacherAllTermsN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { teacherId, courseId, groupId, competency } = req.params;

    console.log("Req.params:::::::AllTerms",req.params)

    const teacher = await User.findOne({ _id: teacherId, roles: 'teacher' }).select('name');
    const group = await Group.findById(groupId).select('g_Id');
    const course = await Group.findById(courseId).select('c_Id');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const activityIdsAggregate = await Activity.aggregate([
      {
        $match: {
          courseId: mongoose.Types.ObjectId(courseId),
          groupId: mongoose.Types.ObjectId(groupId),
          teacherId: mongoose.Types.ObjectId(teacherId),
        },
      },
      // {
      //   $group: {
      //     _id: '$_id',
      //     //studentCount: { $sum: 1 },
      //   },
      // },
    ]);
    console.log("activityIdsAggregate:::::Allterms",activityIdsAggregate)

    const activityIds = activityIdsAggregate.map((activity) => activity._id);
    console.log("activityIds:allTerms",activityIds)

    const result = await Grade.aggregate([
    {
      $match: {
        //'scores.cp': competency,
        activityId: { $in: activityIds },
        "isValidGrade":true
        // $or: [
        //   { 'scores.n1': { $nin: ['', null] } },
        //   { 'scores.n2': { $nin: ['', null] } },
        //   { 'scores.n3': { $nin: ['', null] } },
        // ],
      },
    },
    {
      $unwind: '$scores'
    },
    {
      $match: {
        'scores.cp': competency,
        $or: [
          { 'scores.n1': { $nin: ['', null] } },
          { 'scores.n2': { $nin: ['', null] } },
          { 'scores.n3': { $nin: ['', null] } }
        ]
      }
    },
    {
      $lookup: {
        from: 'activities',
        localField: 'activityId',
        foreignField: '_id',
        as: 'activity'
      }
    },
    {
      $unwind: '$activity'
    },
    {
      $lookup: {
        from: 'groups',
        localField: 'activity.groupId',
        foreignField: '_id',
        as: 'group'
      }
    },
    {
      $unwind: '$group'
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'activity.courseId',
        foreignField: '_id',
        as: 'course'
      }
    },
    {
      $unwind: '$course'
    },
    {
      $lookup: {
        from: 'users',
        localField: 'activity.teacherId',
        foreignField: '_id',
        as: 'teacher'
      }
    },
    {
      $unwind: '$teacher'
    },
    {
      $group: {
        _id: '$activityId',
        //avgN1: { $avg: { $cond: [{ $ne: ['$scores.n1', ''] }, { $toDouble: '$scores.n1' }, null] } },
        avgN1: { $avg: { $cond: [{ $eq: ['$scores.n1', ''] }, null, { $convert: {input: '$scores.n1', to: "double" } }]}},
        countAvgN1:{$sum:{$cond:[{$ne:["$scores.n1",'']},1,0]}},
        countN1V:{$push:{$cond: [
          { $ne: ['$scores.n1', ''] }, // Check if score is not null
          '$scores.n1', // If not null, push the score
          null, // If null, push nothing
        ]}},

        //avgN2: { $avg: { $cond: [{ $ne: ['$scores.n2', ''] }, { $toDouble: '$scores.n2' }, null] } },
        avgN2: { $avg: { $cond: [{ $eq: ['$scores.n2', ''] }, null, { $convert: {input: '$scores.n2', to: "double" } }]}},
        countAvgN2:{$sum:{$cond:[{$ne:["$scores.n2",'']},1,0]}},
        countN2V:{$push:{$cond: [
          { $ne: ['$scores.n2', ''] }, // Check if score is not null
          '$scores.n2', // If not null, push the score
          null, // If null, push nothing
        ]}},

        //avgN3: { $avg: { $cond: [{ $ne: ['$scores.n3', ''] }, { $toDouble: '$scores.n3' }, null] } },
        avgN3: { $avg: { $cond: [{ $eq: ['$scores.n3', ''] }, null, { $convert: {input: '$scores.n3', to: "double" } }]}},
        countAvgN3:{$sum:{$cond:[{$ne:["$scores.n3",'']},1,0]}},
        countN3V:{$push:{$cond: [
          { $ne: ['$scores.n3', ''] }, // Check if score is not null
          '$scores.n3', // If not null, push the score
          null, // If null, push nothing
        ]}},

        studentCount: { $addToSet: '$studentId' },
        teacherName: { $first: '$teacher.name' },
        groupId: { $first: '$group.g_Id' },
        //courseId: { $first: '$activity.courseId' },
        courseId: { $first: '$course.c_Id' },
        activityId: { $first: '$activity._id' },
      }
    },

    {
      $project: {
        _id: 0,
        activityId: '$_id',
        avgN1: '$avgN1',
        avgN2: '$avgN2',
        avgN3: '$avgN3',
        studentCount: { $size: '$studentCount' },
        gradesN1: {   // Prepare array of grades (convert string numbers to doubles and remove nulls) to compute the standard deviation further below
          $filter: {
            input: {
              $map: {
                input: "$countN1V",
                as: "grade",
                in: {
                  $cond: {
                    if: { $ne: ["$$grade", null] },
                    then: { $toDouble: "$$grade" },
                    else: null,
                  },
                },
              },
            },
            as: "grade",
            cond: { $ne: ["$$grade", null] },
          },
        },
        gradesN2: {  // Prepare array of grades (convert string numbers to doubles and remove nulls) to compute the standard deviation further below
          $filter: {
            input: {
              $map: {
                input: "$countN2V",
                as: "grade",
                in: {
                  $cond: {
                    if: { $ne: ["$$grade", null] },
                    then: { $toDouble: "$$grade" },
                    else: null,
                  },
                },
              },
            },
            as: "grade",
            cond: { $ne: ["$$grade", null] },
          },
        },
        gradesN3: {  // Prepare array of grades (convert string numbers to doubles and remove nulls) to compute the standard deviation further below
          $filter: {
            input: {
              $map: {
                input: "$countN3V",
                as: "grade",
                in: {
                  $cond: {
                    if: { $ne: ["$$grade", null] },
                    then: { $toDouble: "$$grade" },
                    else: null,
                  },
                },
              },
            },
            as: "grade",
            cond: { $ne: ["$$grade", null] },
          },
        },

        countN1V_: {
          $size: {
              $filter: {
                  input: '$countN1V',
                  as: 'count',
                  cond: { $ne: ['$$count', null] },
              },
          },
        },

        countN2V_: {
          $size: {
              $filter: {
                  input: '$countN2V',
                  as: 'count',
                  cond: { $ne: ['$$count', null] },
              },
          },
        },
        countN3V_: {
          $size: {
              $filter: {
                  input: '$countN3V',
                  as: 'count',
                  cond: { $ne: ['$$count', null] },
              },
          },
        },

        teacherName: '$teacherName',
        groupId: '$groupId',
        courseId: '$courseId',
       

      }
    },
    {
      $group: {
        _id: null,
        activities: {
          $push: {
            // ... (existing fields)
            activityId:'$activityId',
            teacherName: '$teacherName',
            courseId:'$courseId',
            groupId:'$groupId',
            averages: {
              n1: { $ifNull: ['$avgN1', 0] },
              n2: { $ifNull: ['$avgN2', 0] },
              n3: { $ifNull: ['$avgN3', 0] }
            },
            studentCount: '$studentCount',

            actNumStudN1:{$size:'$gradesN1'},
            actNumStudN2:{$size:'$gradesN2'},
            actNumStudN3:{$size:'$gradesN3'},

            stdDevN1:{ $stdDevSamp: '$gradesN1' },
            stdDevN2:{ $stdDevSamp: '$gradesN2' },
            stdDevN3:{ $stdDevSamp: '$gradesN3' },

          }
        },
        totalStudents: { $sum: '$studentCount' } ,
        totalActNumStudentsN1: { $sum: '$countN1V_' } ,
        totalActNumStudentsN2: { $sum: '$countN2V_' } ,
        totalActNumStudentsN3: { $sum: '$countN3V_' } ,


      }
    },
    {
      $project: {
        _id: 0,
        activities: 1,
        totalStudents: 1,
        numActivities: { $size: '$activities' },
        avgN1Total: {
          $divide: [
            { $sum: { $map: { input: '$activities', as: 'a', in: { $multiply: ['$$a.averages.n1', '$$a.actNumStudN1'] } } } },
            { $ifNull: ['$totalActNumStudentsN1', 1] },
          ],
        },
        avgN2Total: {
          $divide: [
            { $sum: { $map: { input: '$activities', as: 'a', in: { $multiply: ['$$a.averages.n2', '$$a.actNumStudN2'] } } } },
            { $ifNull: ['$totalActNumStudentsN2', 1] },
          ],
        },
        avgN3Total: {
          $divide: [
            { $sum: { $map: { input: '$activities', as: 'a', in: { $multiply: ['$$a.averages.n3', '$$a.actNumStudN3'] } } } },
            { $ifNull: ['$totalActNumStudentsN3', 1] },
          ],
        },
      },
    },
  ]);

  if (result.length > 0) {
    res.json(result[0]);
  } else {
    res.status(404).json({ message: 'No grades found for the specified criteria' });
  }
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
});




const  AverageOneCompetencyAllLevelslByGroupByCourseByTeacherByTermN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { teacherId, courseId, groupId, competency, term } = req.params;

    console.log("Req.params::::::::::::::byTerm",req.params)

    const teacher = await User.findOne({ _id: teacherId, roles: 'teacher' }).select('name');
    const group = await Group.findById(groupId).select('g_Id');
    const course = await Group.findById(courseId).select('c_Id');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const activityIdsAggregate = await Activity.aggregate([
      {
        $match: {
          courseId: mongoose.Types.ObjectId(courseId),
          groupId: mongoose.Types.ObjectId(groupId),
          teacherId: mongoose.Types.ObjectId(teacherId),
          term:term
        },
      },
      // {
      //   $group: {
      //     _id: '$_id',
      //     studentCount: { $sum: 1 },
      //   },
      // },
    ]);
    console.log("activityIdsAggregate::::byTerm",activityIdsAggregate)

    const activityIds = activityIdsAggregate.map((activity) => activity._id);
    console.log("activityIds:::byTerm",activityIds)

    const result = await Grade.aggregate([
    {
      $match: {
      
        activityId: { $in: activityIds },
        "isValidGrade":true
       
      },
    },
    {
      $unwind: '$scores'
    },
    {
      $match: {
        'scores.cp': competency,
        $or: [
          { 'scores.n1': { $nin: ['', null] } },
          { 'scores.n2': { $nin: ['', null] } },
          { 'scores.n3': { $nin: ['', null] } }
        ]
      }
    },
    {
      $lookup: {
        from: 'activities',
        localField: 'activityId',
        foreignField: '_id',
        as: 'activity'
      }
    },
    {
      $unwind: '$activity'
    },
    {
      $lookup: {
        from: 'groups',
        localField: 'activity.groupId',
        foreignField: '_id',
        as: 'group'
      }
    },
    {
      $unwind: '$group'
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'activity.courseId',
        foreignField: '_id',
        as: 'course'
      }
    },
    {
      $unwind: '$course'
    },
    {
      $lookup: {
        from: 'users',
        localField: 'activity.teacherId',
        foreignField: '_id',
        as: 'teacher'
      }
    },
    {
      $unwind: '$teacher'
    },
    {
      $group: {
        _id: '$activityId',
        //avgN1: { $avg: { $cond: [{ $ne: ['$scores.n1', ''] }, { $toDouble: '$scores.n1' }, null] } },
        avgN1: { $avg: { $cond: [{ $eq: ['$scores.n1', ''] }, null, { $convert: {input: '$scores.n1', to: "double" } }]}},
        countAvgN1:{$sum:{$cond:[{$ne:["$scores.n1",'']},1,0]}},
        countN1V:{$push:{$cond: [
          { $ne: ['$scores.n1', ''] }, // Check if score is not null
          '$scores.n1', // If not null, push the score
          null, // If null, push nothing
        ]}},

        //avgN2: { $avg: { $cond: [{ $ne: ['$scores.n2', ''] }, { $toDouble: '$scores.n2' }, null] } },
        avgN2: { $avg: { $cond: [{ $eq: ['$scores.n2', ''] }, null, { $convert: {input: '$scores.n2', to: "double" } }]}},
        countAvgN2:{$sum:{$cond:[{$ne:["$scores.n2",'']},1,0]}},
        countN2V:{$push:{$cond: [
          { $ne: ['$scores.n2', ''] }, // Check if score is not null
          '$scores.n2', // If not null, push the score
          null, // If null, push nothing
        ]}},

        //avgN3: { $avg: { $cond: [{ $ne: ['$scores.n3', ''] }, { $toDouble: '$scores.n3' }, null] } },
        avgN3: { $avg: { $cond: [{ $eq: ['$scores.n3', ''] }, null, { $convert: {input: '$scores.n3', to: "double" } }]}},
        countAvgN3:{$sum:{$cond:[{$ne:["$scores.n3",'']},1,0]}},
        countN3V:{$push:{$cond: [
          { $ne: ['$scores.n3', ''] }, // Check if score is not null
          '$scores.n3', // If not null, push the score
          null, // If null, push nothing
        ]}},

        studentCount: { $addToSet: '$studentId' },
        teacherName: { $first: '$teacher.name' },
        groupId: { $first: '$group.g_Id' },
        //courseId: { $first: '$activity.courseId' },
        courseId: { $first: '$course.c_Id' },
        activityId: { $first: '$activity._id' },
      }
    },

    {
      $project: {
        _id: 0,
        activityId: '$_id',
        avgN1: '$avgN1',
        avgN2: '$avgN2',
        avgN3: '$avgN3',
        studentCount: { $size: '$studentCount' },
        gradesN1: {   // Prepare array of grades (convert string numbers to doubles and remove nulls) to compute the standard deviation further below
          $filter: {
            input: {
              $map: {
                input: "$countN1V",
                as: "grade",
                in: {
                  $cond: {
                    if: { $ne: ["$$grade", null] },
                    then: { $toDouble: "$$grade" },
                    else: null,
                  },
                },
              },
            },
            as: "grade",
            cond: { $ne: ["$$grade", null] },
          },
        },
        gradesN2: {  // Prepare array of grades (convert string numbers to doubles and remove nulls) to compute the standard deviation further below
          $filter: {
            input: {
              $map: {
                input: "$countN2V",
                as: "grade",
                in: {
                  $cond: {
                    if: { $ne: ["$$grade", null] },
                    then: { $toDouble: "$$grade" },
                    else: null,
                  },
                },
              },
            },
            as: "grade",
            cond: { $ne: ["$$grade", null] },
          },
        },
        gradesN3: {  // Prepare array of grades (convert string numbers to doubles and remove nulls) to compute the standard deviation further below
          $filter: {
            input: {
              $map: {
                input: "$countN3V",
                as: "grade",
                in: {
                  $cond: {
                    if: { $ne: ["$$grade", null] },
                    then: { $toDouble: "$$grade" },
                    else: null,
                  },
                },
              },
            },
            as: "grade",
            cond: { $ne: ["$$grade", null] },
          },
        },

        countN1V_: {
          $size: {
              $filter: {
                  input: '$countN1V',
                  as: 'count',
                  cond: { $ne: ['$$count', null] },
              },
          },
        },

        countN2V_: {
          $size: {
              $filter: {
                  input: '$countN2V',
                  as: 'count',
                  cond: { $ne: ['$$count', null] },
              },
          },
        },
        countN3V_: {
          $size: {
              $filter: {
                  input: '$countN3V',
                  as: 'count',
                  cond: { $ne: ['$$count', null] },
              },
          },
        },

        teacherName: '$teacherName',
        groupId: '$groupId',
        courseId: '$courseId',

      }
    },
    {
      $group: {
        _id: null,
        activities: {
          $push: {
            // ... (existing fields)
            activityId:'$activityId',
            teacherName: '$teacherName',
            courseId:'$courseId',
            groupId:'$groupId',
            averages: {
              n1: { $ifNull: ['$avgN1', 0] },
              n2: { $ifNull: ['$avgN2', 0] },
              n3: { $ifNull: ['$avgN3', 0] }
            },
            studentCount: '$studentCount',

            actNumStudN1:{$size:'$gradesN1'},
            actNumStudN2:{$size:'$gradesN2'},
            actNumStudN3:{$size:'$gradesN3'},

            stdDevN1:{ $stdDevSamp: '$gradesN1' },
            stdDevN2:{ $stdDevSamp: '$gradesN2' },
            stdDevN3:{ $stdDevSamp: '$gradesN3' },

          }
        },
        totalStudents: { $sum: '$studentCount' } ,
        totalActNumStudentsN1: { $sum: '$countN1V_' } ,
        totalActNumStudentsN2: { $sum: '$countN2V_' } ,
        totalActNumStudentsN3: { $sum: '$countN3V_' } ,


      }
    },
    {
      $project: {
        _id: 0,
        activities: 1,
        totalStudents: 1,
        numActivities: { $size: '$activities' },
        avgN1Total: {
          $divide: [
            { $sum: { $map: { input: '$activities', as: 'a', in: { $multiply: ['$$a.averages.n1', '$$a.actNumStudN1'] } } } },
            { $ifNull: ['$totalActNumStudentsN1', 1] },
          ],
        },
        avgN2Total: {
          $divide: [
            { $sum: { $map: { input: '$activities', as: 'a', in: { $multiply: ['$$a.averages.n2', '$$a.actNumStudN2'] } } } },
            { $ifNull: ['$totalActNumStudentsN2', 1] },
          ],
        },
        avgN3Total: {
          $divide: [
            { $sum: { $map: { input: '$activities', as: 'a', in: { $multiply: ['$$a.averages.n3', '$$a.actNumStudN3'] } } } },
            { $ifNull: ['$totalActNumStudentsN3', 1] },
          ],
        },
        term:`${req.params.term}`
      },
    },
    
  ]);

  if (result.length > 0) {
    res.json(result[0]);
  } else {
    res.status(404).json({ message: 'No grades found for the specified criteria' });
  }
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
});



//----------------------------------Begin-------------------------------------
const  AverageAllCompetenciesAllLevelslByCourseByTeacherAllTermsN= asyncHandler(async (req, res) => {
// Handle validation errors
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

try {
  const { courseId, teacherId } = req.params;

  const averages = await Grade.aggregate([
    {
      $match:{ "isValidGrade":true},
      "isValidGrade":true
    },
    {
      $lookup: {
        from: 'activities',
        localField: 'activityId',
        foreignField: '_id',
        as: 'activity'
      }
    },
    {
      $unwind: '$activity'
    },
    {
      $lookup: {
        from: 'groups',
        localField: 'activity.groupId',
        foreignField: '_id',
        as: 'group'
      }
    },
    {
      $unwind: {
        path: '$group',
        preserveNullAndEmptyArrays: true // Preserve documents without matching group
      }
    },
    {
      $match: {
        'group.teacherId': mongoose.Types.ObjectId(teacherId),
        'group.courseId': mongoose.Types.ObjectId(courseId)
      }
    },
    { $unwind: '$scores' },
    {
      $group: {
        _id: {
          groupId: '$group._id',
          competency: '$scores.cp',
          studentId: '$studentId'
        },
        avgN1: { $avg: { $cond: [{ $eq: ['$scores.n1', ''] }, null, { $convert: {input: '$scores.n1', to: "double" } }]}},
        countAvgN1:{$sum:{$cond:[{$ne:["$scores.n1",'']},1,0]}},
        avgN2: { $avg: { $cond: [{ $eq: ['$scores.n2', ''] }, null, { $convert: {input: '$scores.n2', to: "double" } }]}},
        countAvgN2:{$sum:{$cond:[{$ne:["$scores.n2",'']},1,0]}},
        avgN3: { $avg: { $cond: [{ $eq: ['$scores.n3', ''] }, null, { $convert: {input: '$scores.n3', to: "double" } }]}},
        countAvgN3:{$sum:{$cond:[{$ne:["$scores.n3",'']},1,0]}},
      }
    },
    {
      $group: {
        _id: {
          groupId: '$_id.groupId',
          competency: '$_id.competency'
        },
        avgN1: { $avg: '$avgN1' },
        avgN2: { $avg: '$avgN2' },
        avgN3: { $avg: '$avgN3' }
      }
    },
    {
      $group: {
        _id: '$_id.groupId',
        group: { $first: '$group' },
        grades: {
          $push: {
            competency: '$_id.competency',
            avgN1: '$avgN1',
            avgN2: '$avgN2',
            avgN3: '$avgN3'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        groupId: '$_id',
        group: {
          $cond: {
            if: { $eq: ['$group', null] },
            then: '$_id',
            else: '$group.g_Id'
          }
        },
        grades: 1
      }
    },
    {
      $lookup: {
        from: 'groups',
        localField: 'groupId',
        foreignField: '_id',
        as: 'groupDetails'
      }
    },
    {
      $addFields: {
        group: {
          $cond: {
            if: { $eq: [{ $size: '$groupDetails' }, 0] },
            then: '$group',
            else: { $arrayElemAt: ['$groupDetails.g_Id', 0] }
          }
        }
      }
    },
    {
      $project: {
        groupId: 0,
        groupDetails: 0
      }
    }
  ]);

  res.status(200).json({ averages });
} catch (err) {
  console.error(err);
  res.status(500).json({ message: 'Server Error' });
}
});
//----------------------------------End---------------------------------------

const  HistogramAllCompetenciesAllLevelslByCourseAllTermsN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array());
    }

    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    
    const activityIdsAggregate = await Activity.aggregate([
      {
        $match: {
          courseId: mongoose.Types.ObjectId(courseId),
        }
      },
      
    ]);

    if (activityIdsAggregate.length === 0) {
      return res.status(404).json({ message: 'No activities found for the specified criteria' });
    }

    const activityIds = activityIdsAggregate.map((activity) => activity._id);

    const numActivities=activityIds.length
    console.log("activityIds:::::::All Terms",activityIds)

    const result = await Grade.aggregate([
      {
        $match: {
          // 'scores.cp': competency,
          activityId: { $in: activityIds },
          "isValidGrade":true
        }
      },
      {
        $lookup:{
          from:"activities",
          localField:"activityId",
          foreignField:"_id",
          as:"activity"
        }
      },
      {
        $unwind:"$activity"
      },
      {
        $match: {
          "activity.completed": true
        }
      },
      {
        $lookup:{
          from:"groups",
          localField:"activity.groupId",
          foreignField:"_id",
          as:"group"
        } 
      },
      {
        $unwind: '$group'
      },
      
      {
        $unwind: '$scores'
      },
      {
        $match: {
          //'scores.cp': competency,
          $or: [
            { 'scores.n1': { $nin: ['', null] } },
            { 'scores.n2': { $nin: ['', null] } },
            { 'scores.n3': { $nin: ['', null] } }
          ]
        }
      },
      {
        $lookup:{
          from:"users",
          localField:"studentId",
          foreignField:"_id",
          as:"user"
        } 
      },
      {
        $unwind:"$user"
      },

      {
        $group:{
          _id:{grupo:"$group.g_Id",studentName:"$user.name", competency:"$scores.cp"},
          avgN1: {
              $avg: {
                $cond: [{ $eq: ["$scores.n1", ""] }, null, { $toDouble: "$scores.n1" }]
              }
            },
            // studentCountN1: { $addToSet: '$studentId' },
            scoresN1: {$push:{$cond: [{ $eq: ["$scores.n1", ""] }, null, { $toDouble: "$scores.n1" }]}},

            avgN2: {
              $avg: {
                $cond: [{ $eq: ["$scores.n2", ""] }, null, { $toDouble: "$scores.n2" }]
              }
            },
            // studentCountN2: { $addToSet: '$studentId' },
            scoresN2: {$push:{$cond: [{ $eq: ["$scores.n2", ""] }, null, { $toDouble: "$scores.n2" }]}},

            avgN3: {
              $avg: {
                $cond: [{ $eq: ["$scores.n3", ""] }, null, { $toDouble: "$scores.n3" }]
              }
            },
            // studentCountN3: { $addToSet: '$studentId' },
            scoresN3: {$push:{$cond: [{ $eq: ["$scores.n3", ""] }, null, { $toDouble: "$scores.n3" }]}},


            
        }
      },
      {
        $group:
        {
          _id:{competencia:"$_id.competency"},
          avgN1Array:{$push:"$avgN1"},  
          avgN2Array:{$push:"$avgN2"},
          avgN3Array:{$push:"$avgN3"},
        }
      },
      
      {
        $addFields: {
          histogramN1: {
            $map: {
              input: [
                { start: 0, end: 0.4 },
                { start: 0.4, end: 0.8 },
                { start: 0.8, end: 1.2 },
                { start: 1.2, end: 1.4 },
                { start: 1.4, end: 1.6 },
                { start: 1.6, end: 1.8 },
                { start: 1.8, end: 2.001 },

                
              ],
              as: "range",
              in: {
                bucket: {
                  $concat: [
                    { $toString: "$$range.start" },
                    " - ",
                    { $toString: "$$range.end" }
                  ]
                },
                count: {
                  $size: {
                    $filter: {
                      input: "$avgN1Array",
                      as: "score",
                      cond: {
                        $and: [
                          { $gte: ["$$score", "$$range.start"] },
                          { $lt: ["$$score", "$$range.end"] } // Adjusted condition
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        },
      },
      {
        $addFields: {
          histogramN2: {
            $map: {
              input: [
                { start: 0, end: 0.4 },
                { start: 0.4, end: 0.8 },
                { start: 0.8, end: 1.2 },
                { start: 1.2, end: 1.4 },
                { start: 1.4, end: 1.6 },
                { start: 1.6, end: 1.8 },
                { start: 1.8, end: 2.001 },


                
              ],
              as: "range",
              in: {
                bucket: {
                  $concat: [
                    { $toString: "$$range.start" },
                    " - ",
                    { $toString: "$$range.end" }
                  ]
                },
                count: {
                  $size: {
                    $filter: {
                      input: "$avgN2Array",
                      as: "score",
                      cond: {
                        $and: [
                          { $gte: ["$$score", "$$range.start"] },
                          { $lt: ["$$score", "$$range.end"] } // Adjusted condition
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        },
      },
      {
        $addFields: {
          histogramN3: {
            $map: {
              input: [
                { start: 0, end: 0.4 },
                { start: 0.4, end: 0.8 },
                { start: 0.8, end: 1.2 },
                { start: 1.2, end: 1.4 },
                { start: 1.4, end: 1.6 },
                { start: 1.6, end: 1.8 },
                { start: 1.8, end: 2.001 },


                
              ],
              as: "range",
              in: {
                bucket: {
                  $concat: [
                    { $toString: "$$range.start" },
                    " - ",
                    { $toString: "$$range.end" }
                  ]
                },
                count: {
                  $size: {
                    $filter: {
                      input: "$avgN3Array",
                      as: "score",
                      cond: {
                        $and: [
                          { $gte: ["$$score", "$$range.start"] },
                          { $lt: ["$$score", "$$range.end"] } // Adjusted condition
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        },
      },
      {
        $project:{
          //competency:{$literal:req.params.competency},
          avgN1Array:1,
          participantsN1:{$size:"$avgN1Array"},
          histogramN1: {
            $map: {
                input: "$histogramN1",
                as: "item",
                in: {
                    bucket: "$$item.bucket",
                    count:{$round:[{
                      $multiply: [
                         
                          { $divide: ["$$item.count", {$size:"$avgN1Array"}] },
                          // Multiply by 100
                          100
                      ]
                  },2]} 
                }
            }
        },
          avgN2Array:1,
          participantsN2:{$size:"$avgN2Array"},
          histogramN2: {
            $map: {
                input: "$histogramN2",
                as: "item",
                in: {
                    bucket: "$$item.bucket",
                    count: {$round:[{
                      $multiply: [
                         
                          { $divide: ["$$item.count", {$size:"$avgN2Array"}] },
                          // Multiply by 100
                          100
                      ]
                  },2]}
                }
            }
        },
          avgN3Array:1,
          participantsN3:{$size:"$avgN3Array"},
          histogramN3: {
            $map: {
                input: "$histogramN3",
                as: "item",
                in: {
                    bucket: "$$item.bucket",
                    count:{$round:[{
                      $multiply: [
                         
                          { $divide: ["$$item.count", {$size:"$avgN3Array"}] },
                          // Multiply by 100
                          100
                      ]
                  },2]} 
                }
            }
        },

        }
      },
     {
      $sort:{"_id.competencia":1} //Sort output alphabetically by competencies
     }
      

      
    ]);


    if (result.length > 0) {
      res.json({ activities: result });
    } else {
      res.status(404).json({ message: 'No grades found for the specified criteria' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  });

  const  GetTotalStudentsActiveInACourseN= asyncHandler(async (req, res) => {
    try {
      const courseId = req.params.courseId;
  
      // Validate courseId
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ error: 'Invalid courseId' });
      }
  
      // Fetch the course details
      const course = await Course.findById(courseId);
  
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
  
      // Extract group IDs associated with the course
      const courseGroupIds = course.groups.map(groupId => mongoose.Types.ObjectId(groupId));
  
      // Aggregate to count active students
      const totalActiveStudents = await User.aggregate([
        {
          $match: {
            'registeredInGroups.groupId': { $in: courseGroupIds },
            'registeredInGroups.isActive': true
          }
        },
        {
          $group: {
            _id: null,
            totalActiveStudents: { $sum: 1 }
          }
        }
      ]);
  
      if (totalActiveStudents.length === 0) {
        return res.status(404).json({ error: 'No active students in the course' });
      }
  
      res.json({ totalActiveStudentsInCourse: totalActiveStudents[0].totalActiveStudents });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = {
    AverageOneActivityByCompetencyByLevelAndByTermN ,
    AverageOneActivityByCompetencyByLevelAndByAllTermN ,

    AverageOneCompetencyByLevelByCourseAndByTermN,
    AverageOneCompetencyByLevelByCourseAndAllTermsN,
    AverageOneCompetencyAllLevelsByCourseAllterms,
    
    AverageAllCompetenciesAllLevelsByCourseByTermN,
    AverageAllCompetenciesAllLevelsByCourseAllTermsN,

    AverageOneCompetencyByLevelAndByGroupByCourseByTeacherByTermN,

    AverageOneCompetencyAllLevelslByGroupByCourseByTeacherAllTermsN,
    AverageOneCompetencyAllLevelslByGroupByCourseByTeacherByTermN,

    AverageAllCompetenciesAllLevelslByCourseByTeacherAllTermsN, //All his/her groups included.

    HistogramAllCompetenciesAllLevelslByCourseAllTermsN,

    GetTotalStudentsActiveInACourseN

}



