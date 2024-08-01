import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTeachers, selectCourses, selectGroups } from '../../redux/slice/selectors';


function TeacherSelectionComponent() {
    const teachers = useSelector(selectTeachers);
    const courses = useSelector(selectCourses);
    const groups = useSelector(selectGroups);

    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');


    const handleTeacherChange = (event) => {
        const teacherId = event.target.value;
        setSelectedTeacherId(teacherId);

        setSelectedCourseId(null); // Reset selected course when teacher changes
        setSelectedGroupId(null); // Reset selected group when teacher changes
    };

    const handleCourseChange = (event) => {
        const courseId = event.target.value;
        setSelectedCourseId(courseId);
        setSelectedGroupId(null);
    };

    const selectedTeacher = teachers.find((teacher) => teacher.id === parseInt(selectedTeacherId));
    {/*watch out: when you declare const teacherId = event.target.value; in JavaScript, the value of teacherId will always be a string. 
       This is because the event.target.value property, when used with HTML form elements like <select>, <input>, or <textarea>, always returns a string.
        So wheen you use as id a string there is no problem, but you are using id as integer*/}

    const selectedCourse = courses.find((course) => course.id === selectedCourseId);

    console.log("teachers", teachers)
    console.log("coursess", courses)
    console.log("groups", groups)
    console.log("SelectedTeacherID---------------------", typeof selectedTeacherId)

    return (
        <div>
            <h1>Teacher Selection</h1>
            <label htmlFor="teacherSelect">Select a Teacher:</label>
            <select id="teacherSelect" value={selectedTeacherId} onChange={handleTeacherChange}>
                <option value="">Select a Teacher</option>
                {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                    </option>
                ))}
            </select>

            {selectedTeacher && (
                <div>
                    <label htmlFor="courseSelect">Select a Course:</label>
                    <select id="courseSelect" value={selectedCourseId} onChange={handleCourseChange}>
                        <option value="">Select a Course</option>
                        {courses
                            .filter((course) => selectedTeacher.courses.includes(course.id))
                            .map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                    </select>
                </div>
            )}
            {selectedTeacher && selectedCourse && (
                <div>
                    <label htmlFor="groupSelect">Select a Group:</label>
                    <select id="groupSelect" value={selectedGroupId} onChange={(event) => setSelectedGroupId(event.target.value)}>
                        <option value="">Select a Group</option>
                        {groups
                            .filter((group) => selectedCourse.groups.includes(group.id))
                            .map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                    </select>
                </div>
            )}
        </div>
    );
}

export default TeacherSelectionComponent;
