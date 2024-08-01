import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { selectTeacher } from '../../redux/slice/teachersSlice/teachersSlice';
import { selectCourse } from '../../redux/slice/coursesSlice/coursesSlice';
import { selectGroup } from '../../redux/slice/groupsSlice/groupsSlice';

import {
    selectTeachers,
    selectCoursesIdsByTeacher,
    selectGroupsIdsByTeacher,
    selectStudentsByTeacherCourseGroup_
} from '../../redux/slice/selectors';


const teacherIds = ["1", "2", "3", "4", "5", "6"];

function CourseGroupsSelector() {
    const dispatch = useDispatch();

    const [randomTeacherId, setRandomTeacherId] = useState(null);

    useEffect(() => {


        // Generate a random index within the array's length
        const randomIndex = Math.floor(Math.random() * teacherIds.length);

        // Use the random index to extract the random element
        const newRandomTeacherId = teacherIds[randomIndex];

        setRandomTeacherId(newRandomTeacherId);
    }, []); // The empty dependency array ensures this effect runs only once on component mount



    const teachers = useSelector(selectTeachers);

    function findTeacherNameById(data, id) {
        return data.find(teacher => teacher.id === id)?.name;
    }

    const teacherName = findTeacherNameById(teachers, randomTeacherId)

    console.log("Teacher name:", teacherName)

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedGroup, setSelectedGroup] = useState('');


    const courseIds = useSelector(selectCoursesIdsByTeacher)(randomTeacherId);
    const groupIds = useSelector(selectGroupsIdsByTeacher)(randomTeacherId, selectedCourse);
    const students = useSelector(selectStudentsByTeacherCourseGroup_)(
        randomTeacherId,
        selectedCourse,
        selectedGroup
    );



    const handleCourseChange = (e) => {
        const course = e.target.value;
        setSelectedCourse(course);
        setSelectedGroup('');
        dispatch(selectCourse({ course }))

    };

    const handleGroupChange = (e) => {
        const group = e.target.value;
        setSelectedGroup(group);

        dispatch(selectGroup({ group }))

    };



    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-auto p-4 text-sm">


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


            </div>
            <div>
                {groupIds && groupIds.length > 0 && (
                    students.map((student) => (

                        <li key={student.id} value={student.id}>
                            {student.id}
                        </li>
                    )))}
            </div>
        </>

    );
}

export default CourseGroupsSelector;
