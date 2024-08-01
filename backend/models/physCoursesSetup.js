const PhysCoursesModel = require('./PhysCoursesModel');

const setupPhysCourses = async () => {
    try {
        const existingPhysCourses = await PhysCoursesModel.findOne({ identifier: 'physCourses' });

        if (!existingPhysCourses) {
            // If no document exists, create one with initial data or an empty array of courses
            const initialPhysCourses = {
                identifier: 'physCourses',
                courses: [], // You can initialize it with an empty array or add initial course objects here
            };

            const createdPhysCourses = await PhysCoursesModel.create(initialPhysCourses);
            console.log('Created physCourses document:', createdPhysCourses);
        } else {
            // Document already exists, you can perform updates if needed
            console.log('PhysCourses document already exists:', existingPhysCourses);
        }
    } catch (error) {
        console.error('Error setting up physCourses:', error);
    }
};

module.exports = setupPhysCourses;


