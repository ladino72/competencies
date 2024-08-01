import { createSelector } from '@reduxjs/toolkit';

// Selectors for individual slices
export const selectTeachers = (state) => state.teachers.data;
export const selectCourses = (state) => state.courses.data;
export const selectGroups = (state) => state.groups.data;
export const selectStudents = (state) => state.students.data;


export const selectCoursesIdsByTeacher = createSelector(
    [selectTeachers],
    (teachers) => (selectedTeacherId) => {
        const teacher = teachers.find((t) => t.id === selectedTeacherId);
        if (!teacher) {
            return [];
        }

        const courseGroups = teacher.course_groups;
        const courseIds = courseGroups.flatMap((group) => Object.keys(group));
        return courseIds; // Directly return the array of course IDs
    }
);

export const selectGroupsIdsByTeacher = createSelector(
    [selectTeachers],
    (teachers) => (selectedTeacherId, selectedCourseId) => {
        const teacher = teachers.find((t) => t.id === selectedTeacherId);
        if (!teacher) {
            return [];
        }

        const courseGroups = teacher.course_groups;
        //console.log("CCCCCCCCCCCCCCCCCC", courseGroups)

        // Find the object in the array with the matching key
        const courseGroup = courseGroups.find((group) => group[selectedCourseId]);

        // Extract the values (group IDs) associated with the selected course ID
        const groupIds = courseGroup ? courseGroup[selectedCourseId] : [];

        console.log("GGGGGGGGGGGGGGG--->groupIds", groupIds)


        return groupIds;
    }
);

export const selectStudentsByTeacherCourseGroup_ = createSelector(
    [selectTeachers, selectCourses, selectGroups, selectStudents],
    (teachers, courses, groups, students) => (selectedTeacherId, selectedCourseId, selectedGroupId) => {
        const teacher = teachers.find((t) => t.id === selectedTeacherId);
        if (!teacher) {
            return [];
        }

        // Find the group data corresponding to the selected course and group ID
        const courseGroups = teacher.course_groups.find((group) => group[selectedCourseId]);
        if (!courseGroups) {
            return [];
        }

        const groupData = courseGroups[selectedCourseId];
        if (!groupData || !groupData.includes(selectedGroupId)) {
            return [];
        }

        // Assuming that your groups data structure is an array of objects
        const group = groups.find((group) => group.id === selectedGroupId);
        if (!group) {
            return [];
        }

        // Assuming that the group object contains a 'students' property
        const studentIds = group.students;

        // Map student IDs to student objects with names and ages
        const studentsWithInfo = studentIds.map((studentId) => {
            const student = students.find((student) => student.id === studentId);
            return {
                id: studentId,
                name: student.name,
                age: student.age,
            };
        });
        //console.log("=======studentsWithInfo===============", studentsWithInfo)

        return studentsWithInfo;
    }
);

