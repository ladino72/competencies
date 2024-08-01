
import React, { useState } from 'react';
function CourseSelector({ courses, onSelect }) {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedGroupNumber, setSelectedGroupNumber] = useState(null);
    const [selectedInstructor, setSelectedInstructor] = useState('');

    const handleSelectCourse = (course) => {
        setSelectedCourse(course);
        setSelectedGroupNumber(null);
        setSelectedInstructor('');
        onSelect(course);
    };

    const handleSelectGroupNumber = (groupNumber, teacher) => {
        setSelectedGroupNumber(groupNumber);
        setSelectedInstructor(teacher);
        const selectedCourseWithGroup = {
            ...selectedCourse,
            groupNumber,
            instructor: teacher,
        };
        onSelect(selectedCourseWithGroup);
    };

    return (
        <div>
            <h2 className="text-lg font-semibold">Select a Course:</h2>
            <ul className="mt-2">
                {courses.map((course) => (
                    <li
                        key={course.id}
                        onClick={() => handleSelectCourse(course)}
                        className={`cursor-pointer p-2 ${selectedCourse === course ? 'bg-blue-200' : ''
                            }`}
                    >
                        <span className="font-semibold">{course.name}</span> -{' '}
                        {course.type === 'theory' ? 'Theory' : 'Laboratory'}
                    </li>
                ))}
            </ul>
            {selectedCourse && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold">Select a Group Number:</h3>
                    <ul className="mt-2">
                        {selectedCourse.groupNumbers.map((groupNumber, index) => (
                            <label
                                key={groupNumber}
                                className="block cursor-pointer p-2"
                            >
                                <input
                                    type="radio"
                                    value={groupNumber}
                                    checked={selectedGroupNumber === groupNumber}
                                    onChange={() =>
                                        handleSelectGroupNumber(
                                            groupNumber,
                                            selectedCourse.instructors[index]
                                        )
                                    }
                                />
                                <span className="ml-2">Group {groupNumber}</span>
                            </label>
                        ))}
                    </ul>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">Selected Instructor:</h3>
                        <input
                            type="text"
                            value={selectedInstructor}
                            className="border p-2"
                            readOnly
                        />
                    </div>
                </div>
            )}
        </div>
    );
}


export default CourseSelector;
