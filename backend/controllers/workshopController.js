const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

const Group = require('../models/Group');
const Course = require('../models/Course');
const User = require('../models/User');
const Grade = require('../models/Grade');
const DateInfo = require('../models/DateInfo')
const TeamNames = require('../models/TeamWork/TeamNamesSchema');

const {TeacherTopic, StudentTopic,PeerTopic}=require("../models/TeamWork/rubricSchema")

const Workshop =require("../models/TeamWork/workshopSchema")

const { validationResult } = require('express-validator');



const createWorkshopN = async (req, res) => {
   // Handle validation errors
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ success: false, errors: errors.array() });
   }

   const { description, courseId, groupId, endDate, teamNames } = req.body;
   try {
    // Fetch date information for term assignment
    const dateInfo = await DateInfo.findOne();
    if (!dateInfo) {
      return res.status(500).json({ success: false, error: 'Date information not found' });
    }

    // Determine the term based on the current date
    const currentDate = new Date();
    const expDate = new Date(endDate);
    let term = 1; // Default term

    if (currentDate >= dateInfo.initDateT1 && currentDate <= dateInfo.endDateT1 && expDate <= dateInfo.endDateT1) {
      term = 1;
    } else if (currentDate >= dateInfo.initDateT2 && currentDate <= dateInfo.endDateT2 && expDate <= dateInfo.endDateT2) {
      term = 2;
    } else if (currentDate >= dateInfo.initDateT3 && currentDate <= dateInfo.endDateT3 && expDate <= dateInfo.endDateT3) {
      term = 3;
    } else {
      return res.status(400).json({ success: false, error: 'Workshop dates must fall within a valid term' });
    }

    // Ensure the endDate is greater than the current time
    if (expDate <= currentDate) {
      return res.status(400).json({ success: false, error: 'Expiration date must be greater than the current time' });
    }

 

     // Find the most recently created workshop with the same courseId and groupId
     const latestWorkshop = await Workshop.findOne({
       courseId: mongoose.Types.ObjectId(courseId),
       groupId: mongoose.Types.ObjectId(groupId),
     }).sort({ createdAt: -1 });

     let workshopName = 'Taller 1';
     if (latestWorkshop) {
       // Check if the latest workshop's teams array has length zero
       if (latestWorkshop.teams.length === 0) {
         return res.status(400).json({ success: false, error: 'El más reciente taller que creó no tiene equipos' });
       }

       // Increment the workshop name
       const nameParts = latestWorkshop.name.split(' ');
       const latestNumber = parseInt(nameParts[nameParts.length - 1], 10);
       workshopName = `Taller ${latestNumber + 1}`;
     }

     // Create the new workshop
     const workshop = await Workshop.create({
       name: workshopName,
       description,
       courseId: mongoose.Types.ObjectId(courseId),
       groupId: mongoose.Types.ObjectId(groupId),
       term,
       startDate:currentDate,
       endDate:expDate
     });

     // Check for duplicate team names within the request
     const existingTeamNames = workshop.teams.map(team => team.name);
     const duplicateNames = teamNames.filter(name => existingTeamNames.includes(name));
     if (duplicateNames.length > 0) {
       return res.status(400).json({ success: false, error: `Nombres de equipo deben ser únicos: ${duplicateNames.join(', ')}` });
     }

     // Add the new teams to the workshop
     teamNames.forEach(teamName => {
       workshop.teams.push({ name: teamName, students: [] });
     });
     await workshop.save();

     res.status(201).json({ success: true, data: workshop });
   } catch (error) {
     if (error.code === 11000) {  // Duplicate key error
       console.log('Duplicate key error:', error);
       return res.status(400).json({ success: false, error: 'Para crear un nuevo taller, primero hay que aplicar el anterior.' });
     }
     console.log('Error creating workshop:', error);
     res.status(500).json({ success: false, error: error.message });
   }
 }

//This endPoint should be tweaked by passing only the workshop _id as each workshop has courseId, groupId, term, etc
  const createTeamN = async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
  
    const { workshopName, teamNames, courseId, groupId, term } = req.body;
  
    try {
      // Debugging information
      console.log("Received payload:", { workshopName, teamNames, courseId, term });
  
      // Find the workshop by name, course, and term
      const workshop = await Workshop.findOne({
        name: workshopName,
        courseId: mongoose.Types.ObjectId(courseId),
        groupId: mongoose.Types.ObjectId(groupId),
        term
      });
      
      if (!workshop) {
        // Additional logging for debugging
        console.log("Workshop not found:", { name: workshopName, courseId, term });
        return res.status(404).json({ success: false, error: 'Workshop for this course and term not found' });
      }
  
      // Check for duplicate team names within the request and existing teams
      const existingTeamNames = workshop.teams.map(team => team.name);
      const duplicateNames = teamNames.filter(name => existingTeamNames.includes(name));
      if (duplicateNames.length > 0) {
        return res.status(400).json({ success: false, error: `Team names already exist in this workshop: ${duplicateNames.join(', ')}` });
      }
  
      // Add the new teams to the workshop
      teamNames.forEach(teamName => {
        workshop.teams.push({ name: teamName, students: [] });
      });
      await workshop.save();
  
      res.status(201).json({ success: true, data: workshop });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }


  const joinTeamN = async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
  
    const { studentId, workshopName, teamName, courseId, groupId, term } = req.body;
  
    try {
      // Find the workshop
      const workshop = await Workshop.findOne({ name: workshopName,courseId:courseId, groupId:groupId,term:term });
      if (!workshop) {
        return res.status(404).json({ success: false, error: 'Workshop not found' });
      }
  
      // Remove the student from any other teams in the workshop
      workshop.teams.forEach(team => {
        team.students = team.students.filter(student => student.toString() !== studentId);
      });
  
      // Find the team by name and add the student to the team
      const team = workshop.teams.find(team => team.name === teamName);
      if (!team) {
        return res.status(404).json({ success: false, error: 'Team not found' });
      }
  
      // Add the student to the team
      team.students.push(mongoose.Types.ObjectId(studentId));
      await workshop.save();
  
      res.status(200).json({ success: true, data: workshop });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
 



// Endpoint to fetch a specific workshop with all its workteams displaying student names
const getWorkshopWithTeamsN = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { workshopId } = req.params;

  try {
    // Aggregation pipeline to fetch the workshop and populate student names
    const workshop = await Workshop.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(workshopId) } },
      { $unwind: { path: '$teams', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          let: { studentIds: '$teams.students' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$studentIds'] } } },  // check if a user's _id from the users collection exists within the studentIds variable.
            { $project: { _id: 1, name: 1 } } // Adjust the fields to match your Student schema
          ],
          as: 'teams.students'
        }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          description: { $first: '$description' },
          teams: {
            $push: {
              _id: '$teams._id',
              name: '$teams.name',
              students: '$teams.students',
              peerGrades: '$teams.peerGrades',
              //selfAssessmentGrade: '$teams.selfAssessmentGrade',
              teacherGrade: '$teams.teacherGrade'
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          teams: 1
        }
      }
    ]);

    if (!workshop || workshop.length === 0) {
      return res.status(404).json({ error: 'Workshop not found' });
    }

    res.status(200).json({  data: workshop[0] });
  } catch (error) {
    res.status(500).json({  error: error.message });
  }
};




const getWorkShopIdForACourseN = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { courseId, studentId } = req.params;

    // Find workshops where the provided student participates for the given courseId
    const workshops = await Workshop.aggregate([
      {
        $match: {
          courseId: mongoose.Types.ObjectId(courseId),
          'teams.students': mongoose.Types.ObjectId(studentId)
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          term: 1,
          teams: 1
        }
      }
    ]);

    res.json({ success: true, workshops });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


const   removeStudentFromTeamN = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { studentId, workshopId, teamId } = req.body;

  try {
      const workshop = await Workshop.findById(workshopId);
      if (!workshop) {
          return res.status(404).json({ success: false, message: 'Workshop not found' });
      }

      const team = workshop.teams.id(teamId);
      if (!team) {
          return res.status(404).json({ success: false, message: 'Team not found' });
      }

      team.students.pull(studentId);

      await workshop.save();

      res.json({ success: true, message: 'Student removed from team successfully' });
  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
}

const getAllWorkShopsNewN = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { studentId } = req.params;

    // Fetch the student's registered groups
    const student = await User.findById(studentId).select('registeredInGroups');
    const activeRegisteredGroupIds = student.registeredInGroups
      .filter(group => group.isActive)
      .map(group => mongoose.Types.ObjectId(group.groupId));

    // Find all courses associated with the student's active registered groups
    const courses = await Course.find({ groups: { $in: activeRegisteredGroupIds } }).select('_id name c_Id groups');
    const courseIds = courses.map(course => course._id);

    const workshops = await Workshop.aggregate([
      {
        $match: {
          courseId: { $in: courseIds }
        }
      },
      {
        $lookup: {
          from: 'courses',
          let: { courseId: '$courseId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$courseId'] }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                c_Id: 1,
                groups: 1
              }
            }
          ],
          as: 'courseDetails'
        }
      },
      {
        $unwind: '$courseDetails'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'teams.students',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1
              }
            }
          ],
          as: 'teamStudents'
        }
      },
      {
        $lookup: {
          from: 'groups',
          localField: 'courseDetails.groups',
          foreignField: '_id',
          as: 'groupDetails'
        }
      },
      {
        $unwind: '$groupDetails'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'groupDetails.teacherId',
          foreignField: '_id',
          as: 'teacherDetails'
        }
      },
      {
        $unwind: {
          path: '$teacherDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          'courseDetails.teacherName': '$teacherDetails.name',
          teams: {
            $map: {
              input: '$teams',
              as: 'team',
              in: {
                _id: '$$team._id',
                name: '$$team.name',
                students: {
                  $filter: {
                    input: '$teamStudents',
                    as: 'student',
                    cond: { $in: ['$$student._id', '$$team.students'] }
                  }
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          description: { $first: '$description' },
          term: { $first: '$term' },
          courseId: { $first: '$courseId' },
          groupId:{$first:"$groupId"},
          courseDetails: { $first: '$courseDetails' },
          teams: { $first: '$teams' },
          endDate:{$first:"$endDate"}
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          term: 1,
          courseId: 1,
          groupId:1,
          courseDetails: {
            _id: '$courseDetails._id',
            name: '$courseDetails.name',
            c_Id: '$courseDetails.c_Id',
            teacherName: '$courseDetails.teacherName'
          },
          teams: {
            _id: 1,
            name: 1,
            students: {
              _id: 1,
              name: 1
            }
          },
          endDate:1
        }
      }
    ]);

    res.json({ success: true, workshops });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};






const getAllWorkShopsToEnterGradesN = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { studentId } = req.params;

    // Fetch the student's registered groups
    const student = await User.findById(studentId).select('registeredInGroups');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const activeRegisteredGroupIds = student.registeredInGroups
      .filter(group => group.isActive)
      .map(group => mongoose.Types.ObjectId(group.groupId));

    // Find all courses associated with the student's active registered groups
    const courses = await Course.find({ groups: { $in: activeRegisteredGroupIds } }).select('_id name c_Id');
    if (!courses.length) {
      return res.json({ success: true, workshopsByCourse_Groups: [] });
    }

    const courseIds = courses.map(course => course._id);

    const workshops = await Workshop.aggregate([
      {
        $match: {
          courseId: { $in: courseIds }
        }
      },
      {
        $lookup: {
          from: 'courses',
          let: { courseId: '$courseId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$courseId'] }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                c_Id: 1
              }
            }
          ],
          as: 'courseDetails'
        }
      },
      {
        $unwind: '$courseDetails'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'teams.students',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1
              }
            }
          ],
          as: 'teamStudents'
        }
      },
      {
        $lookup: {
          from: 'groups',
          let: { groupId: '$groupId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$groupId'] }
              }
            },
            {
              $project: {
                _id: 1,
                g_Id: 1,
                teacherId: 1
              }
            }
          ],
          as: 'groupDetails'
        }
      },
      {
        $unwind: '$groupDetails'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'groupDetails.teacherId',
          foreignField: '_id',
          as: 'teacherDetails'
        }
      },
      {
        $unwind: {
          path: '$teacherDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          'courseDetails.teacherName': '$teacherDetails.name',
          'courseDetails.g_Id': '$groupDetails.g_Id',
          groupId: '$groupDetails._id',
          teams: {
            $map: {
              input: '$teams',
              as: 'team',
              in: {
                _id: '$$team._id',
                name: '$$team.name',
                students: {
                  $filter: {
                    input: '$teamStudents',
                    as: 'student',
                    cond: { $in: ['$$student._id', '$$team.students'] }
                  }
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: {
            courseId: '$courseId',
            groupId: '$groupId'
          },
          workshops: {
            $push: {
              _id: '$_id',
              name: '$name',
              description: '$description',
              term: '$term',
              teams: '$teams',
              endDate:'$endDate'
            }
          },
          courseDetails: { $first: '$courseDetails' }
        }
      },
      {
        $project: {
          _id: 0,
          courseId: '$_id.courseId',
          groupId: '$_id.groupId',
          courseDetails: {
            _id: '$courseDetails._id',
            name: '$courseDetails.name',
            c_Id: '$courseDetails.c_Id',
            teacherName: '$courseDetails.teacherName',
            g_Id: '$courseDetails.g_Id'
          },
          workshops: 1
        }
      }
    ]);

    const filterWorkshopsByStudent = (workshopsByCourse_Groups, studentId) => {
      //The main problem found in the development of this task is the inconsistency in the type of student ID. 
      //In the input data, the student ID is provided as a string, while in the internal data structures, it is stored as an ObjectId. 
      //This inconsistency leads to errors when comparing the provided student ID with the student IDs stored in the workshops
      
      // Convert studentId to ObjectId             
      // The equals metdhod fails!
      const studentObjectId = mongoose.Types.ObjectId(studentId);
    
      // console.log("Input workshopsByCourse_Groups:", workshopsByCourse_Groups);
       //console.log("Input studentId:", studentId);
    
      const filteredWorkshopsByCourse_Groups = workshopsByCourse_Groups.map(courseGroup => {
        const filteredWorkshops = courseGroup.workshops.map(workshop => {
          // console.log("Processing workshop:", workshop.name);
          const filteredTeams = workshop.teams.filter(team => {
            // console.log("Processing team:", team.name);
            // console.log("Team students:", team.students);
    
            const hasStudent = team.students.some(student => {
              // console.log("Student ID type:", typeof student._id);
              // console.log("Provided student ID type:", typeof studentId);
               //console.log("Comparing:", student._id, studentObjectId);
              return student._id.equals(studentObjectId);
            });
    
            // console.log("Team has student:", hasStudent);
            return hasStudent;
          });
    
          // console.log("Filtered teams for workshop:", filteredTeams);
    
          return {
            ...workshop,
            teams: filteredTeams
          };
        }).filter(workshop => workshop.teams.length > 0);
    
        // console.log("Filtered workshops for course group:", filteredWorkshops);
    
        return {
          ...courseGroup,
          workshops: filteredWorkshops
        };
      }).filter(courseGroup => courseGroup.workshops.length > 0);
    
      // console.log("Filtered result:", filteredWorkshopsByCourse_Groups);
    
      return filteredWorkshopsByCourse_Groups;
    };
    
    
    
    filteredWorkshops = filterWorkshopsByStudent(workshops, studentId);
   
    res.json({ workshopsByCourse_Groups: filteredWorkshops});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const self_Peer_GradesN = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { workshopId, teamId, peerStudentId, givenById, responses } = req.body;

  console.log("Validation questions:-", responses[0].questions[0], "Validation topic:-", responses[0].topic);

  try {
    const workshop = await Workshop.findOne({ _id: workshopId, 'teams._id': teamId });
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop or Team not found' });
    }

    const team = workshop.teams.id(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const peerStudentObjectId = mongoose.Types.ObjectId(peerStudentId);
    const givenByObjectId = mongoose.Types.ObjectId(givenById);
    console.log("workshop", workshop, "team:", team, "peerStudentObjectId", peerStudentObjectId, "givenByObjectId", givenByObjectId);

    if (!peerStudentObjectId || !givenByObjectId) {
      return res.status(400).json({ message: 'Invalid peerStudentId or givenById' });
    }

    let peerGrade = team.self_peer_Grades.find(grade => 
      grade.peerId.equals(peerStudentObjectId) && grade.givenBy.equals(givenByObjectId)
    );

    if (peerGrade) {
      if (peerGrade.hasSubmitted) {
        return res.status(400).json({ message: 'Grades have already been submitted for this peer' });
      }
      peerGrade.responses = responses.map(response => ({
        topic: response.topic,
        questions: response.questions.map(q => ({
          questionId: q.questionId,
          questionText: q.questionText,
          grade: q.grade
        }))
      }));
      peerGrade.hasSubmitted = true;
    } else {
      const newPeerGrade = {
        peerId: peerStudentObjectId,
        responses: responses.map(response => ({
          topic: response.topic,
          questions: response.questions.map(q => ({
            questionId: q.questionId,
            questionText: q.questionText,
            grade: parseInt(q.grade)
          }))
        })),
        hasSubmitted: true,
        givenBy: givenByObjectId
      };
      console.log("::::::::::newPeerGrade:::::::::::", newPeerGrade);
      team.self_peer_Grades.push(newPeerGrade);
    }

    await workshop.save();
    res.status(200).json({ message: 'Peer grades submitted successfully' });
  } catch (error) {
    console.error('Error submitting peer grades:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




//This approach ensures that the rubric data is either updated or created without duplication in the database.
//Explanation

    // Validation Check: The code first checks for any validation errors and responds with a 400 status code if any are found.
    // Payload Logging: It logs the received payload for debugging purposes.
    // Iteration Over Rubrics: The code iterates over each rubric in the received teacherRubric array.
    // Checking for Existing Rubrics: For each rubric, it checks if a rubric with the same topic already exists in the TeacherTopic collection.
    // Updating Existing Rubrics: If an existing rubric is found, it updates its questions field and saves the changes.
    // Creating New Rubrics: If no existing rubric is found, it creates a new rubric entry.
    // Response: The code responds with a 201 status code to indicate that the rubrics were loaded successfully.
    // Error Handling: Any errors encountered during the process are logged, and a 500 status code is sent in the response.
    

    
    const create_update_TeacherGradeGroup_rubricN = async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        try {
            const teacherRubric = req.body.teacherRubric;
            console.log('Received teacherRubric:', JSON.stringify(teacherRubric, null, 2));
    
            for (const rubric of teacherRubric) {
                const existingRubric = await TeacherTopic.findOne({ topic: rubric.topic });
    
                if (existingRubric) {
                    // Update the existing rubric
                    existingRubric.options = rubric.options;
                    await existingRubric.save();
                    console.log('Updated rubric:', existingRubric);
                } else {
                    // Check if a similar rubric already exists
                    const similarRubric = await TeacherTopic.findOne({ topic: { $regex: new RegExp(`^${rubric.topic}$`, 'i') } });
    
                    if (similarRubric) {
                        console.log(`A similar rubric for topic "${rubric.topic}" already exists.`);
                        continue; // Skip creating a new rubric
                    }
    
                    // Create a new rubric
                    const newRubric = new TeacherTopic({
                        topic: rubric.topic,
                        options: rubric.options
                    });
                    await newRubric.save();
                    console.log('Created new rubric:', newRubric);
                }
            }
    
            res.status(201).send('Teacher rubric loaded successfully');
        } catch (err) {
            console.error('Error:', err); // Log any errors
            res.status(500).send('Server error');
        }
    };
    
     
    
    
    
const create_update_SelfAssessmentGrade_rubricN = async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const studentRubric = req.body.studentRubric;
    //console.log('Payload:', JSON.stringify(studentRubric, null, 2)); // Log the payload

    for (const rubric of studentRubric) {
      const existingRubric = await StudentTopic.findOne({ topic: rubric.topic });

      if (existingRubric) {
        // Update the existing rubric
        existingRubric.questions = rubric.questions;
        await existingRubric.save();
      } else {
        // Create a new rubric
        await StudentTopic.create(rubric);
      }
    }

    res.status(201).send('Student rubric loaded successfully');
  } catch (err) {
    //console.error('Error:', err); // Log any errors
    res.status(500).send('Server error');
  }
};

const create_update_PeerGrade_rubricN = async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const peerRubric = req.body.peerRubric;
   // console.log('Payload:', JSON.stringify(peerRubric, null, 2)); // Log the payload

    for (const rubric of peerRubric) {
      const existingRubric = await PeerTopic.findOne({ topic: rubric.topic });

      if (existingRubric) {
        // Update the existing rubric
        existingRubric.questions = rubric.questions;
        await existingRubric.save();
      } else {
        // Create a new rubric
        await PeerTopic.create(rubric);
      }
    }

    res.status(201).send('Peer rubric loaded successfully');
  } catch (err) {
    console.error('Error:', err); // Log any errors
    res.status(500).send('Server error');
  }
};


const get_TeacherGroupGrade_rubricN = async (req, res) => {
  
   // Handle validation errors
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }

   // Get query parameters
   const limit = parseInt(req.query.limit) || 20;
   const skip = parseInt(req.query.skip) || 0;

   try {
     const teacherTopics = await TeacherTopic.aggregate([
       {
         $match: {}, // Adjust your match conditions if needed
       },
       {
         $project: {
           _id: 1,
           topic: 1,
           options: 1,
         },
       },
       {
         $skip: skip,
       },
       {
         $limit: limit,
       },
     ]);

     res.json(teacherTopics);
   } catch (err) {
     res.status(500).json({ error: err.message });
   }
 };

 const get_SelfAssessment_rubricN = async (req, res) => {
  
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Get query parameters
  const limit = parseInt(req.query.limit) || 20;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const studentTopics = await StudentTopic.aggregate([
      {
        $match: {}, // Adjust your match conditions if needed
      },
      {
        $project: {
          _id: 0,
          topic: 1,
          questions: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    res.json(studentTopics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const get_PeerGrade_rubricN = async (req, res) => {
  
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Get query parameters
  const limit = parseInt(req.query.limit) || 20;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const peerTopics = await PeerTopic.aggregate([
      {
        $match: {}, // Adjust your match conditions if needed
      },
      {
        $project: {
          _id: 0,
          topic: 1,
          questions: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    res.json(peerTopics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const enterTeacherGradeToTeamsN = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { workshopId, courseId, groupId, teamId, grades } = req.body;

  try {
    // Find the workshop
    const workshop = await Workshop.findOne({ _id: workshopId, courseId, groupId });
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Find the team within the workshop
    const team = workshop.teams.id(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.teacherHasSubmitted) {
      return res.status(400).json({ message: 'Teacher has already submitted grades for this team' });
    }

    // Update grades and set teacherHasSubmitted flag
    grades.forEach(newGrade => {
      const existingGradeIndex = team.teacherGrades.findIndex(grade => grade.topicId.toString() === newGrade.topicId && grade.optionId.toString() === newGrade.optionId);

      if (existingGradeIndex !== -1) {
        // Update existing grade
        team.teacherGrades[existingGradeIndex].topicId = newGrade.topicId;
        team.teacherGrades[existingGradeIndex].optionId = newGrade.optionId;
      } else {
        // Add new grade
        team.teacherGrades.push({
          topicId: newGrade.topicId,
          optionId: newGrade.optionId
        });
      }
    });

    // Set teacherHasSubmitted flag to true
    team.teacherHasSubmitted = true;
    await workshop.save();

    res.status(200).json({ message: 'Grades submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};




const getWorkShopsForCourseId_GroupIdN = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { courseId, groupId } = req.params;

    const workshops = await Workshop.aggregate([
      {
        $match: {
          courseId: mongoose.Types.ObjectId(courseId),
          groupId: mongoose.Types.ObjectId(groupId)
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          term: 1,
          teams: 1 ,// Project the entire teams array
          endDate:1
        }
      },
      {
        $addFields: {
          teamsInfo: {
            $map: {
              input: "$teams", // Reference the teams array directly
              as: "team",
              in: {
                teamsId: "$$team._id", // Extract team ID from each team document
                teamsName: "$$team.name", // Extract team name from each team document
                //teacherGrades: "$$team.teacherGrades" // Extract teacher grades from each team document
              }
            }
          }
        }
      },
      {
        // Optionally remove the original teams field if it's no longer needed
        $project: {
          teams: 0
        }
      }
    ]);

    res.json({ workshops });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getTeamGivenWorShopIdCourseIdGroupIdN = async (req, res) => {
  const { workshopId, courseId, groupId, teamId } = req.query;

  try {
      const workshop = await Workshop.findOne({ _id: workshopId, courseId, groupId });
      if (!workshop) {
          return res.status(404).json({ message: 'Workshop not found' });
      }
    
      const team = workshop.teams.id(teamId);
      if (!team) {
          return res.status(404).json({ message: 'Team not found' });
      }
     

      res.status(200).json({ grades: team.teacherGrades });
  } catch (error) {
      console.error('Error fetching grades:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

// Endpoint to update grades
const updateTeacherGradeToTeamsN = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { workshopId, courseId, groupId, teamId, grades } = req.body;

  try {
      const workshop = await Workshop.findOne({ _id: workshopId, courseId, groupId });
      if (!workshop) {
          return res.status(404).json({ message: 'Workshop not found' });
      }

      const team = workshop.teams.id(teamId);
      if (!team) {
          return res.status(404).json({ message: 'Team not found' });
      }

      team.teacherGrades = grades.map(newGrade => ({
          topicId: newGrade.topicId,
          optionId: newGrade.optionId
      }));

      await workshop.save();

      res.status(200).json({ message: 'Grades updated successfully' });
  } catch (error) {
      console.error('Error updating grades:', error);
      res.status(500).json({ message: 'Server error' });
  }
};


const getTotalTeamGradeGivenByTeacherN = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { workshopId, courseId, groupId } = req.body;

  try {
      const workshop = await Workshop.findOne({ _id: workshopId, courseId, groupId }).populate('teams.teacherGrades.topicId');
      if (!workshop) {
          return res.status(404).json({ message: 'Workshop not found' });
      }

      const result = workshop.teams.map(team => {
          const numberOfTopics = team.teacherGrades.length;
          if (numberOfTopics === 0) {
              return { teamId: team._id, teamName: team.name, totalGrade: 0 };
          }

          const totalGradesSum = team.teacherGrades.reduce((sum, grade) => {
              const topic = grade.topicId;
              if (!topic) return sum;

              const option = topic.options.id(grade.optionId);
              return sum + (option ? option.grade : 0);
          }, 0);

          const totalGrade = (5 / (numberOfTopics * 5)) * totalGradesSum;
          return { teamId: team._id, teamName: team.name, totalGrade };
      });

      res.status(200).json(result);
  } catch (error) {
      console.error('Error fetching total grades:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

const getStudentTotalGradeInWorkshopN = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { workshopId, teamId, peerId } = req.body;
  const a = 0.50, b = 0.25, c = 0.25;

  try {
    const workshop = await Workshop.findOne({ _id: workshopId }).populate('teams.teacherGrades.topicId');
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const team = workshop.teams.id(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Calculate TeamGrade
    const numberOfTopics = team.teacherGrades.length;
    const totalGradesSum = team.teacherGrades.reduce((sum, grade) => {
      const topic = grade.topicId;
      if (!topic) return sum;

      const option = topic.options.id(grade.optionId);
      return sum + (option ? option.grade : 0);
    }, 0);
    const teamGrade = (5 / (numberOfTopics * 5)) * totalGradesSum || 0;

    const teamGradeDetails = team.teacherGrades.map(grade => {
      const topic = grade.topicId;
      const option = topic.options.id(grade.optionId);
      return {
        topic: topic.topic,
        question: option.optionText,
        grade: option.grade
      };
    });

    // Calculate SelfAssessment
    const selfAssessment = team.self_peer_Grades.find(grade => grade.peerId.equals(peerId) && grade.givenBy.equals(peerId));
    let selfAssessmentGrade = 0;
    let selfAssessmentDetails = [];

    if (selfAssessment) {
      const numberOfSelfAssessmentTopics = selfAssessment.responses.length;
      const selfAssessmentSum = selfAssessment.responses.reduce((sum, response) => {
        return sum + response.questions.reduce((innerSum, question) => innerSum + question.grade, 0);
      }, 0);
      selfAssessmentGrade = (5 / (numberOfSelfAssessmentTopics * 15)) * selfAssessmentSum;

      selfAssessmentDetails = selfAssessment.responses.map(response => ({
        topic: response.topic,
        questions: response.questions.map(question => ({
          question: question.questionText,
          grade: question.grade
        }))
      }));
    }

    // Calculate PeerGrades
    const teamMembers = team.students;
    const peerAssessments = team.self_peer_Grades.filter(grade => grade.peerId.equals(peerId) && !grade.givenBy.equals(peerId));
    const numberOfPeers = teamMembers.length - 1;

    const peerGradesSum = teamMembers.reduce((sum, member) => {
      if (member.equals(peerId)) return sum;

      const peerAssessment = peerAssessments.find(grade => grade.givenBy.equals(member._id));
      if (!peerAssessment) {
        return sum; // Treat missing peer assessment as zero
      }

      const numberOfPeerTopics = peerAssessment.responses.length;
      const peerSum = peerAssessment.responses.reduce((innerSum, response) => {
        return innerSum + response.questions.reduce((questionSum, question) => questionSum + question.grade, 0);
      }, 0);

      return sum + (5 / (numberOfPeerTopics * 15)) * peerSum;
    }, 0);

    const peerGrades = peerGradesSum / numberOfPeers || 0;

    // Peer grades details
    const peerGradeDetails = {};
    team.self_peer_Grades.filter(grade => grade.peerId.equals(peerId) && !grade.givenBy.equals(peerId)).forEach(assessment => {
      assessment.responses.forEach(response => {
        if (!peerGradeDetails[response.topic]) {
          peerGradeDetails[response.topic] = {};
        }
        response.questions.forEach(question => {
          if (!peerGradeDetails[response.topic][question.questionText]) {
            peerGradeDetails[response.topic][question.questionText] = [];
          }
          peerGradeDetails[response.topic][question.questionText].push(question.grade);
        });
      });
    });

    const averagePeerGrades = Object.keys(peerGradeDetails).map(topic => {
      return {
        topic: topic,
        questions: Object.keys(peerGradeDetails[topic]).map(questionText => {
          const grades = peerGradeDetails[topic][questionText];
          const averageGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
          return {
            question: questionText,
            grade: averageGrade
          };
        })
      };
    });

    // Calculate final grade
    const totalGrade = (teamGrade * a) + (selfAssessmentGrade * b) + (peerGrades * c);

    // Send response with individual grades and total grade
    res.status(200).json({
      teamGrade,
      teamGradeDetails,
      selfAssessmentGrade,
      selfAssessmentDetails,
      peerGrades,
      averagePeerGrades,
      totalGrade,
    });
  } catch (error) {
    console.error('Error fetching student total grade:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSelfPeerEvaluationStatusN = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { workshopId, selectedTeam, userId } = req.query;

  try {
    const workshop = await Workshop.findById(workshopId).populate('teams.students', 'name');
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const team = workshop.teams.id(selectedTeam);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const peerStatus = team.students.map(student => {
      const selfPeerGrade = team.self_peer_Grades.find(grade => grade.peerId.equals(student._id) && grade.givenBy.equals(userId));
      return {
        peerId: student._id,
        peerName: student.name,
        hasSubmitted: selfPeerGrade ? selfPeerGrade.hasSubmitted : false
      };
    });

    res.json(peerStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//---------------------------Start --------------------------------
const getTotalWorkshopGradeForStudentsInGroupN = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { workshopId } = req.body;

  const a = 0.50, b = 0.25, c = 0.25;

  try {
    const workshop = await Workshop.findOne({ _id: workshopId }).populate('teams.teacherGrades.topicId');
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const workshopResults = await Promise.all(workshop.teams.map(async (team) => {
      const numberOfTopics = team.teacherGrades.length;
      const totalGradesSum = team.teacherGrades.reduce((sum, grade) => {
        const topic = grade.topicId;
        if (!topic) return sum;

        const option = topic.options.id(grade.optionId);
        return sum + (option ? option.grade : 0);
      }, 0);
      const teamGrade = numberOfTopics > 0 ? (5 / (numberOfTopics * 5)) * totalGradesSum : 0;

      const teamResults = await Promise.all(team.students.map(async (peerId) => {
        const selfAssessment = team.self_peer_Grades.find(grade => grade.peerId.equals(peerId) && grade.givenBy.equals(peerId));
        const selfAssessmentGrade = selfAssessment ? calculateSelfAssessmentGrade(selfAssessment) : 0;

        const peerGrades = calculatePeerGrades(peerId, team);

        const totalGrade = (teamGrade * a) + (selfAssessmentGrade * b) + (peerGrades * c);

        const user = await User.findById(peerId).select('name');
        if (!user) {
          return { peerId, error: 'User not found' };
        }

        const errors = [];
        if (teamGrade === 0) errors.push('Nota de profesor no asignada');
        if (selfAssessmentGrade === 0) errors.push('Autoevaluación no realizada');
        if (peerGrades === 0) errors.push('Coevaluación no realizada');

        return {
          peerId,
          userName: user.name,
          teamName: team.name,
          teamGrade: teamGrade !== 0 ? teamGrade : undefined,
          selfAssessmentGrade: selfAssessmentGrade !== 0 ? selfAssessmentGrade : undefined,
          peerGrades: peerGrades !== 0 ? peerGrades : undefined,
          totalGrade,
          errors: errors.length > 0 ? errors : undefined
        };
      }));

      return {
        teamName: team.name,
        teamResults
      };
    }));

    res.status(200).json({ workshopResults });
  } catch (error) {
    console.error('Error fetching workshop grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

function calculateSelfAssessmentGrade(selfAssessment) {
  const numberOfSelfAssessmentTopics = selfAssessment.responses.length;
  const selfAssessmentSum = selfAssessment.responses.reduce((sum, response) => {
    return sum + response.questions.reduce((innerSum, question) => innerSum + question.grade, 0);
  }, 0);
  return (5 / (numberOfSelfAssessmentTopics * 15)) * selfAssessmentSum;
}

function calculatePeerGrades(peerId, team) {
  const teamMembers = team.students;
  const peerAssessments = team.self_peer_Grades.filter(grade => grade.peerId.equals(peerId) && !grade.givenBy.equals(peerId));
  const numberOfPeers = teamMembers.length - 1;

  const peerGradesSum = teamMembers.reduce((sum, member) => {
    if (member.equals(peerId)) return sum;

    const peerAssessment = peerAssessments.find(grade => grade.givenBy.equals(member._id));
    if (!peerAssessment) {
      return sum;
    }

    const numberOfPeerTopics = peerAssessment.responses.length;
    const peerSum = peerAssessment.responses.reduce((innerSum, response) => {
      return innerSum + response.questions.reduce((questionSum, question) => questionSum + question.grade, 0);
    }, 0);

    return sum + (5 / (numberOfPeerTopics * 15)) * peerSum;
  }, 0);

  return numberOfPeers > 0 ? peerGradesSum / numberOfPeers : 0;
}
//---------------------------End --------------------------------

const setTeamNamesN = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { category, teamNames } = req.body;

  try {
    // Find the existing document or create a new one
    let teamNamesDoc = await TeamNames.findOne();
    if (!teamNamesDoc) {
      teamNamesDoc = new TeamNames();
      teamNamesDoc.categories = new Map();  // Initialize the categories map
    }

    // Ensure the categories property is a Map
    if (!(teamNamesDoc.categories instanceof Map)) {
      teamNamesDoc.categories = new Map();
    }

    // Update the specified category with the new team names
    teamNamesDoc.categories.set(category, teamNames);
    await teamNamesDoc.save();

    res.status(201).json({ teamNames: teamNamesDoc });
  } catch (error) {
    console.error('Error saving team names:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}


const getTeamNamesN = async (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ success: false, error: 'Category is required' });
  }

  try {
    // Fetch the team names from the database
    const teamNamesDoc = await TeamNames.findOne();
    if (!teamNamesDoc || !teamNamesDoc.categories.has(category)) {
      return res.status(404).json({ success: false, error: 'Team names not found for the given category' });
    }

    res.status(200).json({ data: teamNamesDoc.categories.get(category) });
  } catch (error) {
    console.error('Error fetching team names:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


const getcategoryNamesN = async (req, res) => {
  try {
    const teamNamesDoc = await TeamNames.findOne();
    if (!teamNamesDoc || !(teamNamesDoc.categories instanceof Map)) {
      return res.status(404).json({ success: false, error: 'No categories found' });
    }

    const categories = Array.from(teamNamesDoc.categories.keys());
    res.status(200).json({ data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTeamStudentNamesN = async (req, res) => {
   // Handle validation errors
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }
 
   const { workshopId } = req.params;
 
   try {
     // Fetch the workshop with the specified workshopId and populate student details
     const workshop = await Workshop.findById(workshopId)
       .populate('teams.students', 'name') // Populate the 'name' field from the User schema
       .exec();
 
     if (!workshop) {
       return res.status(404).json({ error: 'Workshop not found' });
     }
 
     // Extract student names for each team
     const teamsStudentNames = workshop.teams.map(team => ({
       teamName: team.name,
       students: team.students.map(student => student.name),
     }));

     // Respond with the teams and their student names
     res.status(200).json({teamsStudentNames});
   } catch (error) {
     console.error('Error fetching students:', error);
     res.status(500).json({ error: 'Internal server error' });
   }
 };




module.exports = {
  createWorkshopN,
  createTeamN, 
  joinTeamN,
  getWorkshopWithTeamsN,

  getWorkShopIdForACourseN,

  removeStudentFromTeamN,
  getAllWorkShopsNewN,
  getAllWorkShopsToEnterGradesN, 

  self_Peer_GradesN,

  create_update_TeacherGradeGroup_rubricN,
  create_update_SelfAssessmentGrade_rubricN,
  create_update_PeerGrade_rubricN,

  get_TeacherGroupGrade_rubricN,
  get_SelfAssessment_rubricN,
  get_PeerGrade_rubricN,

  enterTeacherGradeToTeamsN,

  getWorkShopsForCourseId_GroupIdN,
  updateTeacherGradeToTeamsN,

  getTeamGivenWorShopIdCourseIdGroupIdN,

  getTotalTeamGradeGivenByTeacherN,

  getStudentTotalGradeInWorkshopN,

  getSelfPeerEvaluationStatusN,

  getTotalWorkshopGradeForStudentsInGroupN,
  setTeamNamesN,
  getTeamNamesN,
  getcategoryNamesN,

  getTeamStudentNamesN

   
}