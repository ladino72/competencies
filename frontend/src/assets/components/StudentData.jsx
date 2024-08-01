import React from 'react'
import { useState } from 'react'
import AlphabetButtons from "../components/AlphabetButtons"
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import HoverableMenu from './HoverableMenu'
import CourseSelector from './CourseSelector';


function StudentData() {

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
            groupNumbers: [201, 202],
            instructors: ['Prof. Johnson', 'Dr. Davis'],
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
            instructors: ['Dr. Davis', 'Dr. Johnson'],
        },
    ];

    const handleCourseSelect = (courseInfo) => {
        setSelectedCourseInfo(courseInfo);
    };



    const listStudents = useSelector((state) => state.ListStudents.studentList)

    const [clickedLetter1, setClickedLetter1] = useState("1");
    const [clickedLetter2, setClickedLetter2] = useState("1");
    const [content, setContent] = useState([])


    const listFullName = listStudents.map(ele => ele.name)

    function extractFullNames(arr, startingLetter) {
        return arr.filter((entry) => {
            const parts = entry.split(' ');
            const firstLastName = parts[parts.length - 2]; // Get the last word (first last name)

            return firstLastName.startsWith(startingLetter);
        });
    }


    const handleClick_1 = (letter) => {

        setClickedLetter1(letter);

        if (letter !== "1" & clickedLetter2 !== "1") {
            const startingLetter = clickedLetter2
            const result = extractFullNames(listFullName, startingLetter);
            const filterNamesByLastFirstName = result.filter((name) => name.charAt(0) === letter);
            setContent(filterNamesByLastFirstName)
            console.log("letter_1", letter, "letter_2", clickedLetter2)


        } else if (letter == "1" & clickedLetter2 !== "1") {
            const startingLetter = clickedLetter2 // falllando
            const result = extractFullNames(listFullName, startingLetter);
            setContent(result)
            console.log("letter_1", letter, "letter_2", clickedLetter2)
        } else if (letter !== "1") {

            const result = listFullName.filter((name) => name.charAt(0) === letter);
            setContent(result)
            console.log("letter_1", letter, "letter_2", clickedLetter2)

        } else if (letter == "1") {
            const fullNames = listFullName.filter((name) => name)
            setContent(fullNames)
            console.log("letter_1", letter, "letter_2", clickedLetter2, "0000")
        }
    }

    const handleClick_2 = (letter) => {
        setClickedLetter2(letter);

        if (letter !== "1" & clickedLetter1 == "1") {
            const startingLetter = letter
            const result = extractFullNames(listFullName, startingLetter);
            setContent(result)
            console.log("letter_1", clickedLetter1, "letter_2", letter)

        } else if (letter !== "1" & clickedLetter1 !== "1") {
            const filterNamesByFirstName = listFullName.filter((name) => name.charAt(0) === clickedLetter1);
            const startingLetter = letter
            const result = extractFullNames(filterNamesByFirstName, startingLetter);
            setContent(result)
            console.log("letter_1", clickedLetter1, "letter_2", letter)
        } else if (letter !== "1" & clickedLetter1 !== 1) {
            const startingLetter = letter
            const result = extractFullNames(listFullName, startingLetter);
            console.log(clickedLetter1, clickedLetter2)
            setContent(result)
        }
        else if (letter == "1" & clickedLetter1 !== "1") {
            const filterNamesByFirstName = listFullName.filter((name) => name.charAt(0) === clickedLetter1);
            setContent(filterNamesByFirstName)
        }
        else {
            const fullNames = listFullName.filter((name) => name)
            setContent(fullNames)
            console.log("letter_2", letter, "letter_1", clickedLetter1)
        }
    }




    return (
        <>
            <div className="container mx-auto w-full mt-5 z-10 ">
                <h1 className='text-blue-200 font-semibold'>Find Names by first name</h1>
                <AlphabetButtons onLetterClick={handleClick_1} />
                <h1 className='text-blue-200 font-semibold'>Find Names by first last name</h1>
                <AlphabetButtons onLetterClick={handleClick_2} />


                <div className=" mx-auto ">
                    <div className="mt-4">
                        <h1 className="text-xl font-semibold mb-2">List of Names</h1>
                        <ul className="list-disc pl-4">
                            {content.map((name, index) => (
                                <li key={index} className="mb-2">
                                    {name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex justify-center items-center mb-6">
                    <HoverableMenu />
                </div>

                <div className="flex flex-col items-center space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="group relative p-4 bg-gray-200 hover:bg-blue-200 transition duration-300 ease-in-out cursor-pointer"
                        >
                            <p className="text-lg font-semibold  group-hover:text-red-600   ">Item {index + 1}</p>
                            <p className="text-gray-600 group-hover:text-blue-600 transition duration-300 ease-in-out">
                                Hover to highlight
                            </p>
                        </div>
                    ))}
                </div>


                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-semibold mb-4">Course Selection</h1>
                    <CourseSelector courses={courses} onSelect={handleCourseSelect} />
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
            </div>
        </>
    )
}

export default StudentData