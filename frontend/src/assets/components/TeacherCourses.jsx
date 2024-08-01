import React, { useState } from 'react';

function TeacherCourses({ courses }) {
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [filteredCourses, setFilteredCourses] = useState([]);

    const handleSelectTeacher = (teacher) => {
        setSelectedTeacher(teacher);
        setFilteredCourses(
            courses
                .filter((course) => course.instructors.includes(teacher))
                .map((course) => ({
                    ...course,
                    groupNumbers: course.groupNumbers.filter(
                        (_, index) => course.instructors[index] === teacher
                    ),
                }))
        );
    };

    return (
        <div>
            <h2 className="text-lg font-semibold">Select a Teacher:</h2>
            <select
                className="mt-2 p-2 border"
                value={selectedTeacher}
                onChange={(e) => handleSelectTeacher(e.target.value)}
            >
                <option value="">Select a Teacher</option>
                {courses
                    .reduce(
                        (instructors, course) =>
                            instructors.concat(course.instructors),
                        []
                    )
                    .filter((teacher, index, self) => self.indexOf(teacher) === index)
                    .map((teacher) => (
                        <option key={teacher} value={teacher}>
                            {teacher}
                        </option>
                    ))}
            </select>
            {selectedTeacher && (
                <>
                    <h3 className="text-lg font-semibold mt-4">
                        Courses taught by {selectedTeacher}:
                    </h3>
                    <ul className="mt-2">
                        {filteredCourses.map((course) => (
                            <li key={course.id}>
                                <strong>{course.name}</strong>
                                <ul className="list-disc pl-4">
                                    {course.groupNumbers.map((groupNumber) => (
                                        <li key={groupNumber}>
                                            Group {groupNumber}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default TeacherCourses;
