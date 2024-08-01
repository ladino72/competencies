import { createSelector } from '@reduxjs/toolkit';

// Selectors for individual slices
export const selectTeachers = (state) => state.teachers.data;
export const selectCourses = (state) => state.courses.data;
export const selectGroups = (state) => state.groups.data;
export const selectStudents = (state) => state.students.data;

export const selectTeacher = (state) => state.teachers.selectedTeacher;
export const selectGroup = (state) => state.groups.selectedGroup;
export const selectCourse = (state) => state.courses.selectedCourse;
export const selectStudent = (state) => state.students.selectedStudent;


export const selectStudentsByTeacherCourseGroup_ = createSelector(
    [selectTeachers, selectCourses, selectGroups, selectStudents],
    (teachers, courses, groups, students) => (selectedTeacherId, selectedCourseId, selectedGroupId) => {
        const teacher = teachers.find((t) => t.id === selectedTeacherId);
        if (!teacher) {
            return [];
        }

        const courseGroups = teacher.course_groups.find((group) => group[selectedCourseId]);
        if (!courseGroups) {
            return [];
        }

        const groupData = courseGroups[selectedCourseId];
        if (!groupData || !groupData.includes(selectedGroupId)) {
            return [];
        }

        const filteredStudents = students.filter((student) =>
            groups[selectedGroupId].students.includes(student.id)
        );

        return filteredStudents;
    }
);


export const selectCoursesAndGroupsByTeacher = createSelector(
    [selectTeachers, selectCourses, selectGroups],
    (teachers, courses, groups) => (selectedTeacherId) => {
        const teacher = teachers.find((t) => t.id === selectedTeacherId);
        if (!teacher) {
            return { selectedCourse: '', selectedGroup: '' };
        }

        const courseGroups = teacher.course_groups;

        // Set initial values for selectedCourse and selectedGroup
        let selectedCourse = '';
        let selectedGroup = '';

        // Iterate through courseGroups to find the selected course and group
        for (const courseGroup of courseGroups) {
            const courseIds = Object.keys(courseGroup);

            // If there's at least one course, set selectedCourse and selectedGroup
            if (courseIds.length > 0) {
                selectedCourse = courseIds[0]; // Select the first course
                selectedGroup = courseGroup[selectedCourse][0]; // Select the first group of the first course
                break;
            }
        }

        return { selectedCourse, selectedGroup };
    }
);


export const selectStudentsByTeacherCourseGroup = (teacherId, courseId, groupId) =>
    createSelector(
        [selectTeachers, selectCourses, selectGroups, selectStudents],
        (teachers, courses, groups, students) => {
            const teacher = teachers.find((t) => t.id === teacherId);
            if (!teacher) return [];

            const course = courses.find((c) => c.id === courseId);
            if (!course) return [];

            const group = groups.find((g) => g.id === groupId);
            if (!group) return [];

            const studentIds = group.students;

            // Filter student IDs by the course that the teacher is associated with
            const studentsForTeacherCourse = studentIds.filter((studentId) => {
                return teacher.courses.includes(course.id);
            });

            // Retrieve and return student details based on the student IDs
            const studentsDetails = studentsForTeacherCourse.map((studentId) => {
                const student = students.find((s) => s.id === studentId);
                return student;
            });

            return studentsDetails;
        }
    );

export const selectCoursesByTeacher = createSelector(
    [selectTeachers, selectCourses],
    (teachers, courses) => (selectedTeacherId) => {
        const teacher = teachers.find((t) => t.id === selectedTeacherId);
        if (!teacher) {
            return [];
        }

        const courseGroups = teacher.course_groups;

        const courseIds = courseGroups.flatMap((group) => Object.keys(group));

        const filteredCourses = courses.filter((course) => courseIds.includes(course.id));

        return filteredCourses;
    }
);



export const selectCoursesIdsByTeacher = createSelector(
    [selectTeachers],
    (teachers) => (selectedTeacherId) => {
        const teacher = teachers.find((t) => t.id === selectedTeacherId);
        if (!teacher) {
            return [];
        }

        const courseGroups = teacher.course_groups;
        const courseIds = courseGroups.flatMap((group) => Object.keys(group));
        //const filteredCourses = courses.filter((course) => courseIds.includes(course.id));
        //return filteredCourses;
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA:courseIds", courseIds, typeof (courseIds))
        return courseIds;

    }
);


