import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { selectTeacher } from '../../redux/slice/teachersSlice/teachersSlice';
import { selectCourse } from '../../redux/slice/coursesSlice/coursesSlice';
import { selectGroup } from '../../redux/slice/groupsSlice/groupsSlice';
import { selectStudent } from '../../redux/slice/studentsSlice/studentsSlice';


import {
    selectTeachers,
    selectCoursesIdsByTeacher,
    selectGroupsIdsByTeacher,
    selectStudentsByTeacherCourseGroup_
} from '../../redux/slice/selectors';

function TeacherStudentSelector() {
    const dispatch = useDispatch();

    const teachers = useSelector(selectTeachers);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    const courseIds = useSelector(selectCoursesIdsByTeacher)(selectedTeacher);
    const groupIds = useSelector(selectGroupsIdsByTeacher)(selectedTeacher, selectedCourse);
    const students = useSelector(selectStudentsByTeacherCourseGroup_)(
        selectedTeacher,
        selectedCourse,
        selectedGroup
    );

    const handleTeacherChange = (e) => {
        const teacherId = e.target.value;
        setSelectedTeacher(teacherId);
        setSelectedCourse("");
        setSelectedGroup('');
        setSelectedStudent(null);
        dispatch(selectTeacher({ teacherId })) // TeacherId is saved in the App store

    };

    const handleCourseChange = (e) => {
        const course = e.target.value;
        setSelectedCourse(course);
        setSelectedGroup('');
        setSelectedStudent(null);
        dispatch(selectCourse({ course }))

    };

    const handleGroupChange = (e) => {
        const group = e.target.value;
        setSelectedGroup(group);
        setSelectedStudent(null);
        dispatch(selectGroup({ group }))

    };

    const handleStudentChange = (e) => {
        const studentId = e.target.value;
        const selected = students.find((student) => student.id === studentId);
        setSelectedStudent(selected);
        dispatch(selectStudent({ studentId }))

    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-auto p-4 text-sm">
                <div>
                    <label htmlFor="teacherSelect" className="block mb-2">
                        Select a Teacher:
                    </label>
                    <select
                        id="teacherSelect"
                        value={selectedTeacher}
                        onChange={handleTeacherChange}
                        className="w-full border rounded p-2 text-sm"
                    >
                        <option value="">Teacher</option>
                        {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.name}
                            </option>
                        ))}
                    </select>
                </div>

                {courseIds && courseIds.length > 0 && (
                    <div>
                        <label htmlFor="courseSelect" className="block mb-2">
                            Select a Course:
                        </label>
                        <select
                            id="courseSelect"
                            value={selectedCourse}
                            onChange={handleCourseChange}
                            className="w-full border rounded p-2 text-sm"
                        >
                            <option value="">Course</option>
                            {courseIds.map((courseId) => (
                                <option key={courseId} value={courseId}>
                                    {courseId}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {groupIds && groupIds.length > 0 && (
                    <div>
                        <label htmlFor="groupSelect" className="block mb-2">
                            Select a Group:
                        </label>
                        <select
                            id="groupSelect"
                            value={selectedGroup}
                            onChange={handleGroupChange}
                            className="w-full border rounded p-2 text-sm"
                        >
                            <option value="">Group</option>
                            {groupIds.map((groupId) => (
                                <option key={groupId} value={groupId}>
                                    {groupId}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {students && students.length > 0 && (
                    <div>
                        <label htmlFor="studentSelect" className="block mb-2">
                            Select a Student:
                        </label>
                        <select
                            id="studentSelect"
                            value={selectedStudent ? selectedStudent.id : ''}
                            onChange={handleStudentChange}
                            className="w-full border rounded p-2 text-sm"
                        >
                            <option value="">Student</option>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            <div>
                {/* Display the selected student's information */}
                {selectedStudent && (
                    <div className="mb-4 flex-1">
                        <h2 className="text-xl font-semibold">Selected Student:</h2>
                        <p>Name: {selectedStudent.name}</p>
                        <p>Age: {selectedStudent.age}</p>
                    </div>
                )}
            </div>
        </>

    );
}

export default TeacherStudentSelector;
