import React, { useState } from 'react';

function CourseFilter({ courses, onSelect }) {
    const [selectedInstructor, setSelectedInstructor] = useState('');
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedGroupNumber, setSelectedGroupNumber] = useState(null);

    const handleSelectInstructor = (instructor) => {
        setSelectedInstructor(instructor);
        setFilteredCourses(
            courses
                .filter((course) => course.instructors.includes(instructor))
                .map((course) => ({
                    ...course,
                    groupNumbers: course.groupNumbers.filter(
                        (groupNumber) =>
                            course.instructors[
                            course.groupNumbers.indexOf(groupNumber)
                            ] === instructor
                    ),
                }))
        );
        setSelectedCourse(null);
        setSelectedGroupNumber(null);
    };

    const handleSelectCourse = (course) => {
        const selectedCourseWithInstructor = {
            ...course,
            instructor: selectedInstructor, // Include the instructor's name
        };
        setSelectedCourse(selectedCourseWithInstructor);
        setSelectedGroupNumber(null);
        onSelect(selectedCourseWithInstructor);
    };

    const handleSelectGroupNumber = (groupNumber) => {
        setSelectedGroupNumber(groupNumber);
        const selectedCourseWithGroup = {
            ...selectedCourse,
            groupNumber,
        };
        onSelect(selectedCourseWithGroup);
    };

    return (
        <div>
            <h2 className="text-lg font-semibold">Select an Instructor:</h2>
            <select
                className="mt-2 p-2 border"
                value={selectedInstructor}
                onChange={(e) => handleSelectInstructor(e.target.value)}
            >
                <option value="">Select an Instructor</option>
                {courses
                    .reduce(
                        (instructors, course) =>
                            instructors.concat(course.instructors),
                        []
                    )
                    .filter((instructor, index, self) => self.indexOf(instructor) === index)
                    .map((instructor) => (
                        <option key={instructor} value={instructor}>
                            {instructor}
                        </option>
                    ))}
            </select>
            {selectedInstructor && (
                <>
                    <h3 className="text-lg font-semibold mt-4">
                        Courses taught by {selectedInstructor}:
                    </h3>
                    <ul className="mt-2">
                        {filteredCourses.map((course) => (
                            <li
                                key={course.id}
                                onClick={() => handleSelectCourse(course)}
                                className={`cursor-pointer p-2 ${selectedCourse === course ? 'bg-blue-200' : ''
                                    }`}
                            >
                                {course.name} - {course.type === 'theory' ? 'Theory' : 'Laboratory'}
                            </li>
                        ))}
                    </ul>
                    {selectedCourse && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold">
                                Select a Group Number for {selectedCourse.name}:
                            </h3>
                            <ul className="mt-2">
                                {selectedCourse.groupNumbers.map((groupNumber) => (
                                    <label
                                        key={groupNumber}
                                        className="block cursor-pointer p-2"
                                    >
                                        <input
                                            type="radio"
                                            value={groupNumber}
                                            checked={selectedGroupNumber === groupNumber}
                                            onChange={() => handleSelectGroupNumber(groupNumber)}
                                        />
                                        <span className="ml-2">Group {groupNumber}</span>
                                    </label>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default CourseFilter;
