
const asyncHandler = require('express-async-handler')
const PhysCoursesModel = require('../models/PhysCoursesModel')

const { validationResult} = require('express-validator');


const mongoose = require('mongoose');

// @route   GET /admin
// @desc    Get Basic courses (Just one document)
// @access  Public
const getBaseCourses = asyncHandler(async (req, res) => {
    try {
        const phys = await PhysCoursesModel.findOne({ identifier: 'physCourses' });

        if (!phys) {
            return res.status(404).json({ msg: 'PhysCourses document not found' });
        }

        res.json(phys);
    } catch (error) {
        console.error('Error fetching physCourses:', error);
        res.status(500).send('Server Error');
    }
});


// @desc Create Basic courses ( No repeated course is created, identified by c_Id)
// @route POST /admin
// @access Private
const createBaseCourses = asyncHandler(async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, c_Id, coordinatorId } = req.body;

        const course = {
            name,
            c_Id,
            coordinatorId,
            // Add other fields if needed based on the schema
        };

        const phys = await PhysCoursesModel.findOne({ identifier: 'physCourses' });

        if (!phys) {
            return res.status(404).json({ msg: 'PhysCourses document not found' });
        }

        // Check if a course with the same c_Id already exists
        const existingCourse = phys.courses.find(existing => existing.c_Id === c_Id);
        if (existingCourse) {
            return res.status(400).json({ msg: 'Course with the same c_Id already exists' });
        }

        // Add the course to the phys
        phys.courses.push(course);
        await phys.save();

        res.json(phys);
    } catch (error) {
        console.error('Error adding course to physCourses:', error);
        res.status(500).send('Server Error');
    }
});

// @desc Delete Basic course given the course Id
// @route DELETE /admin
// @access Private
const  deleteBaseCourse = asyncHandler(async (req, res) => {
    try {
        const phys = await PhysCoursesModel.findOne({ identifier: 'physCourses' });

        if (!phys) {
            return res.status(404).json({ msg: 'PhysCourses document not found' });
        }

        const { courseId } = req.params;

        // Check if the course exists in the phys
        const courseIndex = phys.courses.findIndex(course => course._id.toString() === courseId);

        if (courseIndex === -1) {
            return res.status(404).json({ msg: 'Course not found in physCourses' });
        }

        // Remove the course without triggering validation
        phys.courses.splice(courseIndex, 1);
        await PhysCoursesModel.updateOne({ identifier: 'physCourses' }, { $set: { courses: phys.courses } });

        res.json({ msg: 'Course deleted from physCourses' });
    } catch (error) {
        console.error('Error deleting course from physCourses:', error);
        res.status(500).send('Server Error');
    }
});

// @desc Update One Basic course given the course Id
// @route Update/admin
// @access Private
const  updateBaseCourse = asyncHandler(async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, c_Id, coordinatorId } = req.body;
        const { courseId } = req.params;

        const updatedCourse = {
            name,
            c_Id,
            coordinatorId,
            // Add other fields if needed based on the schema
        };

        const phys = await PhysCoursesModel.findOne({ identifier: 'physCourses' });

        if (!phys) {
            return res.status(404).json({ msg: 'PhysCourses document not found' });
        }

        const courseIndex = phys.courses.findIndex(course => course._id.toString() === courseId);
        if (courseIndex === -1) {
            return res.status(404).json({ msg: 'Course not found in physCourses' });
        }

        // Update the course
        phys.courses[courseIndex] = updatedCourse;
        await phys.save();

        res.json(phys);
    } catch (error) {
        console.error('Error updating course in physCourses:', error);
        res.status(500).send('Server Error');
    }
});

// @desc Update All Basic Courses. It add many courses. It accepts courses=[{'name':"Fisica mecáncia", 'c_Id:"FIME",'coordinatorId':"57363h675h3hsgg5g"},{}...]
// @route PUT/admin
// @access Private
const  updateAllBaseCourses = asyncHandler(async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { courses } = req.body;

        const phys = await PhysCoursesModel.findOne({ identifier: 'physCourses' });

        if (!phys) {
            return res.status(404).json({ msg: 'PhysCourses document not found' });
        }

        const existingIds = phys.courses.map(course => course.c_Id);

        for (const newCourse of courses) {
            if (existingIds.includes(newCourse.c_Id)) {
                return res.status(400).json({ msg: `Course with ID ${newCourse.c_Id} already exists` });
            }
        }

        phys.courses.push(...courses);

        await phys.save();

        res.json(phys);
    } catch (error) {
        console.error('Error adding courses to physCourses', error);
        res.status(500).send('Server Error');
    }
});

module.exports = {
    getBaseCourses,
    createBaseCourses,
    deleteBaseCourse,
    updateBaseCourse,
    updateAllBaseCourses

}