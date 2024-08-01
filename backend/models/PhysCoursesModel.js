const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    c_Id: {
        type: String,
        required: true,
    },
    // Other fields specific to each course object if needed
});

const PhysCoursesSchema = new mongoose.Schema({
    identifier: {
        type: String,
        default: 'physCourses',          //here physCourses may be changed to another one, for example physCourses
        unique: true,
    },
    courses: [CourseSchema], // Array of course objects
});

const PhysCoursesModel = mongoose.model('PhysCourses', PhysCoursesSchema);

module.exports = PhysCoursesModel;

