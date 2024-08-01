import React from 'react';

function GroupList({ courses }) {
    return (
        <div>
            <h2 className="text-lg font-semibold">Course Group Numbers and Instructors:</h2>
            <ul className="mt-2">
                {courses.map((course) => (
                    <li key={course.id} className="mb-4">
                        <h3 className="text-lg font-semibold">{course.name}</h3>
                        <ul className="list-disc pl-4">
                            {course.groupNumbers.map((groupNumber, index) => (
                                <li key={groupNumber}>
                                    <strong>Group {groupNumber}:</strong> {course.instructors[index]}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default GroupList;
