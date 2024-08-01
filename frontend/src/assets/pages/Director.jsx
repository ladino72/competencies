import React, { useState, useRef } from 'react'
import Statistics from "../components/Statistics"

import Checkbox from '../components/Checkbox'

import { useSelector, useDispatch } from 'react-redux'
import { inputGrades } from '../../redux/slice/listStudentsSlice'
import ActivityGrades from '../components/ActivityGrades'
import { FaEdit } from "react-icons/fa";

import CourseFilter from "../components/CourseFilter";
import GroupList from '../components/GroupList'
import TeacherCourses from '../components/TeacherCourses';


function Director() {





    const [selectedCourseInfo, setSelectedCourseInfo] = useState(null);

    const courses = [
        {
            id: 1,
            name: 'Mathematics',
            type: 'theory',
            groupNumbers: [101, 102, 103],
            instructors: ['Prof. Smith', 'Dr. Johnson', 'Dr. Brown'],
        },
        {
            id: 2,
            name: 'Physics',
            type: 'theory',
            groupNumbers: [201, 202, 504],
            instructors: ['Prof. Johnson', 'Luis Alejandro Ladino Gaspar', 'Luis Alejandro Ladino Gaspar'],
        },
        {
            id: 3,
            name: 'Chemistry Lab',
            type: 'lab',
            groupNumbers: [301, 302, 303, 304],
            instructors: ['Dr. Brown', 'Prof. Smith', 'Dr. Johnson', 'Prof. Davis'],
        },
        {
            id: 4,
            name: 'Biology Lab',
            type: 'lab',
            groupNumbers: [401, 402],
            instructors: ['Luis Alejandro Ladino Gaspar', 'Dr. Johnson'],
        },
    ];

    const handleCourseSelect = (courseInfo) => {
        setSelectedCourseInfo(courseInfo);
    };

    return (
        <>
            <div className="container mx-auto w-full">
                <Statistics />
            </div>

            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-semibold mb-4">Course Selection</h1>
                <CourseFilter courses={courses} onSelect={handleCourseSelect} />
                {selectedCourseInfo && (
                    <div className="mt-4">
                        <h2 className="text-lg font-semibold">Selected Course</h2>
                        <p>
                            <strong>Course:</strong> {selectedCourseInfo.name}
                        </p>
                        <p>
                            <strong>Type:</strong>{' '}
                            {selectedCourseInfo.type === 'theory' ? 'Theory' : 'Laboratory'}
                        </p>
                        <p>
                            <strong>Group Number:</strong> {selectedCourseInfo.groupNumber}
                        </p>
                        <p>
                            <strong>Instructor:</strong> {selectedCourseInfo.instructor}
                        </p>
                    </div>

                )}
            </div>

            <div>
                <hr className="w-64 h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
            </div>


            <div className="container mx-auto p-4">

                <GroupList courses={courses} />

            </div>
            <div>
                <hr className="w-64 h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
            </div>


            <div className="container mx-auto p-4">


                <TeacherCourses courses={courses} />

            </div>


        </>



    )
}



export default Director