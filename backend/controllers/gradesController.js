const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Grade = require('../models/Grade'); // Import the Grade model
const Activity = require('../models/Activity'); // Import the Activity model
const Group = require('../models/Group'); // Import the Group model
const Course = require('../models/Course'); // Import the Group model
const User = require('../models/User');
const DateInfo = require('../models/DateInfo');




//------------------------Start of Endpoint------------------------

// @desc Create new grade
// @route GET/grades
// @access Private
const getStudentGradesByCouseByGroupAndByTermN= asyncHandler(async (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { courseId, groupId, term } = req.query;
        const { studentId } = req.params;


       // Use aggregation to retrieve grades based on courseId, groupId, term, and studentId
    const grades = await Grade.aggregate([
      {
        $match: {
          studentId: mongoose.Types.ObjectId(studentId),
          "isValidGrade":true,
          activityId: {
            $in: await getActivityIds(courseId, groupId, term)
          }
        }
      },

        {
          $unwind: '$scores' // Deconstruct the scores array
        },

        // Filter out documents with empty grades
        {
          $match: {
            $or: [
              { 'scores.n1': { $nin: ['', null] } },
              { 'scores.n2': { $nin: ['', null] } },
              { 'scores.n3': { $nin: ['', null] } }
            ]
          }
        },


       // Group by competency and calculate averages for n1, n2, and n3
        {
          $group: {
            _id: '$scores.cp', // Group by competency
            avgN1: { $avg: { $cond: [{ $eq: ['$scores.n1', ''] }, null, { $toDouble: '$scores.n1' }]}},
            avgN2: { $avg: { $cond: [{ $eq: ['$scores.n2', ''] }, null, { $toDouble: '$scores.n2' }]}},
            avgN3: { $avg: { $cond: [{ $eq: ['$scores.n3', ''] }, null, { $toDouble: '$scores.n3' }]}},


            //grades: { $push: "$$ROOT" } // Group grades by activityId
            grades: {
              $push: {
                _id: "$_id",
                studentId: "$studentId",
                activityId: "$activityId",
                scores: "$scores",
                term:term
              }
            }
          }
        },

        // Add activityNum field with sequential numbering starting from 1
  {
    $addFields: {
      grades: {
        $map: {
          input: "$grades",
          as: "grade",
          in: {
            $mergeObjects: [
              "$$grade",
              {
                activityNum: {
                  $add: [
                    {
                      $indexOfArray: ["$grades._id", "$$grade._id"]
                    },
                    1
                  ]
                }
              }
            ]
          }
        }
      }
    }
  },
        // Sort by competency (cp)
        { $sort: { _id: 1 } } // 1 for ascending order, -1 for descending order

    ]);

    res.json(grades);
} catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
}
});
//"This code works, I only using aggregations just for fun"
// Function to retrieve activityIds based on courseId, groupId, and term
// async function getActivityIds(courseId, groupId, term) {
//   const group = await Group.findOne({ courseId, _id: groupId }); // Find the group based on courseId and groupId
//   if (!group) return [];

//   const activities = await Activity.find({
//       _id: { $in: group.activities }, // Find activities within the group's activity list
//       term // Filter activities by term
//   });

//   if (!activities || activities.length === 0) return [];

//   return activities.map(activity => mongoose.Types.ObjectId(activity._id)); // Return activityIds as ObjectId
// }
async function getActivityIds(courseId, groupId, term) {
  const groupActivities = await Group.aggregate([
    {
      $match: {
        courseId: mongoose.Types.ObjectId(courseId),
        _id: mongoose.Types.ObjectId(groupId)
      }
    },
    {
      $addFields: {
        activityIds: {
          $map: {
            input: "$activities",
            as: "activity",
            in: { $toObjectId: "$$activity" }
          }
        }
      }
    },
    {
      $lookup: {
        from: "activities",
        localField: "activityIds",
        foreignField: "_id",
        as: "activities"
      }
    },
    {
      $unwind: "$activities"
    },
    {
      $match: {
        "activities.term": term
      }
    },
    {
      $group: {
        _id: null,
        activityIds: { $push: "$activities._id" }
      }
    }
  ]);

  return groupActivities.length ? groupActivities[0].activityIds : [];
}
//------------------------End of Endpoint------------------------

// @desc
// @route GET/grades
// @access Private

const getStudentGradesAllCoursesByTermN = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { term, studentId } = req.params;
    const factor=1.5


    const activityIds = await Grade.aggregate(
      [
      {
        $match: {
          'studentId': mongoose.Types.ObjectId(studentId),
          "isValidGrade":true
        }
      },
      {
        $lookup: {
          from: 'activities',
          localField: 'activityId',
          foreignField: '_id',
          as: 'activity',
        },
      },
      {$match:{
        "activity.term":{$eq:term}}
      },
      {
        $unwind: '$activity'
      },

      {
        $lookup: {
          from: 'courses',
          let: { courseId: '$activity.courseId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$courseId'] }
              }
            },
            {
              $project: {
                name: 1,
                _id:0,
                //description: 1,
                c_Id: 1,
                //groups: 1
              }
            },
            {
              $unset: ['coordinator'], // Exclude the coordinator field
              //$unset: ['name']
            }
          ],
          as: 'course',
        },
      },
      {
        $unwind: '$course'
      },
      {
        $lookup: {
          from: 'groups',
          let: { groupId: '$activity.groupId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$groupId'] }
              }
            },
            {
              $project: {
                //courseId: 1,
                //teacherId: 1,
                _id:0,
                g_Id: 1,
                //activityCounterT1: 1,
                //activityCounterT2: 1,
                //activityCounterT3: 1,
                //classSize: 1,
                activities: 1,
              }
            },
            // {
            //   $unset: ['activities']
            // }
          ],
          as: 'group',
        },
      },
      {
        $unwind: '$group'
      },

      {
        $unwind:'$scores'
      },

      // {
      //   $lookup: {
      //     from: 'activities',
      //     localField: 'group.activities',
      //     foreignField: '_id',
      //     as: 'entireActivity' //Delete this! every part
      //   }
      // },

      {
        $group: {
        //_id: {competency:'$scores.cp',curso:'$course', grupo:'$group'},
        _id: {
          competency:'$scores.cp',
          curso:'$course',
          grupo: '$group',
          term: term
        },


        avgN1: { $avg: { $cond: [{ $eq: ['$scores.n1', ''] }, null, { $convert: {input: '$scores.n1', to: "double" } }]}},
        countAvgN1:{$sum:{$cond:[{$ne:["$scores.n1",'']},1,0]}},
        countN1V:{$push:{$cond: [
          { $ne: ['$scores.n1', ''] }, // Check if score is not null
          '$scores.n1', // If not null, push the score
          null, // If null, push nothing
        ]}},
        avgN2: { $avg: { $cond: [{ $eq: ['$scores.n2', ''] }, null, { $convert: {input: '$scores.n2', to: "double" } }]}},
        countAvgN2:{$sum:{$cond:[{$ne:["$scores.n2",'']},1,0]}},
        countN2V:{$push:{$cond: [
          { $ne: ['$scores.n2', ''] }, // Check if score is not null
          '$scores.n2', // If not null, push the score
          null, // If null, push nothing
        ]}},

        avgN3: { $avg: { $cond: [{ $eq: ['$scores.n3', ''] }, null, { $convert: {input: '$scores.n3', to: "double" } }]}},
        countAvgN3:{$sum:{$cond:[{$ne:["$scores.n3",'']},1,0]}},
        countN3V:{$push:{$cond: [
          { $ne: ['$scores.n3', ''] }, // Check if score is not null
          '$scores.n3', // If not null, push the score
          null, // If null, push nothing
        ]}},
        activitiesId:{$push:"$activityId"},
        activityCount: { $addToSet: '$activityId' },

       // entireActivity: { $first: '$entireActivity' }, // Include the entireActivity field in the group


        grades: {
          $push: {

            n1: {  $cond: [{ $eq: ['$scores.n1', ''] }, null, { $convert: {input: '$scores.n1', to: "double" } }]},
            n2: {  $cond: [{ $eq: ['$scores.n2', ''] }, null, { $convert: {input: '$scores.n2', to: "double" } }] },
            n3: {  $cond: [{ $eq: ['$scores.n3', ''] }, null, { $convert: {input: '$scores.n3', to: "double" } }] },

          }
        },

      }
    },
    {$lookup:{
      from:"activities",
      localField:"activitiesId",
      foreignField:"_id",
      as:"student_activities"
    }},

    {
      $project:{
        _id:0,

        competency: '$_id.competency',
        grades:'$grades',
        // curso: '$_id.curso',
        c_Id: '$_id.curso.c_Id',
        g_Id: '$_id.grupo.g_Id',
        activitiesId: '$activitiesId',
        numActivities:{$size:'$activityCount'},
        grades:1,
        avgN1:1,
        avgN2:1,
        avgN3:1,
        passN1:{
          $cond: {
            if: { $gte: ["$avgN1", factor] },
            then: true, // Value to project if condition is true
            else: false
          }
          },
        passN2:{
          $cond: {
            if: { $gte: ["$avgN2", factor] },
            then: true, // Value to project if condition is true
            else: false
          }
          },
        passN3:{
          $cond: {
            if: { $gte: ["$avgN3", factor] },
            then: true, // Value to project if condition is true
            else: false
          }
          },

        //avgN: [{avgN1:"$avgN1"}, {avgN3:"$avgN3"}, {avgN3:"$avgN3"}], // Put avgN1, avgN2, avgN3 into an array
        term: '$_id.term', // Include the term field in the projection
        applieddate: {
          $map: {
            input: "$student_activities.activityAppliedDate", // The original dates array
            as: "date", // Alias for each element in the array
            in: {
              $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$$date", timezone: "UTC" } // Convert to desired format
            }
          }
      },
      description:"$student_activities.description",
        //description:'$entireActivity.description',
        //type:'$entireActivity.type',
        type: {
          $reduce: {
            input: "$student_activities.type", // The nested array field
            initialValue: [], // Initialize an empty array
            in: { $concatArrays: ["$$value", "$$this"] } // Concatenate each element to the accumulator
          }
        }

      }
    },
//  Now the info is consolidated and displayed by course. (You can visualized the info using: https://jsoneditoronline.org/#left=local.gifocu)
    {
      $group: {
          _id: {curso:"$c_Id",grupo:"$g_Id"},
          Curso: { $push: "$$ROOT" }
      }
  },
  {
      $project: {
          _id: 0,
          courseName: "$_id",
        Curso: 1,

        // description:{$arrayElemAt: [ "$Curso.description", 0 ]},
        // grades:{$arrayElemAt: [ "$Curso.grades", 0 ]},
        // activities:{$arrayElemAt: [ "$Curso.activities", 0 ]},
        // numActivities:{$arrayElemAt: [ "$Curso.numActivities", 0 ]},
        // competency: "$Curso.competency",
  //       AvgN1:{$arrayElemAt: [ "$Curso.avgN1", 0 ]},
  //       AvgN2:{$arrayElemAt: [ "$Curso.avgN2", 0 ]},
  //       AvgN3:{$arrayElemAt: [ "$Curso.avgN2", 0 ]},
  //        AvgN1:"$Curso.avgN1",
  //        AvgN2:"$Curso.avgN2",
  //        avgN3:"$Curso.avgN3"
 }
  },



 // {
//   $project:
//   {
//     grades: {
//       $map: {
//         input: '$Curso.grades',
//         as: 'grade',
//         in: {
//           n1: '$$grade.n1',
//           n2: '$$grade.n2',
//           n3: '$$grade.n3'
//         }
//       }
//     },
//     courseName: '$courseName',
//     term: '$Curso.term',
//     applieddate: '$Curso.applieddate',
//     description: '$Cursodescription',
//     type: '$tCurso.ype',
//     avgN1: '$Curso.avgN1',
//     avgN2: '$Curso.avgN2',
//     avgN3: '$Curso.avgN3',

//   },

//   }

    ]
    );

    if (!activityIds || activityIds.length === 0) { // Changed condition here
      return res.status(404).json({ error: 'No activity found that match the criteria' });
    }


    //res.status(200).json({activityIds });
    res.status(200).json({activityIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});











// @desc
// @route GET/grades
// @access Private

const getStudentGradesAllCoursesAllTermsN = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId } = req.params;
    const factor=1.5


    const activityIds = await Grade.aggregate(
      [
      {
        $match: {
          'studentId': mongoose.Types.ObjectId(studentId),
          "isValidGrade":true
        }
      },
      {
        $lookup: {
          from: 'activities',
          localField: 'activityId',
          foreignField: '_id',
          as: 'activity',
        },
      },

      {
        $unwind: '$activity'
      },
      {
        $lookup: {
          from: 'courses',
          let: { courseId: '$activity.courseId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$courseId'] }
              }
            },
            {
              $project: {
                name: 1,
                _id:0,
                //description: 1,
                c_Id: 1,
                //groups: 1
              }
            },
            {
              $unset: ['coordinator'], // Exclude the coordinator field
              //$unset: ['name']
            }
          ],
          as: 'course',
        },
      },
      {
        $unwind: '$course'
      },
      {
        $lookup: {
          from: 'groups',
          let: { groupId: '$activity.groupId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$groupId'] }
              }
            },
            {
              $project: {
                //courseId: 1,
                //teacherId: 1,
                _id:0,
                g_Id: 1,
                //activityCounterT1: 1,
                //activityCounterT2: 1,
                //activityCounterT3: 1,
                //classSize: 1,
                activities: 1,
              }
            },
            // {
            //   $unset: ['activities']
            // }
          ],
          as: 'group',
        },
      },
      {
        $unwind: '$group'
      },

      {
        $unwind:'$scores'
      },

      // {
      //   $lookup: {
      //     from: 'activities',
      //     localField: 'group.activities',
      //     foreignField: '_id',
      //     as: 'entireActivity' //Delete this! every part
      //   }
      // },

      {
        $group: {
        //_id: {competency:'$scores.cp',curso:'$course', grupo:'$group'},
        _id: {
          competency:'$scores.cp',
          curso:'$course',
          grupo: '$group',

        },


        avgN1: { $avg: { $cond: [{ $eq: ['$scores.n1', ''] }, null, { $convert: {input: '$scores.n1', to: "double" } }]}},
        countAvgN1:{$sum:{$cond:[{$ne:["$scores.n1",'']},1,0]}},
        countN1V:{$push:{$cond: [
          { $ne: ['$scores.n1', ''] }, // Check if score is not null
          '$scores.n1', // If not null, push the score
          null, // If null, push nothing
        ]}},
        avgN2: { $avg: { $cond: [{ $eq: ['$scores.n2', ''] }, null, { $convert: {input: '$scores.n2', to: "double" } }]}},
        countAvgN2:{$sum:{$cond:[{$ne:["$scores.n2",'']},1,0]}},
        countN2V:{$push:{$cond: [
          { $ne: ['$scores.n2', ''] }, // Check if score is not null
          '$scores.n2', // If not null, push the score
          null, // If null, push nothing
        ]}},

        avgN3: { $avg: { $cond: [{ $eq: ['$scores.n3', ''] }, null, { $convert: {input: '$scores.n3', to: "double" } }]}},
        countAvgN3:{$sum:{$cond:[{$ne:["$scores.n3",'']},1,0]}},
        countN3V:{$push:{$cond: [
          { $ne: ['$scores.n3', ''] }, // Check if score is not null
          '$scores.n3', // If not null, push the score
          null, // If null, push nothing
        ]}},
        activitiesId:{$push:"$activityId"},
        activityCount: { $addToSet: '$activityId' },

       // entireActivity: { $first: '$entireActivity' }, // Include the entireActivity field in the group


        grades: {
          $push: {

            n1: {  $cond: [{ $eq: ['$scores.n1', ''] }, null, { $convert: {input: '$scores.n1', to: "double" } }]},
            n2: {  $cond: [{ $eq: ['$scores.n2', ''] }, null, { $convert: {input: '$scores.n2', to: "double" } }] },
            n3: {  $cond: [{ $eq: ['$scores.n3', ''] }, null, { $convert: {input: '$scores.n3', to: "double" } }] },

          }
        },

      }
    },
    {$lookup:{
      from:"activities",
      localField:"activitiesId",
      foreignField:"_id",
      as:"student_activities"
    }},

    {
      $project:{
        _id:0,

        competency: '$_id.competency',
        grades:'$grades',
        // curso: '$_id.curso',
        c_Id: '$_id.curso.c_Id',
        g_Id: '$_id.grupo.g_Id',
        activitiesId: '$activitiesId',
        numActivities:{$size:'$activityCount'},
        grades:1,
        avgN1:1,
        avgN2:1,
        avgN3:1,
        passN1:{
          $cond: {
            if: { $gte: ["$avgN1", factor] },
            then: true, // Value to project if condition is true
            else: false
          }
          },
        passN2:{
          $cond: {
            if: { $gte: ["$avgN2", factor] },
            then: true, // Value to project if condition is true
            else: false
          }
          },
        passN3:{
          $cond: {
            if: { $gte: ["$avgN3", factor] },
            then: true, // Value to project if condition is true
            else: false
          }
          },


        //term: '$_id.term', // Include the term field in the projection
        applieddate: {
          $map: {
            input: "$student_activities.activityAppliedDate", // The original dates array
            as: "date", // Alias for each element in the array
            in: {
              $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$$date", timezone: "UTC" } // Convert to desired format
            }
          }
      },
      description:"$student_activities.description",
        //description:'$entireActivity.description',
        //type:'$entireActivity.type',
        type: {
          $reduce: {
            input: "$student_activities.type", // The nested array field
            initialValue: [], // Initialize an empty array
            in: { $concatArrays: ["$$value", "$$this"] } // Concatenate each element to the accumulator
          }
        }

      }
    },
//  Now the info is consolidated and displayed by course. (You can visualized the info using: https://jsoneditoronline.org/#left=local.gifocu)
    {
      $group: {
          _id: {curso:"$c_Id",grupo:"$g_Id"},
          Curso: { $push: "$$ROOT" }
      }
  },
  {
      $project: {
          _id: 0,
          courseName: "$_id",
        Curso: 1,

        // description:{$arrayElemAt: [ "$Curso.description", 0 ]},
        // grades:{$arrayElemAt: [ "$Curso.grades", 0 ]},
        // activities:{$arrayElemAt: [ "$Curso.activities", 0 ]},
        // numActivities:{$arrayElemAt: [ "$Curso.numActivities", 0 ]},
        // competency: "$Curso.competency",
  //       AvgN1:{$arrayElemAt: [ "$Curso.avgN1", 0 ]},
  //       AvgN2:{$arrayElemAt: [ "$Curso.avgN2", 0 ]},
  //       AvgN3:{$arrayElemAt: [ "$Curso.avgN2", 0 ]},
  //        AvgN1:"$Curso.avgN1",
  //        AvgN2:"$Curso.avgN2",
  //        avgN3:"$Curso.avgN3"
 }
  },



 // {
//   $project:
//   {
//     grades: {
//       $map: {
//         input: '$Curso.grades',
//         as: 'grade',
//         in: {
//           n1: '$$grade.n1',
//           n2: '$$grade.n2',
//           n3: '$$grade.n3'
//         }
//       }
//     },
//     courseName: '$courseName',
//     term: '$Curso.term',
//     applieddate: '$Curso.applieddate',
//     description: '$Cursodescription',
//     type: '$tCurso.ype',
//     avgN1: '$Curso.avgN1',
//     avgN2: '$Curso.avgN2',
//     avgN3: '$Curso.avgN3',

//   },

//   }

    ]
    );

    if (!activityIds || activityIds.length === 0) { // Changed condition here
      return res.status(404).json({ error: 'No activity found that match the criteria' });
    }


    //res.status(200).json({activityIds });
    res.status(200).json({activityIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// @desc Create new grade
// @route POST /grades
// @access Private
const createGradeN= asyncHandler(async (req, res) => {
    try {
        const { studentId, activityId, scores } = req.body;

        // Check if studentId and activityId are valid ObjectIds
        if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(activityId)) {
          return res.status(400).json({ error: 'Invalid studentId or activityId' });
        }

        // Create a new grade
        const newGrade = new Grade({
          studentId,
          activityId,
          scores,
        });

        // Save the new grade
        const savedGrade = await newGrade.save();

        res.status(201).json(savedGrade);
      } catch (error) {
        if (error.name === 'ValidationError') {
          const validationErrors = {};
          for (const field in error.errors) {
            validationErrors[field] = error.errors[field].message;
          }
          return res.status(400).json({ errors: validationErrors });
        }

        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

// @desc Create new grade
// @route PUT/grades
// @access Private
const updateGradeN= asyncHandler(async (req, res) => {
    try {
        // Extract gradeId from the request parameters
        const { gradeId } = req.params;

         // Check if gradeId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(gradeId)) {
            return res.status(400).json({ error: 'Invalid gradeId' });
        }

        // Validate the request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        // Find the grade by ID
        const existingGrade = await Grade.findById(gradeId);

        // Check if the grade exists
        if (!existingGrade) {
          return res.status(404).json({ error: 'Grade not found with the provided gradeId' });
        }

        // Update the grade with the new data
        existingGrade.scores = req.body.scores;

        // Save the updated grade
        const updatedGrade = await existingGrade.save();

        // Respond with the updated grade
        res.json(updatedGrade);
      } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
          const validationErrors = {};
          for (const field in error.errors) {
            validationErrors[field] = error.errors[field].message;
          }
          return res.status(400).json({ errors: validationErrors });
        }

        // Handle other errors
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

// @desc Create new grade
// @route PUT/grades
// @access Private
const updateOneCompetencyGradeN= asyncHandler(async (req, res) => {
  try {
    // Extract gradeId and cp from the request parameters
    const { gradeId, cp } = req.params;

      // Check if gradeId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(gradeId)) {
        return res.status(400).json({ error: 'Invalid gradeId' });
    }



    // Validate the request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find the grade by ID
    const existingGrade = await Grade.findById(gradeId);

    // Check if the grade exists
    if (!existingGrade) {
      return res.status(404).json({ error: 'Grade not found with the provided gradeId' });
    }

    // Update the grade with the new data for the specified cp
    const { n1, n2, n3 } = req.body;
    console.log("--------",n1,n2,n3)
    const index = existingGrade.scores.findIndex(score => score.cp === cp);
    console.log("Index",index)
    if (index !== -1) {
      existingGrade.scores[index].n1 = n1;
      existingGrade.scores[index].n2 = n2;
      existingGrade.scores[index].n3 = n3;
      existingGrade.scores[index].checked = true
    } else {
      return res.status(404).json({ error: 'cp not found in the scores array' });
    }

    // Save the updated grade
    const updatedGrade = await existingGrade.save();

    // Respond with the updated grade
    res.json(updatedGrade);
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({ errors: validationErrors });
    }

    // Handle other errors
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// @desc Get grades for a given id activity
// @route GET/grades
// @access Private
const getActivityGradesN = asyncHandler(async (req, res) => {
  try {
      // Validate the incoming parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }

      const { activityId } = req.params;

      // Fetch the current date
      const currentDate = new Date();

      // Fetch date information to determine the term
      const dateInfo = await DateInfo.findOne();

      // Determine the term based on the current date
      let term = '';
      if (
          currentDate >= dateInfo.initDateT1 &&
          currentDate <= dateInfo.endDateT1
      ) {
          term = '1';
      } else if (
          currentDate >= dateInfo.initDateT2 &&
          currentDate <= dateInfo.endDateT2
      ) {
          term = '2';
      } else if (
          currentDate >= dateInfo.initDateT3 &&
          currentDate <= dateInfo.endDateT3
      ) {
          term = '3';
      }

      // Perform aggregation to get the desired output
      const result = await Grade.aggregate([
          {
              $match: {
                  activityId: mongoose.Types.ObjectId(activityId),
                  "isValidGrade":true
              }
          },
          {
              $lookup: {
                  from: 'users',
                  localField: 'studentId',
                  foreignField: '_id',
                  as: 'user'
              }
          },
          {
              $unwind: '$user'
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
              $match: {
                  'activity.term': term
              }
          },
          {
              $project: {
                  _id: 0, // Exclude the _id field
                  id: '$user._id',
                  name: '$user.name',
                  scores: {
                      $map: {
                          input: '$scores',
                          as: 'score',
                          in: {
                              n1: '$$score.n1',
                              n2: '$$score.n2',
                              n3: '$$score.n3',
                              cp: '$$score.cp',
                              checked: '$$score.checked'
                          }
                      }
                  }
              }
          }
      ]);

      res.json(result);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});


const updateStudentGradesN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, activityId } = req.params;
    const { scores } = req.body;

    const updatedGrade = await Grade.findOneAndUpdate(
      { studentId, activityId },
      { $set: { scores } },
      { new: true }
    );

    if (!updatedGrade) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.json(updatedGrade);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
}
);


// @desc Get percentiles of grades for all courses and groups where a student is registered
// @route GET/percentile
// @access Private

// Function to calculate percentiles
// Calculate percentile function
const calculatePercentile = (array, percentile) => {
  array.sort((a, b) => a - b);
  const index = (percentile / 100) * (array.length - 1);
  const lower = Math.floor(index);
  const fraction = index - lower;
  if (lower === array.length - 1) {
    return array[lower];
  }
  return array[lower] + fraction * (array[lower + 1] - array[lower]);
};


const getPercentilesByCourseGroupStudentN= asyncHandler(async (req, res) => {

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const studentId = req.user.id; // Assuming the user object is available in the request

    try {
      const { studentId } = req.params;

      const percentiles = await Grade.aggregate([
        // Match grades for the given student
        { $match: { studentId: mongoose.Types.ObjectId(studentId), "isValidGrade":true} },

        // Lookup activity details
        {
          $lookup: {
            from: 'activities',
            localField: 'activityId',
            foreignField: '_id',
            as: 'activity',
          },
        },

        // Unwind the activity array
        { $unwind: '$activity' },

        // Lookup course details
        {
          $lookup: {
            from: 'courses',
            localField: 'activity.courseId',
            foreignField: '_id',
            as: 'course',
          },
        },

        // Unwind the course array
        { $unwind: '$course' },

        // Lookup group details
        {
          $lookup: {
            from: 'groups',
            localField: 'activity.groupId',
            foreignField: '_id',
            as: 'group',
          },
        },

        // Unwind the group array
        { $unwind: '$group' },

        // Project only necessary fields
        {
          $project: {
            'scores.cp': 1,
            'scores.n1': 1,
            'scores.n2': 1,
            'scores.n3': 1,
            'activity.courseId': 1,
            'activity.groupId': 1,
          },
        },
        {
          $unwind:"$scores"
        },
        {
          $match: { "scores.n1": { $ne: "" }, "scores.n2": { $ne: "" }, "scores.n3": { $ne: "" } }
        },

        {
          "$group": {
            "_id": {
              "cp": "$scores.cp",
              "courseId": "$activity.courseId",
              "groupId": "$activity.groupId",

            },
            "avg_n1": { "$avg": { "$toDouble": "$scores.n1" } },
            "avg_n2": { "$avg": { "$toDouble": "$scores.n2" } },
            "avg_n3": { "$avg": { "$toDouble": "$scores.n3" } },

          }
        }


      ]);

      res.json({ percentiles });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @desc
// @route GET/grades
// @access Private

const getTopStudentGradesByCourseGroupsAllTermsN = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { courseId, threshold} = req.params;




    const topFactor=parseFloat(threshold)

    const activeParticipants = await Group.aggregate([
      {
        $match: {
          "courseId": mongoose.Types.ObjectId(courseId)
        }
      },
      {
        $project: {
          numStudentsByGroup: { $size: "$students" } // Count students in each group
        }
      },
      {
        $group: {
          _id: null, // Set _id to null as we're not grouping by any field
          totalStudentsByCourse: { $sum: "$numStudentsByGroup" } // Sum the number of students across all groups
        }
      },
      {
        $project: {
          _id: 0, // Remove the unnecessary _id field
          totalStudentsByCourse: 1 // Only project the totalStudentsByCourse field
        }
      }
    ]);
    const totalActiveParticipantsByCourse=activeParticipants[0].totalStudentsByCourse



    const activityIds = await Grade.aggregate(
      [
      {
        $match: {

          "isValidGrade":true
        }
      },
      {
        $lookup: {
          from: 'activities',
          localField: 'activityId',
          foreignField: '_id',
          as: 'activity',
        },
      },

      {
        $unwind: '$activity'
      },
      {
        $match: { 'activity.courseId':{$eq:mongoose.Types.ObjectId(courseId)} }
      },

      {
        $lookup: {
          from: 'courses',
          let: { courseId: '$activity.courseId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$courseId'] }
              }
            },
            {
              $project: {
                name: 1,
                _id:0,
                //description: 1,
                c_Id: 1,
                //groups: 1
              }
            },
            {
              $unset: ['coordinator'], // Exclude the coordinator field
              //$unset: ['name']
            }
          ],
          as: 'course',
        },
      },
      {
        $unwind: '$course'
      },
      {
        $lookup: {
          from: 'groups',
          let: { groupId: '$activity.groupId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$groupId'] }
              }
            },
            {
              $project: {
                //courseId: 1,
                //teacherId: 1,
                _id:0,
                g_Id: 1,
                students:1,
                //activityCounterT1: 1,
                //activityCounterT2: 1,
                //activityCounterT3: 1,
                //classSize: 1,
                activities: 1,
              }
            },
            // {
            //   $unset: ['activities']
            // }
          ],
          as: 'group',
        },
      },
      {
        $unwind: '$group'
      },

      {
        $unwind:'$scores'
      },

      {
        $lookup:{
          from:"users",
          localField:"studentId",
          foreignField:"_id",
          as:"users"
        }

      },
      {
        $unwind:'$users'
      },

      {
        $group: {
        _id: {
          competency:'$scores.cp',
          // curso:'$course',
          grupo: '$group',
          studentId:'$studentId'
        },


        avgN1: { $avg: { $cond: [{ $eq: ['$scores.n1', ''] }, null, { $convert: {input: '$scores.n1', to: "double" } }]}},
        countAvgN1:{$sum:{$cond:[{$ne:["$scores.n1",'']},1,0]}},
        countN1V:{$push:{$cond: [
          { $ne: ['$scores.n1', ''] }, // Check if score is not null
          '$scores.n1', // If not null, push the score
          null, // If null, push nothing
        ]}},
        avgN2: { $avg: { $cond: [{ $eq: ['$scores.n2', ''] }, null, { $convert: {input: '$scores.n2', to: "double" } }]}},
        countAvgN2:{$sum:{$cond:[{$ne:["$scores.n2",'']},1,0]}},
        countN2V:{$push:{$cond: [
          { $ne: ['$scores.n2', ''] }, // Check if score is not null
          '$scores.n2', // If not null, push the score
          null, // If null, push nothing
        ]}},

        avgN3: { $avg: { $cond: [{ $eq: ['$scores.n3', ''] }, null, { $convert: {input: '$scores.n3', to: "double" } }]}},
        countAvgN3:{$sum:{$cond:[{$ne:["$scores.n3",'']},1,0]}},
        countN3V:{$push:{$cond: [
          { $ne: ['$scores.n3', ''] }, // Check if score is not null
          '$scores.n3', // If not null, push the score
          null, // If null, push nothing
        ]}},
        activitiesId:{$push:"$activityId"},
        activityCount: { $addToSet: '$activityId' },

       studentName: { $first: '$users' }, // Include the student name field in the group


        grades: {
          $push: {

            n1: {  $cond: [{ $eq: ['$scores.n1', ''] }, null, { $convert: {input: '$scores.n1', to: "double" } }] },
            n2: {  $cond: [{ $eq: ['$scores.n2', ''] }, null, { $convert: {input: '$scores.n2', to: "double" } }] },
            n3: {  $cond: [{ $eq: ['$scores.n3', ''] }, null, { $convert: {input: '$scores.n3', to: "double" } }] },

          }
        },

      }
    },

    {
      $match: {
        $and: [
          { avgN1: { $gt: topFactor } },  // Filter based on all three averages
          { avgN2: { $gt: topFactor } },
          { avgN3: { $gt: topFactor } }
        ]
      }
    },

    // {
    //   $match: {
    //     $or: [
    //       { [selectedField]: { $gt: topFactor } },  // Match documents where selectedField is greater than topFactor (it is defined at the begining)
    //     ]
    //   }
    // },

    {$lookup:{
      from:"activities",
      localField:"activitiesId",
      foreignField:"_id",
      as:"student_activities"
    }},


    {
      $project:{
        _id:0,

        competency: '$_id.competency',
        //grades:'$grades',
        // curso: '$_id.curso',
        //c_Id: '$_id.curso.c_Id',
        g_Id: '$_id.grupo.g_Id',
        numStudentsInGroup:{$size: '$_id.grupo.students'},
        //activitiesId: '$activitiesId',
        numActivities:{$size:'$activityCount'},
        studentName:'$studentName.name',
        //grades:1,
        avgN1:1,
        avgN2:  1,
        avgN3:1,


      }
    },
//  Now the info is consolidated and displayed by course. (You can visualized the info using: https://jsoneditoronline.org/#left=local.gifocu)
{
  $group: {
    // _id: { studentName: '$studentName', grupo: '$g_Id', competency: '$competency' },
    _id: { studentName: '$studentName', grupo: '$g_Id' },

    data: { $push: '$$ROOT' }
  }
},
{
  $project: {
    _id: 0,
    studentName: '$_id.studentName',
    grupo: '$_id.grupo',
    // competency: '$_id.competency',
    data: 1
  }
},
{
  $group: {
    _id: { grupo: '$grupo' },
    // students: { $push: { studentName: '$studentName', competency: '$competency', data: '$data' } }
    students: { $push: { studentName: '$studentName', data: '$data', numOfAchivedCompetencies:{$size:"$data"}, achivedCompetencies:"$data.competency" } }

  }
},
{
  $project: {
    _id: 0,
    grupo: '$_id.grupo',
    totalAchieversByGroup:{$size:"$students"},

    totalActiveParticipantsByCourse:{$literal:totalActiveParticipantsByCourse},

    numStudentsInGroup:{$arrayElemAt:[{$first:"$students.data.numStudentsInGroup"},0]},

    percentageAchieversRelativeToGroup:{$multiply:[{$divide:[{$size:"$students"},{$arrayElemAt:[{$first:"$students.data.numStudentsInGroup"},0]}]},100]},

    percentageAchieversRelativeToCourse:{$multiply:[{$divide:[{$size:"$students"},totalActiveParticipantsByCourse]},100]},

    students: 1
  }
},
{
  $project:{
    _id:0,
    total:"$$ROOT"

  }
},
{
  $group:{
    _id:null,
    totalAchieversAllGroups:{$sum:"$total.totalAchieversByGroup"},
    total:{$push:"$total"},
  }
},
{
  $project:{
    _id:0,
    threshhold:{$literal:topFactor},
    totalAchieversAllGroups:1,
    totalActiveParticipantsByCourse:{$literal:totalActiveParticipantsByCourse},
    percentageAchieversAllGroupsRelativeToCourse:{$multiply:[{$divide:["$totalAchieversAllGroups",totalActiveParticipantsByCourse]},100]},
    total:1
  }
},
{$sort:
  {"total.grupo":1}
}


]);

if (!activityIds || activityIds.length === 0) {
  return res.status(404).json({ error: 'No activity found that match the criteria' });
}
 //Modify the result to exclude g_Id and studentName and numStudentsInGroup from the data field
 activityIds.forEach(doc => {
  doc.total.forEach(group => {
         group.students.forEach(student => {
          student.data.forEach(data => {
              delete data.g_Id;
              delete data.studentName;
              delete data.numStudentsInGroup;
          });
      });
  });
});
// Sort the array alphabetically by course, i.e., FIEM01, FIEM02, FIEM03, etc
activityIds.forEach((activity) => {
  activity.total.sort((a, b) => {
    const grupoA = a.grupo.toLowerCase(); // Ensure case-insensitive sorting
    const grupoB = b.grupo.toLowerCase();
    return grupoA.localeCompare(grupoB);
  });
});


res.status(200).json({ activityIds });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
});










// @desc Set status of students's grades for a specific group ( set isValidGrade to true or false in all grades),
// also in the user field registeredInGroups set isActive variable to true or false for the corresponing group.
// @route POST /grades
// @access Private
const deactivateStudentsGradesInAGroup = asyncHandler(async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { groupId } = req.params; // Get group ID from request params
    const { students } = req.body; // Get selected students from request body

    // Update grades for the students for the given group
    await Grade.updateMany(
        { studentId: { $in: students }, activityId: { $in: (await Group.findById(groupId)).activities } },
        { isValidGrade: false }
    );

    // // Update group status
    // await User.updateOne(
    //     { 'registeredInGroups.groupId': groupId },
    //     { $set: { 'registeredInGroups.$.isActive': false } }
    // );

   // Update group status for the provided students in the group
   await User.updateMany(
    { _id: { $in: students }, 'registeredInGroups.groupId': groupId },
    { $set: { 'registeredInGroups.$.isActive': false } }
    );

    // Respond with success message
    res.status(200).json({ message: 'Student grades and group status updated successfully' });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
}
});


const getStudentGradesAllTermsFullAnalisysN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array());
    }

    // const { courseId, studentId, threshold } = req.params;
    const { studentId} = req.params;

    //const course = await Course.findById(courseId);
    const student = await User.findById(studentId);

    // if (!course) {
    //   return res.status(404).json({ message: 'Course not found' });
    // }
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    //-------------------------------------------------------------------------
      // Extract group IDs associated with the course
      // const courseGroupIds = course.groups.map(groupId => mongoose.Types.ObjectId(groupId));

      // Aggregate to count active students
      const totalActiveStudents = await User.aggregate([
        {
          $match: {
            // 'registeredInGroups.groupId': { $in: courseGroupIds },
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


    // const activityIdsAggregate = await Activity.aggregate([
    // //   {
    //     $match: {
    //      courseId: mongoose.Types.ObjectId(courseId)
    //     }
    //   }
    // ]);
    // let factor = parseFloat(threshold); // Set the desired threshold value here

    // if (activityIdsAggregate.length === 0) {
    //   return res.status(404).json({ message: 'No activities found for the specified criteria' });
    // }

    // const activityIds = activityIdsAggregate.map(activity => activity._id);

                //| *****************Start of part 1*******************|

    //   |This part of the code does stats for the diferent groups of a course: averages each competency for each level,|
    //   |finds the percentage of students that developed each competency level above sertain level|


    const activitiesOfStudents = await Grade.aggregate([
      {
        // Stage 1: Match grades for a specific student
        $match: {
          studentId: mongoose.Types.ObjectId(studentId) // missing isValidGrade Please conidere this! No its done below
        }
      },
      {
        // Stage 2: Lookup activities related to the matched grades
        $lookup: {
          from: "activities", // The collection to perform the lookup on
          localField: "activityId", // The field from the current collection (Grade) to match with
          foreignField: "_id", // The field from the target collection (activities) to match with
          as: "activity" // The name of the array field in which to store the matching documents
        }
      },
      {
        // Stage 3: Unwind the activity array created from the lookup
        $unwind: "$activity"
      },
      {
        // Stage 4: Match activities with completed: true
        $match: {
          "activity.completed": true
        }
      },
      {
        // Stage 5: Lookup the group information for each activity
        $lookup: {
          from: "groups",
          localField: "activity.groupId",
          foreignField: "_id",
          as: "group"
        }
      },
      {
        // Stage 6: Unwind the group array created from the lookup
        $unwind: "$group"
      },
      {
        // Stage 7: Lookup the students in the group
        $lookup: {
          from: "users",
          localField: "group.students",
          foreignField: "_id",
          as: "students"
        }
      },
      {
        // Stage 8: Unwind the students array created from the lookup
        $unwind: "$students"
      },
      {
        // Stage 9: Group all activities together and collect unique activity IDs
        $group: {
          _id: null, // Grouping all documents into a single group
          activities: { $addToSet: "$activity._id" } // Collecting unique activity IDs into an array
        }
      },
      {
        // Stage 10: Projecting the result to remove the _id field and keep only the activities array
        $project: {
          _id: 0, // Excluding the _id field from the output
          activities: 1 // Including the activities field in the output
        }
      }
    ]);

    if ( activitiesOfStudents.length ==0 )  {
      return res.status(404).json({ message: 'No activities found for this student' });
    }
    // Storing the list of activity IDs into a separate array
    const activitiesIds = [...activitiesOfStudents[0].activities];

    //console.log("Acitivity Ids-------------------:::::::::::::::::::----------",activitiesIds)

//-----------------------------------------------------------------------------------------

    const statsByGroups= await Grade.aggregate([
      {
        $match: {
          activityId: { $in: activitiesIds },
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
            group: "$group.g_Id",
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
          activityDoc: {$push: {term:"$activity.term",description:"$activity.description",rubrica:{$arrayElemAt:["$activity.rubric",0]},tipo:{$arrayElemAt:["$activity.type",0]}}},
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
        avgN1:{$avg:"$avgN1"},      //Promedio de los promedios de las notas de los estudiantes pra N1
        avgN2:{$avg:"$avgN2"},      //Promedio de los promedios de las notas de los estudiantes pra N2
        avgN3:{$avg:"$avgN3"},      //Promedio de los promedios de las notas de los estudiantes pra N3
        numTakersN1:{$sum:"$numScoresN1"},
        numTakersN2:{$sum:"$numScoresN2"},
        numTakersN3:{$sum:"$numScoresN3"},
        activityDoc: { $first: "$activityDoc" },
        teacherName:{$first:"$teacherName"}

      }
    },
    {
      $sort:{"_id.competency":1}
    }

    ]);

    console.log("stats by Group-------------------:::::::::::::::::::----------",statsByGroups)


    //   | ******************End of part 1*******************|

    //https://chat.openai.com/c/a74b1d78-44bb-44b3-a80d-4e1eb65a1b51
    //---------------------------------------------------------------------------------------------------------------------------------------

    //   | *****************Start of part 2*******************|
    //   |This part of the code performs the statistics by course including students of all groups: it averages each competency for each level,
    //   |finds the number of participants per competency. Warning: The average grade of each level in each competency is calculated for each student,
    //   |then the average of these grades is taken without taking into account the group to which the student belongs. In other words,
    //   |we are not taking the average of the grade associated with each group since all students are ultimately taking the same subject.


// Step 1: Find the group(s) in which the specified student is registered
const groupsWithStudent = await Group.aggregate([
  {
    $match: {
      students: mongoose.Types.ObjectId(studentId)
    }
  }
]);


// Step 2: Extract the course IDs from those groups
const courseIds = groupsWithStudent.map(group => group.courseId);

// Step 3: Find all activities associated with those course IDs
const activitiesOfCourses = await Activity.aggregate([
  {
    $match: {
      courseId: { $in: courseIds }
    }
  },
  {
    $group: {
      _id: null,
      activities: { $addToSet: "$_id" } // Collect all unique activity IDs
    }
  }
]);

const activityIdsOfCourses = activitiesOfCourses.length > 0 ? activitiesOfCourses[0].activities : [];

    const statsByCourse= await Grade.aggregate([
      {
        $match: {
          activityId: { $in: activityIdsOfCourses},
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
      {$match:
      {
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
          //activityDoc: {$push: {term:"$activity.term",description:"$activity.description",rubrica:{$arrayElemAt:["$activity.rubric",0]},tipo:{$arrayElemAt:["$activity.type",0]}}},
          //teacherName:{$first:"$teacher.name"}
        }
      },
      {
      $group:{
        _id: {
          course: "$_id.course",
          competency: "$_id.competency",
        },
        avgN1:{$avg:"$avgN1"},
        avgN2:{$avg:"$avgN2"},
        avgN3:{$avg:"$avgN3"},
        numTakersN1:{$sum:"$numScoresN1"},
        numTakersN2:{$sum:"$numScoresN2"},
        numTakersN3:{$sum:"$numScoresN3"},
        //activityDoc: { $first: "$activityDoc" },
        //teacherName:{$first:"$teacherName"}

      }
    },
    {$sort:{"_id.competency":1}}


    ]);


                 //| *****************Start of part 3*******************|

    //   |This part of the code does stats for the student grades: averages each competency for each level,|

    const statsByStudent = await Grade.aggregate([
      {
        $match: {
          "isValidGrade":true,
          studentId: mongoose.Types.ObjectId(studentId) // Filter by studentId

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

      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
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
          scoresN1: {
            $push: {$cond: [{ $eq: ['$scores.n1', ''] }, null, { $convert: { input: '$scores.n1', to: "double" } } ]},
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
          scoresN2: {
            $push: {$cond: [{ $eq: ['$scores.n2', ''] }, null, { $convert: { input: '$scores.n2', to: "double" } }]},
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
          scoresN3: {
            $push: {$cond: [{ $eq: ['$scores.n3', ''] }, null, { $convert: { input: '$scores.n3', to: "double" } }]},
            },
          numScoresN3: {
            $sum: { $cond: [{ $ne: ["$scores.n3", ''] }, 1, 0] }
          },

          activityDoc: {$push: {term:"$activity.term",description:"$activity.description",rubrica:{$arrayElemAt:["$activity.rubric",0]},tipo:{$arrayElemAt:["$activity.type",0]}}},
          teacherName:{$first:"$teacher.name"},
          studentName:{$first:"$student.name"}
        }
      },
      {
      $project:{
        "_id.course":1,
        "g_Id":"$_id.group.g_Id",
        "_id.competency":1,
        "_id.estudiante":1,
        avgN1:1,
        avgN2:1,
        avgN3:1,
        scoresN1:1,
        scoresN2:1,
        scoresN3:1,

        numScoresN1:1,
        numScoresN2:1,
        numScoresN3:1,
        activityDoc: 1,
        teacherName:1,
        studentName:1

      }
    },
    {
      $sort:{
        "_id.competency":1
      }
    }

    ]);

    //console.log("::::::::::::::::::XXXXXXXXXX  Stats By Student:", statsByStudent)

//-------------------------------------------------------------------------------------------------------
    const courseStats = {};

    // Loop through statsByGroups to populate course info and group stats
    for (const groupStat of statsByGroups) {
        const courseName = groupStat._id.course;
        const competency = groupStat._id.competency;

        // Check if course and competency exist, create if not
        if (!courseStats[courseName] || !courseStats[courseName][competency]) {
            courseStats[courseName] = courseStats[courseName] || {};
            courseStats[courseName][competency] = {
                ...groupStat._id, // Include course name, teacherName from groupStat._id
                statsByGroup: [],
                statsByStudent: [], // Separate array for student stats
            };
        }
        courseStats[courseName][competency].statsByGroup.push(groupStat);
    }

    // Separate loop for statsByCourse to populate course averages (per competency)
    for (const courseStat of statsByCourse) {
        const courseName = courseStat._id.course;
        const competency = courseStat._id.competency;

        // Ensure course and competency exist before merging
        if (courseStats[courseName] && courseStats[courseName][competency]) {
            courseStats[courseName][competency] = {
                ...courseStats[courseName][competency], // Merge existing course info
                ...courseStat, // Add course averages from statsByCourse (for this competency)
            };
        }
    }

    // Separate loop for statsByStudent to populate student stats (per competency)
    for (const studentStat of statsByStudent) {
        const courseName = studentStat._id.course;
        const competency = studentStat._id.competency;

        // Ensure course and competency exist before adding student data
        if (courseStats[courseName] && courseStats[courseName][competency]) {
            courseStats[courseName][competency].statsByStudent.push(studentStat);
        }
    }

    // console.log("Partition:", courseStats);
    // console.log("Converted into an array", Object.values(courseStats))

    const transformedData = Object.values(courseStats)
    const InfoBarChart = {}

    transformedData.forEach(course => {
        const item = Object.values(course)

        const statsByGroup = []
        const statsByStudent = []
        const statsByCourse=[]

        const extraInfoByStudent = []
        const extraInfoByGroup = []
        const extraInfoByCourse = []


        console.log("item:::::::::::",item)
       
        const avgProperties = ["avgN1", "avgN2", "avgN3"];
        const numTakersPropertiessByCourse = ["numTakersN1", "numTakersN2", "numTakersN3"];

      for (let i = 0; i < item.length; i++) {
        avgProperties.forEach(prop => {
          statsByCourse.push(item[i][prop] || null);
        });
      }

      for (let i = 0; i < item.length; i++) {
        numTakersPropertiessByCourse.forEach(prop => {
          extraInfoByCourse.push(item[i][prop] || null);
        });
      }



      item.forEach(i => {
        //console.log("-------------->>>>>>>>i:",i)
        //I did the presentation to Jaime, Jorge and Efren (June 4 2024). An error in this part of the code emerged. After reviewing, it works


        if (i && i.statsByStudent && i.statsByStudent.length > 0) {
          if (i.statsByGroup[0].avgN1 !== null) { statsByGroup.push(i.statsByGroup[0].avgN1) } else { statsByGroup.push(null) }
          if (i.statsByGroup[0].avgN2 !== null) { statsByGroup.push(i.statsByGroup[0].avgN2) } else { statsByGroup.push(null) }
          if (i.statsByGroup[0].avgN3 !== null) { statsByGroup.push(i.statsByGroup[0].avgN3) } else { statsByGroup.push(null) }
        } else {
          statsByGroup.push(null,null,null);

        }
        
         
        if (i && i.statsByStudent && i.statsByStudent.length > 0) {
            if ( i.statsByStudent[0].avgN1 !== null) {statsByStudent.push(i.statsByStudent[0].avgN1);} else {statsByStudent.push(null);}
            if ( i.statsByStudent[0].avgN2 !== null ) {statsByStudent.push(i.statsByStudent[0].avgN2);} else {statsByStudent.push(null);}
            if (i.statsByStudent[0].avgN3 !== null ) {statsByStudent.push(i.statsByStudent[0].avgN3);} else {statsByStudent.push(null);}
        } else {
            statsByStudent.push(null,null,null);
        }


      if (i && i.statsByStudent && i.statsByStudent.length > 0) {
          if ( i.statsByStudent[0].numScoresN1 !== null) {extraInfoByStudent.push(i.statsByStudent[0].numScoresN1)} else {extraInfoByStudent.push(null)}
          if ( i.statsByStudent[0].numScoresN2 !== null) {extraInfoByStudent.push(i.statsByStudent[0].numScoresN2)} else {extraInfoByStudent.push(null)}
          if ( i.statsByStudent[0].numScoresN3 !== null) {extraInfoByStudent.push(i.statsByStudent[0].numScoresN3)} else {extraInfoByStudent.push(null)}
      } else {
        extraInfoByStudent.push(null,null,null)
      }

      if (i && i.statsByStudent && i.statsByStudent.length > 0) {
          if (i.statsByGroup[0].numTakersN1 !== null) { extraInfoByGroup.push(i.statsByGroup[0].numTakersN1) } else { extraInfoByGroup.push(null) }
          if (i.statsByGroup[0].numTakersN2 !== null) { extraInfoByGroup.push(i.statsByGroup[0].numTakersN2) } else { extraInfoByGroup.push(null) }
          if (i.statsByGroup[0].numTakersN3 !== null) { extraInfoByGroup.push(i.statsByGroup[0].numTakersN3) } else { extraInfoByGroup.push(null) }
      } else {
          extraInfoByGroup.push(null,null,null)
        }
      })

        InfoBarChart[item[0].course] = { statsByStudent: statsByStudent, statsByGroup: statsByGroup, courseName: item[0].course, group:item[0].group, statsByCourse: statsByCourse,  extraInfoByStudent, extraInfoByGroup, extraInfoByCourse }

    })


    // Sort the array alphabetically by course name
    const InfoBarChartSorted= Object.values(InfoBarChart).sort((a, b) => {
      // Compare course names (case-insensitive)
      const nameA = a.courseName.toLowerCase();
      const nameB = b.courseName.toLowerCase();
      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    });

    //console.log("InfoToChart:::::::::::::::::", Object.values(InfoBarChartSorted))   ///AAAAAAA

    //https://chat.openai.com/c/a74b1d78-44bb-44b3-a80d-4e1eb65a1b51

    //   | ******************End of part 3******************|

   if (Object.values(InfoBarChartSorted).length>0 )  {
      res.json({ InfoBarChart:Object.values(InfoBarChartSorted)});
    } else {
      res.status(404).json({ message: 'No grades found for the specified criteria' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//-----------------------------------------------------------------------------------------------------------------


const getStatsTeacherForDirectorN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array());
    }

    // const { courseId, studentId, threshold } = req.params;
    const { teacherId} = req.params;


    //const course = await Course.findById(courseId);
    const teacher = await User.findById(teacherId);


    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    //-------------------------------------------------------------------------
      // Extract group IDs associated with the course
      // const courseGroupIds = course.groups.map(groupId => mongoose.Types.ObjectId(groupId));

      // Aggregate to count active students
      const totalActiveStudents = await User.aggregate([
        {
          $match: {
            // 'registeredInGroups.groupId': { $in: courseGroupIds },
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
         teacherId: mongoose.Types.ObjectId(teacherId)
        }
      }
    ]);

    if (activityIdsAggregate.length === 0) {
      return res.status(404).json({ message: 'No activities found for this teacher Id' });
    }

    const activityIds = activityIdsAggregate.map(activity => activity._id);
    console.log("---------Teacher activities including all courses and groups",activityIds)

                //| *****************Start of part 1*******************|



    const activitiesOfStudents = await Grade.aggregate([
      {
        // Stage 1: Match grades for a specific student
        $match: {
          activityId: { $in: activityIds },
          "isValidGrade":true

        }
      },
      {
        // Stage 2: Lookup activities related to the matched grades
        $lookup: {
          from: "activities", // The collection to perform the lookup on
          localField: "activityId", // The field from the current collection (Grade) to match with
          foreignField: "_id", // The field from the target collection (activities) to match with
          as: "activity" // The name of the array field in which to store the matching documents
        }
      },
      {
        // Stage 3: Unwind the activity array created from the lookup
        $unwind: "$activity"
      },
      {
        // Stage 4: Match activities with completed: true
        $match: {
          "activity.completed": true
        }
      },
      {
        // Stage 5: Lookup the group information for each activity
        $lookup: {
          from: "groups",
          localField: "activity.groupId",
          foreignField: "_id",
          as: "group"
        }
      },
      {
        // Stage 6: Unwind the group array created from the lookup
        $unwind: "$group"
      },
      {
        // Stage 7: Lookup the students in the group
        $lookup: {
          from: "users",
          localField: "group.students",
          foreignField: "_id",
          as: "students"
        }
      },
      {
        // Stage 8: Unwind the students array created from the lookup
        $unwind: "$students"
      },
      {
        // Stage 9: Group all activities together and collect unique activity IDs
        $group: {
          _id: null, // Grouping all documents into a single group
          activities: { $addToSet: "$activity._id" } // Collecting unique activity IDs into an array
        }
      },
      {
        // Stage 10: Projecting the result to remove the _id field and keep only the activities array
        $project: {
          _id: 0, // Excluding the _id field from the output
          activities: 1 // Including the activities field in the output
        }
      }
    ]);

    if ( activitiesOfStudents.length ==0 )  {
      return res.status(404).json({ message: 'No activities found for this teacher' });
    }
    // Storing the list of activity IDs into a separate array
    const activitiesIds = [...activitiesOfStudents[0].activities];

    console.log("Acitivity Ids-------------------:::::::::::::::::::----------",activitiesIds)

//-----------------------------------------------------------------------------------------

    const statsByGroups= await Grade.aggregate([
      {
        $match: {
          activityId: { $in: activitiesIds },
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
            group: "$group.g_Id",
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
          activityDoc: {$push: {term:"$activity.term",description:"$activity.description",rubrica:{$arrayElemAt:["$activity.rubric",0]},tipo:{$arrayElemAt:["$activity.type",0]}}},
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
        avgN1:{$avg:"$avgN1"},      //Promedio de los promedios de las notas de los estudiantes para N1
        avgN2:{$avg:"$avgN2"},      //Promedio de los promedios de las notas de los estudiantes para N2
        avgN3:{$avg:"$avgN3"},      //Promedio de los promedios de las notas de los estudiantes para N3
        numTakersN1:{$sum:"$numScoresN1"},
        numTakersN2:{$sum:"$numScoresN2"},
        numTakersN3:{$sum:"$numScoresN3"},
        //activityDoc: { $first: "$activityDoc" },
        teacherName:{$first:"$teacherName"}

      }
    },
    {
      $sort:{"_id.competency":1}
    }

    ]);

    console.log("stats by Group-------------------:::::::::::::::::::----------",statsByGroups)


    //   | ******************End of part 1*******************|

    //https://chat.openai.com/c/a74b1d78-44bb-44b3-a80d-4e1eb65a1b51
    //---------------------------------------------------------------------------------------------------------------------------------------

    //   | *****************Start of part 2*******************|
    //   |This part of the code performs the statistics by course including students of all groups: it averages each competency for each level,
    //   |finds the number of participants per competency. Warning: The average grade of each level in each competency is calculated for each student,
    //   |then the average of these grades is taken without taking into account the group to which the student belongs. In other words,
    //   |we are not taking the average of the grade associated with each group since all students are ultimately taking the same subject.

// The idea in this part is to do stats for each course a teacher is registered in order to compare these results with the results of their groups in the respective course
//Thus for example, let us suppose a teacher has the group 05 of the Mechanics course then this parts do stats for ALL groups of Mechanics and in this way
//we present graphically the stats for group 05 and the stats for the Mechanics course which include all groups associated to this course.

// Step 1: Find the group(s) in which the specified teacher is in charge
const groupsWithTeacher = await Group.aggregate([
  {
    $match: {
      teacherId: mongoose.Types.ObjectId(teacherId)
    }
  }
]);


// Step 2: Extract the course IDs from those groups
const courseIds = groupsWithTeacher.map(group => group.courseId);

// Step 3: Find all activities associated with those course IDs
const activitiesOfCourses = await Activity.aggregate([
  {
    $match: {
      courseId: { $in: courseIds }
    }
  },
  {
    $group: {
      _id: null,
      activities: { $addToSet: "$_id" } // Collect all unique activity IDs
    }
  }
]);

const activityIdsOfCourses = activitiesOfCourses.length > 0 ? activitiesOfCourses[0].activities : [];

console.log("|||||||||||||||||| activitiesOfCourses |||||||||||||||||", activityIdsOfCourses)


    const statsByCourse= await Grade.aggregate([
      {
        $match: {
          // activityId: { $in: activitiesIds },
          activityId: { $in: activityIdsOfCourses},
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
      {$match:
      {
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
          //activityDoc: {$push: {term:"$activity.term",description:"$activity.description",rubrica:{$arrayElemAt:["$activity.rubric",0]},tipo:{$arrayElemAt:["$activity.type",0]}}},
          //teacherName:{$first:"$teacher.name"}
        }
      },
      {
      $group:{
        _id: {
          course: "$_id.course",
          competency: "$_id.competency",
        },
        avgN1:{$avg:"$avgN1"},
        avgN2:{$avg:"$avgN2"},
        avgN3:{$avg:"$avgN3"},
        numTakersN1:{$sum:"$numScoresN1"},
        numTakersN2:{$sum:"$numScoresN2"},
        numTakersN3:{$sum:"$numScoresN3"},
        //activityDoc: { $first: "$activityDoc" },
        //teacherName:{$first:"$teacherName"}

      }
    },
    {$sort:{"_id.competency":1}}


    ]);

    console.log("stats by Course-------------------:::::::::::::::::::----------",statsByCourse)




  
  // Function to filter stats by group and competency
function filterStatsByGroupAndCompetency(course, group, competency) {
    return statsByGroups.filter(stats => stats._id.course === course && stats._id.group === group && stats._id.competency === competency);
}

// Function to create an object containing info for all competencies of a course within a group
function createGroupObject(course, group) {
    const groupObject = {
        group: group,
        competencies: {}
    };

    const competencies = ['CLF', 'PRC', 'UCM', 'ULC', 'UTF'];

    competencies.forEach(competency => {
        groupObject.competencies[competency] = filterStatsByGroupAndCompetency(course, group, competency);
    });

    return groupObject;
}

// Function to create array of objects with info for all courses separated by groups
function createArrayOfCourseObjectsSeparatedByGroups() {
    const courses = Array.from(new Set(statsByGroups.map(stats => stats._id.course))); // Get unique course names

    const arrayOfCourseObjects = courses.map(course => {
        const groups = Array.from(new Set(statsByGroups.filter(stats => stats._id.course === course).map(stats => stats._id.group))); // Get unique group names for each course

        const courseObject = {
            course: course,
            groups: groups.map(group => createGroupObject(course, group))
        };

        return courseObject;
    });

    return arrayOfCourseObjects;
}

// Call the function to get the array of objects with info for all courses separated by groups
const arrayOfCourseObjectsSeparatedByGroups = createArrayOfCourseObjectsSeparatedByGroups();

console.log("arrayOfCourseObjectsSeparatedByGroups::",arrayOfCourseObjectsSeparatedByGroups);

//---------------------------------Further tranformation of arrayOfCourseObjectsSeparatedByGroups

// Function to reduce the array to contain statsByGroup and extraInfoByGroup
function reduceArray(array) {
  return array.map(courseObj => ({
      course: courseObj.course,
      groups: courseObj.groups.map(groupObj => ({
          group: groupObj.group,
          statsByGroup: createStatsByGroup(groupObj.competencies),
          extraInfoByGroup: createExtraInfoByGroup(groupObj.competencies)
      }))
  }));
}

// Function to create statsByGroup
function createStatsByGroup(competencies) {
  const statsByGroup = [];
  const competenciesArr = ['CLF', 'PRC', 'UCM', 'ULC', 'UTF'];

  competenciesArr.forEach(competency => {
    if (competencies[competency]) {
      // Ensure there is at least one entry for each competency
      const competencyStats = competencies[competency].length > 0 ? competencies[competency] : [{}];
      competencyStats.forEach(stat => {
        statsByGroup.push(stat.avgN1 !== undefined ? stat.avgN1 : null);
        statsByGroup.push(stat.avgN2 !== undefined ? stat.avgN2 : null);
        statsByGroup.push(stat.avgN3 !== undefined ? stat.avgN3 : null);
      });
    } else {
      // If competency does not exist, push null values
      statsByGroup.push(null, null, null);
    }
  });

  return statsByGroup;
}

// Function to create extraInfoByGroup
function createExtraInfoByGroup(competencies) {
  const extraInfoByGroup = [];
  const competenciesArr = ['CLF', 'PRC', 'UCM', 'ULC', 'UTF'];

  competenciesArr.forEach(competency => {
    if (competencies[competency]) {
      // Ensure there is at least one entry for each competency
      const competencyStats = competencies[competency].length > 0 ? competencies[competency] : [{}];
      competencyStats.forEach(stat => {
        extraInfoByGroup.push(stat.numTakersN1 !== undefined ? stat.numTakersN1 : null);
        extraInfoByGroup.push(stat.numTakersN2 !== undefined ? stat.numTakersN2 : null);
        extraInfoByGroup.push(stat.numTakersN3 !== undefined ? stat.numTakersN3 : null);
      });
    } else {
      // If competency does not exist, push null values
      extraInfoByGroup.push(null, null, null);
    }
  });

  return extraInfoByGroup;
}

// Call the function to reduce the array
const statsByGroup1 = reduceArray(arrayOfCourseObjectsSeparatedByGroups);


//console.log(statsByGroup1);



//-------------------Processing by Course--------------------------


// Separate info by course
function separateInfoByCourse(array) {
  const separatedInfo = {};

  array.forEach(entry => {
    const courseName = entry._id.course;
    const competency = entry._id.competency;

    if (!separatedInfo[courseName]) {
      separatedInfo[courseName] = {};
    }

    if (!separatedInfo[courseName][competency]) {
      separatedInfo[courseName][competency] = [];
    }

    separatedInfo[courseName][competency].push(entry);
  });

  return separatedInfo;
}

// Create statsByCourse and extraInfoByCourse
function createStatsAndExtraInfoByCourse(separatedInfo) {
  const statsByCourse1 = {};
  const extraInfoByCourse1 = {};
  const competenciesArr = ['CLF', 'PRC', 'UCM', 'ULC', 'UTF'];

  Object.keys(separatedInfo).forEach(course => {
    const courseCompetencies = separatedInfo[course];
    const statsArray = [];
    const extraInfoArray = [];

    competenciesArr.forEach(competency => {
      if (courseCompetencies[competency]) {
        courseCompetencies[competency].forEach(entry => {
          // Push average values to statsArray
          statsArray.push(entry.avgN1 !== undefined ? entry.avgN1 : null);
          statsArray.push(entry.avgN2 !== undefined ? entry.avgN2 : null);
          statsArray.push(entry.avgN3 !== undefined ? entry.avgN3 : null);

          // Push numTakers values to extraInfoArray
          extraInfoArray.push(entry.numTakersN1 !== undefined ? entry.numTakersN1 : null);
          extraInfoArray.push(entry.numTakersN2 !== undefined ? entry.numTakersN2 : null);
          extraInfoArray.push(entry.numTakersN3 !== undefined ? entry.numTakersN3 : null);
        });
      } else {
        // If competency does not exist, push null values
        statsArray.push(null, null, null);
        extraInfoArray.push(null, null, null);
      }
    });

    statsByCourse1[course] = statsArray;
    extraInfoByCourse1[course] = extraInfoArray;
  });

  return { statsByCourse1, extraInfoByCourse1 };
}

// Separate info by course
const separatedInfoByCourse = separateInfoByCourse(statsByCourse);

// Create statsByCourse and extraInfoByCourse
const { statsByCourse1, extraInfoByCourse1 } = createStatsAndExtraInfoByCourse(separatedInfoByCourse);

console.log('Stats by Course:', statsByCourse1);
console.log('Extra Info by Course:', extraInfoByCourse1);


//------------------Merge statsByCourse1 (object)  extraInfoByCourse1 (object) into  statsByGroups (array)--------------------

// Iterate through statsByGroup
statsByGroup1.forEach(courseEntry => {
  const courseName = courseEntry.course;

  // Find stats and extra info objects for the current course
  const statsObject = statsByCourse1[courseName];
  const extraInfoObject = extraInfoByCourse1[courseName];

  // Iterate through groups in the current course entry
  courseEntry.groups.forEach(group => {
      // Assign statsByCourse and extraInfoByCourse objects to the group
      group.statsByCourse = statsObject;
      group.extraInfoByCourse = extraInfoObject;
  });
});

//console.log(statsByGroup1);

//----------------Order the courses alphabetically by course

statsByGroup1.sort((a, b) => {
  // Convert course names to lowercase for case-insensitive sorting
  const courseA = a.course.toLowerCase();
  const courseB = b.course.toLowerCase();

  // Compare course names
  if (courseA < courseB) {
      return -1; // courseA comes before courseB
  }
  if (courseA > courseB) {
      return 1; // courseA comes after courseB
  }
  return 0; // courses are equal
});

//console.log(statsByGroup1);

   if (statsByGroup1.length>0)  {
      //res.json({statsByGroups,statsByGroup1, statsByCourse});
      res.json({statsByTeacher:statsByGroup1});
    } else {
      res.status(404).json({ message: 'No grades found for the specified criteria' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const getStatsTeacherForCoordinatorN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array());
    }

    // const { courseId, studentId, threshold } = req.params;
    const { teacherId,courseId} = req.params;


    //const course = await Course.findById(courseId);
    const teacher = await User.findById(teacherId);


    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    //-------------------------------------------------------------------------
      // Extract group IDs associated with the course
      // const courseGroupIds = course.groups.map(groupId => mongoose.Types.ObjectId(groupId));

      // Aggregate to count active students
      const totalActiveStudents = await User.aggregate([
        {
          $match: {
            // 'registeredInGroups.groupId': { $in: courseGroupIds },
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
         teacherId: mongoose.Types.ObjectId(teacherId),
         courseId: mongoose.Types.ObjectId(courseId)
        }
      }
    ]);

    if (activityIdsAggregate.length === 0) {
      return res.status(404).json({ message: 'No activities found for this teacher Id' });
    }

    const activityIds = activityIdsAggregate.map(activity => activity._id);
    console.log("---------Teacher activities including all courses and groups",activityIds)

                //| *****************Start of part 1*******************|



    const activitiesOfStudents = await Grade.aggregate([
      {
        // Stage 1: Match grades for a specific student
        $match: {
          activityId: { $in: activityIds },
          "isValidGrade":true

        }
      },
      {
        // Stage 2: Lookup activities related to the matched grades
        $lookup: {
          from: "activities", // The collection to perform the lookup on
          localField: "activityId", // The field from the current collection (Grade) to match with
          foreignField: "_id", // The field from the target collection (activities) to match with
          as: "activity" // The name of the array field in which to store the matching documents
        }
      },
      {
        // Stage 3: Unwind the activity array created from the lookup
        $unwind: "$activity"
      },
      {
        // Stage 4: Match activities with completed: true
        $match: {
          "activity.completed": true
        }
      },
      {
        // Stage 5: Lookup the group information for each activity
        $lookup: {
          from: "groups",
          localField: "activity.groupId",
          foreignField: "_id",
          as: "group"
        }
      },
      {
        // Stage 6: Unwind the group array created from the lookup
        $unwind: "$group"
      },
      {
        // Stage 7: Lookup the students in the group
        $lookup: {
          from: "users",
          localField: "group.students",
          foreignField: "_id",
          as: "students"
        }
      },
      {
        // Stage 8: Unwind the students array created from the lookup
        $unwind: "$students"
      },
      {
        // Stage 9: Group all activities together and collect unique activity IDs
        $group: {
          _id: null, // Grouping all documents into a single group
          activities: { $addToSet: "$activity._id" } // Collecting unique activity IDs into an array
        }
      },
      {
        // Stage 10: Projecting the result to remove the _id field and keep only the activities array
        $project: {
          _id: 0, // Excluding the _id field from the output
          activities: 1 // Including the activities field in the output
        }
      }
    ]);

    if ( activitiesOfStudents.length ==0 )  {
      return res.status(404).json({ message: 'No activities found for this teacher' });
    }
    // Storing the list of activity IDs into a separate array
    const activitiesIds = [...activitiesOfStudents[0].activities];

    console.log("Acitivity Ids-------------------:::::::::::::::::::----------",activitiesIds)

//-----------------------------------------------------------------------------------------

    const statsByGroups= await Grade.aggregate([
      {
        $match: {
          activityId: { $in: activitiesIds },
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
            group: "$group.g_Id",
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
          activityDoc: {$push: {term:"$activity.term",description:"$activity.description",rubrica:{$arrayElemAt:["$activity.rubric",0]},tipo:{$arrayElemAt:["$activity.type",0]}}},
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
        avgN1:{$avg:"$avgN1"},      //Promedio de los promedios de las notas de los estudiantes para N1
        avgN2:{$avg:"$avgN2"},      //Promedio de los promedios de las notas de los estudiantes para N2
        avgN3:{$avg:"$avgN3"},      //Promedio de los promedios de las notas de los estudiantes para N3
        numTakersN1:{$sum:"$numScoresN1"},
        numTakersN2:{$sum:"$numScoresN2"},
        numTakersN3:{$sum:"$numScoresN3"},
        //activityDoc: { $first: "$activityDoc" },
        teacherName:{$first:"$teacherName"}

      }
    },
    {
      $sort:{"_id.competency":1}
    }

    ]);

    console.log("stats by Group-------------------:::::::::::::::::::----------",statsByGroups)


    //   | ******************End of part 1*******************|

    //https://chat.openai.com/c/a74b1d78-44bb-44b3-a80d-4e1eb65a1b51
    //---------------------------------------------------------------------------------------------------------------------------------------

    //   | *****************Start of part 2*******************|
    //   |This part of the code performs the statistics by course including students of all groups: it averages each competency for each level,
    //   |finds the number of participants per competency. Warning: The average grade of each level in each competency is calculated for each student,
    //   |then the average of these grades is taken without taking into account the group to which the student belongs. In other words,
    //   |we are not taking the average of the grade associated with each group since all students are ultimately taking the same subject.

// The idea in this part is to do stats for a given course (just one) a teacher is registered in order to compare these results with the results of their groups in the respective course
//Thus for example, let us suppose a teacher has the group 05 of the Mechanics course then this parts do stats for ALL groups of Mechanics and in this way
//we present graphically the stats for group 05 and the stats for the Mechanics course which include all groups associated to this course.



// Find all activities associated with the course ID
const activitiesOfCourses = await Activity.aggregate([
  {
    $match: {
      //courseId: { $in: uniqueCourseId }
      courseId: mongoose.Types.ObjectId(courseId),
    }
  },
  {
    $group: {
      _id: null,
      activities: { $addToSet: "$_id" } // Collect all unique activity IDs
    }
  }
]);

const activityIdsOfCourses = activitiesOfCourses.length > 0 ? activitiesOfCourses[0].activities : [];

console.log("|||||||||||||||||| activitiesOfCourses |||||||||||||||||", activityIdsOfCourses)


    const statsByCourse= await Grade.aggregate([
      {
        $match: {
          // activityId: { $in: activitiesIds },
          activityId: { $in: activityIdsOfCourses},
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
      {$match:
      {
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
          //activityDoc: {$push: {term:"$activity.term",description:"$activity.description",rubrica:{$arrayElemAt:["$activity.rubric",0]},tipo:{$arrayElemAt:["$activity.type",0]}}},
          //teacherName:{$first:"$teacher.name"}
        }
      },
      {
      $group:{
        _id: {
          course: "$_id.course",
          competency: "$_id.competency",
        },
        avgN1:{$avg:"$avgN1"},
        avgN2:{$avg:"$avgN2"},
        avgN3:{$avg:"$avgN3"},
        numTakersN1:{$sum:"$numScoresN1"},
        numTakersN2:{$sum:"$numScoresN2"},
        numTakersN3:{$sum:"$numScoresN3"},
        //activityDoc: { $first: "$activityDoc" },
        //teacherName:{$first:"$teacherName"}

      }
    },
    {$sort:{"_id.competency":1}}


    ]);

    console.log("stats by Course-------------------:::::::::::::::::::----------",statsByCourse)




  
  // Function to filter stats by group and competency
function filterStatsByGroupAndCompetency(course, group, competency) {
    return statsByGroups.filter(stats => stats._id.course === course && stats._id.group === group && stats._id.competency === competency);
}

// Function to create an object containing info for all competencies of a course within a group
function createGroupObject(course, group) {
    const groupObject = {
        group: group,
        competencies: {}
    };

    const competencies = ['CLF', 'PRC', 'UCM', 'ULC', 'UTF'];

    competencies.forEach(competency => {
        groupObject.competencies[competency] = filterStatsByGroupAndCompetency(course, group, competency);
    });

    return groupObject;
}

// Function to create array of objects with info for all courses separated by groups
function createArrayOfCourseObjectsSeparatedByGroups() {
    const courses = Array.from(new Set(statsByGroups.map(stats => stats._id.course))); // Get unique course names

    const arrayOfCourseObjects = courses.map(course => {
        const groups = Array.from(new Set(statsByGroups.filter(stats => stats._id.course === course).map(stats => stats._id.group))); // Get unique group names for each course

        const courseObject = {
            course: course,
            groups: groups.map(group => createGroupObject(course, group))
        };

        return courseObject;
    });

    return arrayOfCourseObjects;
}

// Call the function to get the array of objects with info for all courses separated by groups
const arrayOfCourseObjectsSeparatedByGroups = createArrayOfCourseObjectsSeparatedByGroups();

console.log("arrayOfCourseObjectsSeparatedByGroups::",arrayOfCourseObjectsSeparatedByGroups);

//---------------------------------Further tranformation of arrayOfCourseObjectsSeparatedByGroups

// Function to reduce the array to contain statsByGroup and extraInfoByGroup
function reduceArray(array) {
  return array.map(courseObj => ({
      course: courseObj.course,
      groups: courseObj.groups.map(groupObj => ({
          group: groupObj.group,
          statsByGroup: createStatsByGroup(groupObj.competencies),
          extraInfoByGroup: createExtraInfoByGroup(groupObj.competencies)
      }))
  }));
}

// Function to create statsByGroup
function createStatsByGroup(competencies) {
  const statsByGroup = [];
  const competenciesArr = ['CLF', 'PRC', 'UCM', 'ULC', 'UTF'];

  competenciesArr.forEach(competency => {
    if (competencies[competency]) {
      // Ensure there is at least one entry for each competency
      const competencyStats = competencies[competency].length > 0 ? competencies[competency] : [{}];
      competencyStats.forEach(stat => {
        statsByGroup.push(stat.avgN1 !== undefined ? stat.avgN1 : null);
        statsByGroup.push(stat.avgN2 !== undefined ? stat.avgN2 : null);
        statsByGroup.push(stat.avgN3 !== undefined ? stat.avgN3 : null);
      });
    } else {
      // If competency does not exist, push null values
      statsByGroup.push(null, null, null);
    }
  });

  return statsByGroup;
}

// Function to create extraInfoByGroup
function createExtraInfoByGroup(competencies) {
  const extraInfoByGroup = [];
  const competenciesArr = ['CLF', 'PRC', 'UCM', 'ULC', 'UTF'];

  competenciesArr.forEach(competency => {
    if (competencies[competency]) {
      // Ensure there is at least one entry for each competency
      const competencyStats = competencies[competency].length > 0 ? competencies[competency] : [{}];
      competencyStats.forEach(stat => {
        extraInfoByGroup.push(stat.numTakersN1 !== undefined ? stat.numTakersN1 : null);
        extraInfoByGroup.push(stat.numTakersN2 !== undefined ? stat.numTakersN2 : null);
        extraInfoByGroup.push(stat.numTakersN3 !== undefined ? stat.numTakersN3 : null);
      });
    } else {
      // If competency does not exist, push null values
      extraInfoByGroup.push(null, null, null);
    }
  });

  return extraInfoByGroup;
}

// Call the function to reduce the array
const statsByGroup1 = reduceArray(arrayOfCourseObjectsSeparatedByGroups);


//console.log(statsByGroup1);



//-------------------Processing by Course--------------------------


// Separate info by course
function separateInfoByCourse(array) {
  const separatedInfo = {};

  array.forEach(entry => {
    const courseName = entry._id.course;
    const competency = entry._id.competency;

    if (!separatedInfo[courseName]) {
      separatedInfo[courseName] = {};
    }

    if (!separatedInfo[courseName][competency]) {
      separatedInfo[courseName][competency] = [];
    }

    separatedInfo[courseName][competency].push(entry);
  });

  return separatedInfo;
}

// Create statsByCourse and extraInfoByCourse
function createStatsAndExtraInfoByCourse(separatedInfo) {
  const statsByCourse1 = {};
  const extraInfoByCourse1 = {};
  const competenciesArr = ['CLF', 'PRC', 'UCM', 'ULC', 'UTF'];

  Object.keys(separatedInfo).forEach(course => {
    const courseCompetencies = separatedInfo[course];
    const statsArray = [];
    const extraInfoArray = [];

    competenciesArr.forEach(competency => {
      if (courseCompetencies[competency]) {
        courseCompetencies[competency].forEach(entry => {
          // Push average values to statsArray
          statsArray.push(entry.avgN1 !== undefined ? entry.avgN1 : null);
          statsArray.push(entry.avgN2 !== undefined ? entry.avgN2 : null);
          statsArray.push(entry.avgN3 !== undefined ? entry.avgN3 : null);

          // Push numTakers values to extraInfoArray
          extraInfoArray.push(entry.numTakersN1 !== undefined ? entry.numTakersN1 : null);
          extraInfoArray.push(entry.numTakersN2 !== undefined ? entry.numTakersN2 : null);
          extraInfoArray.push(entry.numTakersN3 !== undefined ? entry.numTakersN3 : null);
        });
      } else {
        // If competency does not exist, push null values
        statsArray.push(null, null, null);
        extraInfoArray.push(null, null, null);
      }
    });

    statsByCourse1[course] = statsArray;
    extraInfoByCourse1[course] = extraInfoArray;
  });

  return { statsByCourse1, extraInfoByCourse1 };
}

// Separate info by course
const separatedInfoByCourse = separateInfoByCourse(statsByCourse);

// Create statsByCourse and extraInfoByCourse
const { statsByCourse1, extraInfoByCourse1 } = createStatsAndExtraInfoByCourse(separatedInfoByCourse);

console.log('Stats by Course:', statsByCourse1);
console.log('Extra Info by Course:', extraInfoByCourse1);


//------------------Merge statsByCourse1 (object)  extraInfoByCourse1 (object) into  statsByGroups (array)--------------------

// Iterate through statsByGroup
statsByGroup1.forEach(courseEntry => {
  const courseName = courseEntry.course;

  // Find stats and extra info objects for the current course
  const statsObject = statsByCourse1[courseName];
  const extraInfoObject = extraInfoByCourse1[courseName];

  // Iterate through groups in the current course entry
  courseEntry.groups.forEach(group => {
      // Assign statsByCourse and extraInfoByCourse objects to the group
      group.statsByCourse = statsObject;
      group.extraInfoByCourse = extraInfoObject;
  });
});

//console.log(statsByGroup1);

//----------------Order the courses alphabetically by course

statsByGroup1.sort((a, b) => {
  // Convert course names to lowercase for case-insensitive sorting
  const courseA = a.course.toLowerCase();
  const courseB = b.course.toLowerCase();

  // Compare course names
  if (courseA < courseB) {
      return -1; // courseA comes before courseB
  }
  if (courseA > courseB) {
      return 1; // courseA comes after courseB
  }
  return 0; // courses are equal
});

//console.log(statsByGroup1);

   if (statsByGroup1.length>0)  {
      //res.json({statsByGroups,statsByGroup1, statsByCourse});
      res.json({statsByTeacher:statsByGroup1});
    } else {
      res.status(404).json({ message: 'No grades found for the specified criteria' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



const getStudentGradesAllTermsForStudentsN= asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array());
    }

    // const { courseId, studentId, threshold } = req.params;
    const { studentId} = req.params;

    //const course = await Course.findById(courseId);
    const student = await User.findById(studentId);

    // if (!course) {
    //   return res.status(404).json({ message: 'Course not found' });
    // }
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    //-------------------------------------------------------------------------
      // Extract group IDs associated with the course
      // const courseGroupIds = course.groups.map(groupId => mongoose.Types.ObjectId(groupId));

      // Aggregate to count active students
      const totalActiveStudents = await User.aggregate([
        {
          $match: {
            // 'registeredInGroups.groupId': { $in: courseGroupIds },
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


    // const activityIdsAggregate = await Activity.aggregate([
    // //   {
    //     $match: {
    //      courseId: mongoose.Types.ObjectId(courseId)
    //     }
    //   }
    // ]);
    // let factor = parseFloat(threshold); // Set the desired threshold value here

    // if (activityIdsAggregate.length === 0) {
    //   return res.status(404).json({ message: 'No activities found for the specified criteria' });
    // }

    // const activityIds = activityIdsAggregate.map(activity => activity._id);

                //| *****************Start of part 1*******************|

    //   |This part of the code does stats for the diferent groups of a course: averages each competency for each level,|
    //   |finds the percentage of students that developed each competency level above sertain level|


    const activitiesOfStudents = await Grade.aggregate([
      {
        // Stage 1: Match grades for a specific student
        $match: {
          studentId: mongoose.Types.ObjectId(studentId) // missing isValidGrade Please conidere this! No its done below
        }
      },
      {
        // Stage 2: Lookup activities related to the matched grades
        $lookup: {
          from: "activities", // The collection to perform the lookup on
          localField: "activityId", // The field from the current collection (Grade) to match with
          foreignField: "_id", // The field from the target collection (activities) to match with
          as: "activity" // The name of the array field in which to store the matching documents
        }
      },
      {
        // Stage 3: Unwind the activity array created from the lookup
        $unwind: "$activity"
      },
      {
        // Stage 4: Match activities with completed: true
        $match: {
          "activity.completed": true
        }
      },
      {
        // Stage 5: Lookup the group information for each activity
        $lookup: {
          from: "groups",
          localField: "activity.groupId",
          foreignField: "_id",
          as: "group"
        }
      },
      {
        // Stage 6: Unwind the group array created from the lookup
        $unwind: "$group"
      },
      {
        // Stage 7: Lookup the students in the group
        $lookup: {
          from: "users",
          localField: "group.students",
          foreignField: "_id",
          as: "students"
        }
      },
      {
        // Stage 8: Unwind the students array created from the lookup
        $unwind: "$students"
      },
      {
        // Stage 9: Group all activities together and collect unique activity IDs
        $group: {
          _id: null, // Grouping all documents into a single group
          activities: { $addToSet: "$activity._id" } // Collecting unique activity IDs into an array
        }
      },
      {
        // Stage 10: Projecting the result to remove the _id field and keep only the activities array
        $project: {
          _id: 0, // Excluding the _id field from the output
          activities: 1 // Including the activities field in the output
        }
      }
    ]);

    if ( activitiesOfStudents.length ==0 )  {
      return res.status(404).json({ message: 'No activities found for this student' });
    }
    // Storing the list of activity IDs into a separate array
    const activitiesIds = [...activitiesOfStudents[0].activities];

    //console.log("Acitivity Ids-------------------:::::::::::::::::::----------",activitiesIds)

//-----------------------------------------------------------------------------------------

    const statsByGroups= await Grade.aggregate([
      {
        $match: {
          activityId: { $in: activitiesIds },
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
            group: "$group.g_Id",
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
          activityDoc: {$push: {term:"$activity.term",description:"$activity.description",rubrica:{$arrayElemAt:["$activity.rubric",0]},tipo:{$arrayElemAt:["$activity.type",0]}}},
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
        avgN1:{$avg:"$avgN1"},      //Promedio de los promedios de las notas de los estudiantes pra N1
        avgN2:{$avg:"$avgN2"},      //Promedio de los promedios de las notas de los estudiantes pra N2
        avgN3:{$avg:"$avgN3"},      //Promedio de los promedios de las notas de los estudiantes pra N3
        numTakersN1:{$sum:"$numScoresN1"},
        numTakersN2:{$sum:"$numScoresN2"},
        numTakersN3:{$sum:"$numScoresN3"},
        activityDoc: { $first: "$activityDoc" },
        teacherName:{$first:"$teacherName"}

      }
    },
    {
      $sort:{"_id.competency":1}
    }

    ]);

    console.log("stats by Group-------------------:::::::::::::::::::----------",statsByGroups)


    //   | ******************End of part 1*******************|

    //https://chat.openai.com/c/a74b1d78-44bb-44b3-a80d-4e1eb65a1b51
    //---------------------------------------------------------------------------------------------------------------------------------------

    //   | *****************Start of part 2*******************|
    //   |This part of the code performs the statistics by course including students of all groups: it averages each competency for each level,
    //   |finds the number of participants per competency. Warning: The average grade of each level in each competency is calculated for each student,
    //   |then the average of these grades is taken without taking into account the group to which the student belongs. In other words,
    //   |we are not taking the average of the grade associated with each group since all students are ultimately taking the same subject.


// Step 1: Find the group(s) in which the specified student is registered
const groupsWithStudent = await Group.aggregate([
  {
    $match: {
      students: mongoose.Types.ObjectId(studentId)
    }
  }
]);


// Step 2: Extract the course IDs from those groups
const courseIds = groupsWithStudent.map(group => group.courseId);

// Step 3: Find all activities associated with those course IDs
const activitiesOfCourses = await Activity.aggregate([
  {
    $match: {
      courseId: { $in: courseIds }
    }
  },
  {
    $group: {
      _id: null,
      activities: { $addToSet: "$_id" } // Collect all unique activity IDs
    }
  }
]);

const activityIdsOfCourses = activitiesOfCourses.length > 0 ? activitiesOfCourses[0].activities : [];

    const statsByCourse= await Grade.aggregate([
      {
        $match: {
          activityId: { $in: activityIdsOfCourses},
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
      {$match:
      {
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
          //activityDoc: {$push: {term:"$activity.term",description:"$activity.description",rubrica:{$arrayElemAt:["$activity.rubric",0]},tipo:{$arrayElemAt:["$activity.type",0]}}},
          //teacherName:{$first:"$teacher.name"}
        }
      },
      {
      $group:{
        _id: {
          course: "$_id.course",
          competency: "$_id.competency",
        },
        avgN1:{$avg:"$avgN1"},
        avgN2:{$avg:"$avgN2"},
        avgN3:{$avg:"$avgN3"},
        numTakersN1:{$sum:"$numScoresN1"},
        numTakersN2:{$sum:"$numScoresN2"},
        numTakersN3:{$sum:"$numScoresN3"},
        //activityDoc: { $first: "$activityDoc" },
        //teacherName:{$first:"$teacherName"}

      }
    },
    {$sort:{"_id.competency":1}}


    ]);


                 //| *****************Start of part 3*******************|

    //   |This part of the code does stats for the student grades: averages each competency for each level,|

    const statsByStudent = await Grade.aggregate([
      {
        $match: {
          "isValidGrade":true,
          studentId: mongoose.Types.ObjectId(studentId) // Filter by studentId

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

      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
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
          scoresN1: {
            $push: {$cond: [{ $eq: ['$scores.n1', ''] }, null, { $convert: { input: '$scores.n1', to: "double" } } ]},
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
          scoresN2: {
            $push: {$cond: [{ $eq: ['$scores.n2', ''] }, null, { $convert: { input: '$scores.n2', to: "double" } }]},
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
          scoresN3: {
            $push: {$cond: [{ $eq: ['$scores.n3', ''] }, null, { $convert: { input: '$scores.n3', to: "double" } }]},
            },
          numScoresN3: {
            $sum: { $cond: [{ $ne: ["$scores.n3", ''] }, 1, 0] }
          },

          activityDoc: {$push: {term:"$activity.term",description:"$activity.description",rubrica:{$arrayElemAt:["$activity.rubric",0]},tipo:{$arrayElemAt:["$activity.type",0]}}},
          teacherName:{$first:"$teacher.name"},
          studentName:{$first:"$student.name"}
        }
      },
      {
      $project:{
        "_id.course":1,
        "g_Id":"$_id.group.g_Id",
        "_id.competency":1,
        "_id.estudiante":1,
        avgN1:1,
        avgN2:1,
        avgN3:1,
        scoresN1:1,
        scoresN2:1,
        scoresN3:1,

        numScoresN1:1,
        numScoresN2:1,
        numScoresN3:1,
        activityDoc: 1,
        teacherName:1,
        studentName:1

      }
    },
    {
      $sort:{
        "_id.competency":1
      }
    }

    ]);

    //console.log("::::::::::::::::::XXXXXXXXXX  Stats By Student:", statsByStudent)

//-------------------------------------------------------------------------------------------------------
    const courseStats = {};

    // Loop through statsByGroups to populate course info and group stats
    for (const groupStat of statsByGroups) {
        const courseName = groupStat._id.course;
        const competency = groupStat._id.competency;

        // Check if course and competency exist, create if not
        if (!courseStats[courseName] || !courseStats[courseName][competency]) {
            courseStats[courseName] = courseStats[courseName] || {};
            courseStats[courseName][competency] = {
                ...groupStat._id, // Include course name, teacherName from groupStat._id
                statsByGroup: [],
                statsByStudent: [], // Separate array for student stats
            };
        }
        courseStats[courseName][competency].statsByGroup.push(groupStat);
    }

    // Separate loop for statsByCourse to populate course averages (per competency)
    for (const courseStat of statsByCourse) {
        const courseName = courseStat._id.course;
        const competency = courseStat._id.competency;

        // Ensure course and competency exist before merging
        if (courseStats[courseName] && courseStats[courseName][competency]) {
            courseStats[courseName][competency] = {
                ...courseStats[courseName][competency], // Merge existing course info
                ...courseStat, // Add course averages from statsByCourse (for this competency)
            };
        }
    }

    // Separate loop for statsByStudent to populate student stats (per competency)
    for (const studentStat of statsByStudent) {
        const courseName = studentStat._id.course;
        const competency = studentStat._id.competency;

        // Ensure course and competency exist before adding student data
        if (courseStats[courseName] && courseStats[courseName][competency]) {
            courseStats[courseName][competency].statsByStudent.push(studentStat);
        }
    }

    // console.log("Partition:", courseStats);
    // console.log("Converted into an array", Object.values(courseStats))

    const transformedData = Object.values(courseStats)
    const InfoBarChart = {}

    transformedData.forEach(course => {
        const item = Object.values(course)

        const statsByGroup = []
        const statsByStudent = []
        const statsByCourse=[]

        const extraInfoByStudent = []
        const extraInfoByGroup = []
        const extraInfoByCourse = []


        console.log("item:::::::::::",item)
        //console.log("-----------------", item)
        // if (item[0].avgN1 !== null) { statsByCourse.push(item[0].avgN1) } else { statsByCourse.push(null) }
        // if (item[0].avgN2 !== null) { statsByCourse.push(item[0].avgN2) } else { statsByCourse.push(null) }
        // if (item[0].avgN3 !== null) { statsByCourse.push(item[0].avgN3) } else { statsByCourse.push(null) }

        // if (item[1].avgN1 !== null) { statsByCourse.push(item[1].avgN1) } else { statsByCourse.push(null) }
        // if (item[1].avgN2 !== null) { statsByCourse.push(item[1].avgN2) } else { statsByCourse.push(null) }
        // if (item[1].avgN3 !== null) { statsByCourse.push(item[1].avgN3) } else { statsByCourse.push(null) }

        // if (item[2].avgN1 !== null) { statsByCourse.push(item[2].avgN1) } else { statsByCourse.push(null) }
        // if (item[2].avgN2 !== null) { statsByCourse.push(item[2].avgN2) } else { statsByCourse.push(null) }
        // if (item[2].avgN3 !== null) { statsByCourse.push(item[2].avgN3) } else { statsByCourse.push(null) }

        // if (item[3].avgN1 !== null) { statsByCourse.push(item[3].avgN1) } else { statsByCourse.push(null) }
        // if (item[3].avgN2 !== null) { statsByCourse.push(item[3].avgN2) } else { statsByCourse.push(null) }
        // if (item[3].avgN3 !== null) { statsByCourse.push(item[3].avgN3) } else { statsByCourse.push(null) }

        // if (item[4].avgN1 !== null) { statsByCourse.push(item[4].avgN1) } else { statsByCourse.push(null) }
        // if (item[4].avgN2 !== null) { statsByCourse.push(item[4].avgN2) } else { statsByCourse.push(null) }
        // if (item[4].avgN3 !== null) { statsByCourse.push(item[4].avgN3) } else { statsByCourse.push(null) }

        const avgProperties = ["avgN1", "avgN2", "avgN3"];
        const numTakersPropertiessByCourse = ["numTakersN1", "numTakersN2", "numTakersN3"];

      for (let i = 0; i < item.length; i++) {
        avgProperties.forEach(prop => {
          statsByCourse.push(item[i][prop] || null);
        });
      }

      for (let i = 0; i < item.length; i++) {
        numTakersPropertiessByCourse.forEach(prop => {
          extraInfoByCourse.push(item[i][prop] || null);
        });
      }



        // item.forEachi => {
        //   console.log("-------------->>>>>>>>Elemento:",elemento)

        //     if i.statsByGroup[0].avgN1 !== null) { statsByGroup.pushi.statsByGroup[0].avgN1) } else { statsByGroup.push(null) }
        //     if i.statsByGroup[0].avgN2 !== null) { statsByGroup.pushi.statsByGroup[0].avgN2) } else { statsByGroup.push(null) }
        //     if i.statsByGroup[0].avgN3 !== null) { statsByGroup.pushi.statsByGroup[0].avgN3) } else { statsByGroup.push(null) }

        //     if i.statsByStudent[0].avgN1 !== null) { statsByStudent.pushi.statsByStudent[0].avgN1) } else { statsByStudent.push(null) }
        //     if i.statsByStudent[0].avgN2 !== null) { statsByStudent.pushi.statsByStudent[0].avgN2) } else { statsByStudent.push(null) }
        //     if i.statsByStudent[0].avgN3 !== null) { statsByStudent.pushi.statsByStudent[0].avgN3) } else { statsByStudent.push(null) }

        //     if i.statsByGroup[0].numTakersN1 !== null) { extraInfoByGroup.pushi.statsByGroup[0].numTakersN1) } else { extraInfoByGroup.push(null) }
        //     if i.statsByGroup[0].numTakersN2 !== null) { extraInfoByGroup.pushi.statsByGroup[0].numTakersN2) } else { extraInfoByGroup.push(null) }
        //     if i.statsByGroup[0].numTakersN3 !== null) { extraInfoByGroup.pushi.statsByGroup[0].numTakersN3) } else { extraInfoByGroup.push(null) }

        //     if i.statsByStudent[0].numScoresN1 !== null) { extraInfoByStudent.pushi.statsByStudent[0].numScoresN1) } else { extraInfoByStudent.push(null) }
        //     if i.statsByStudent[0].numScoresN2 !== null) { extraInfoByStudent.pushi.statsByStudent[0].numScoresN2) } else { extraInfoByStudent.push(null) }
        //     if i.statsByStudent[0].numScoresN3 !== null) { extraInfoByStudent.pushi.statsByStudent[0].numScoresN3) } else { extraInfoByStudent.push(null) }


        // })

        item.forEach(i => {
          console.log("-------------->>>>>>>>i:",i)


          if (i && i.statsByStudent && i.statsByStudent.length > 0) {
            if (i.statsByGroup[0].avgN1 !== null) { statsByGroup.push(i.statsByGroup[0].avgN1) } else { statsByGroup.push(null) }
            if (i.statsByGroup[0].avgN2 !== null) { statsByGroup.push(i.statsByGroup[0].avgN2) } else { statsByGroup.push(null) }
            if (i.statsByGroup[0].avgN3 !== null) { statsByGroup.push(i.statsByGroup[0].avgN3) } else { statsByGroup.push(null) }
          } else {
            statsByGroup.push(null,null,null);

          }
            //Please revise the next new code, the commented code is the old one. The error emerged when I did the presentation to Jamime, Jorge and Efren.
            //It is the first time that pesented the app to the public! What a shame! June 4 2024. After reviewing, it works

           
          if (i && i.statsByStudent && i.statsByStudent.length > 0) {
              if ( i.statsByStudent[0].avgN1 !== null) {statsByStudent.push(i.statsByStudent[0].avgN1);} else {statsByStudent.push(null);}
              if ( i.statsByStudent[0].avgN2 !== null ) {statsByStudent.push(i.statsByStudent[0].avgN2);} else {statsByStudent.push(null);}
              if (i.statsByStudent[0].avgN3 !== null ) {statsByStudent.push(i.statsByStudent[0].avgN3);} else {statsByStudent.push(null);}
          } else {
              statsByStudent.push(null,null,null);
          }


        if (i && i.statsByStudent && i.statsByStudent.length > 0) {
            if ( i.statsByStudent[0].numScoresN1 !== null) {extraInfoByStudent.push(i.statsByStudent[0].numScoresN1)} else {extraInfoByStudent.push(null)}
            if ( i.statsByStudent[0].numScoresN2 !== null) {extraInfoByStudent.push(i.statsByStudent[0].numScoresN2)} else {extraInfoByStudent.push(null)}
            if ( i.statsByStudent[0].numScoresN3 !== null) {extraInfoByStudent.push(i.statsByStudent[0].numScoresN3)} else {extraInfoByStudent.push(null)}
        } else {
          extraInfoByStudent.push(null,null,null)
        }

        if (i && i.statsByStudent && i.statsByStudent.length > 0) {
            if (i.statsByGroup[0].numTakersN1 !== null) { extraInfoByGroup.push(i.statsByGroup[0].numTakersN1) } else { extraInfoByGroup.push(null) }
            if (i.statsByGroup[0].numTakersN2 !== null) { extraInfoByGroup.push(i.statsByGroup[0].numTakersN2) } else { extraInfoByGroup.push(null) }
            if (i.statsByGroup[0].numTakersN3 !== null) { extraInfoByGroup.push(i.statsByGroup[0].numTakersN3) } else { extraInfoByGroup.push(null) }
        } else {
            extraInfoByGroup.push(null,null,null)
          }
        })

        InfoBarChart[item[0].course] = { statsByStudent: statsByStudent, statsByGroup: statsByGroup, courseName: item[0].course, group:item[0].group, statsByCourse: statsByCourse,  extraInfoByStudent, extraInfoByGroup, extraInfoByCourse }

    })


    // Sort the array alphabetically by course name
    const InfoBarChartSorted= Object.values(InfoBarChart).sort((a, b) => {
      // Compare course names (case-insensitive)
      const nameA = a.courseName.toLowerCase();
      const nameB = b.courseName.toLowerCase();
      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    });

    //console.log("InfoToChart:::::::::::::::::", Object.values(InfoBarChartSorted))   ///AAAAAAA

    //https://chat.openai.com/c/a74b1d78-44bb-44b3-a80d-4e1eb65a1b51

    //   | ******************End of part 3******************|

   // |*********************Start of part 4 *********************|
   const studentScores = await Grade.aggregate([
    {
      $match: {
        "isValidGrade":true,
        studentId: mongoose.Types.ObjectId(studentId) // Filter by studentId

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

    {
      $lookup: {
        from: "users",
        localField: "studentId",
        foreignField: "_id",
        as: "student"
      }
    },
    { $unwind: "$student" },
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
          term:"$activity.term"

        },


        scoresN1: {
          $push: {$cond: [{ $eq: ['$scores.n1', ''] }, null, { $convert: { input: '$scores.n1', to: "double" } } ]},
          },
        numScoresN1: {
          $sum: { $cond: [{ $ne: ["$scores.n1", ''] }, 1, 0] }
        },

        scoresN2: {
          $push: {$cond: [{ $eq: ['$scores.n2', ''] }, null, { $convert: { input: '$scores.n2', to: "double" } }]},
          },
        numScoresN2: {
          $sum: { $cond: [{ $ne: ["$scores.n2", ''] }, 1, 0] }
        },

        scoresN3: {
          $push: {$cond: [{ $eq: ['$scores.n3', ''] }, null, { $convert: { input: '$scores.n3', to: "double" } }]},
          },
        numScoresN3: {
          $sum: { $cond: [{ $ne: ["$scores.n3", ''] }, 1, 0] }
        },

        activityDoc: {$push: {term:"$activity.term",description:"$activity.description",rubrica:{$arrayElemAt:["$activity.rubric",0]},tipo:{$arrayElemAt:["$activity.type",0]}}},
        teacherName:{$first:"$teacher.name"},
        studentName:{$first:"$student.name"}
      }
    },
  {
    $group: {
      _id: {
        course: "$_id.course",
        group: "$_id.group",
        competency:"$_id.competency",
      },
      scores: {
        $push: {
          term: "$_id.term",
          scoresN1: "$scoresN1",
          scoresN2: "$scoresN2",
          scoresN3: "$scoresN3"
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      course: "$_id.course",
      group: "$_id.group.g_Id",
      competency:"$_id.competency",
      scores: 1
    }
  },
  {
    $sort:{"competency":1}
}

  ]);

// Separate the data by courses
  const coursesByInfo = studentScores.reduce((courses, score) => {
    const { course, group, competency, ...scoresData } = score; // Destructure excluding course, group, competency

    // Create a new course object if it doesn't exist
    courses[course] = courses[course] || {
      courseName: course,
      group,
      competencies: {},
    };

    // Add competency data to the course object
    courses[course].competencies[competency] = scoresData;

    return courses;
  }, {});

  const coursesArray = Object.values(coursesByInfo);


  // Sort the array alphabetically by course name
  const studentScoresSorted= coursesArray.sort((a, b) => {
    // Compare course names (case-insensitive)
    const nameA = a.courseName.toLowerCase();
    const nameB = b.courseName.toLowerCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });

  const sortedStudentScoresByTerm = studentScoresSorted.map(course => {
    // Iterate over each competency in the competencies object
    const sortedCompetencies = Object.entries(course.competencies).reduce((acc, [competency, data]) => {
        // Sort the scores array for each competency in ascending order of the term
        const sortedScores = data.scores.sort((a, b) => parseInt(a.term) - parseInt(b.term));
        // Append the sorted scores to the accumulator
        acc[competency] = { scores: sortedScores };
        return acc;
    }, {});

    // Return the course object with sorted competencies
    return { ...course, competencies: sortedCompetencies };
});



  //console.log("::::::::::::::::::YYYYYYYYYYYYYYAB--->  Stats By Student:", studentScoresSorted)

   // |*********************End of part 4 ***********************|


   if (Object.values(InfoBarChartSorted).length>0 &&sortedStudentScoresByTerm.length>0)  {
      res.json({ InfoBarChart:Object.values(InfoBarChartSorted), studentScores:sortedStudentScoresByTerm});
    } else {
      res.status(404).json({ message: 'No grades found for the specified criteria' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




module.exports = {
    getStudentGradesByCouseByGroupAndByTermN,

    getStudentGradesAllCoursesByTermN,
    getStudentGradesAllCoursesAllTermsN,

    createGradeN,
    updateGradeN,
    updateOneCompetencyGradeN,
    getActivityGradesN,
    updateStudentGradesN,
    getPercentilesByCourseGroupStudentN,

    getTopStudentGradesByCourseGroupsAllTermsN,

    deactivateStudentsGradesInAGroup,

    getStudentGradesAllTermsFullAnalisysN,

    getStudentGradesAllTermsForStudentsN,

    getStatsTeacherForDirectorN,

    getStatsTeacherForCoordinatorN


}