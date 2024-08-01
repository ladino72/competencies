import React, { useState, useEffect } from 'react';
//import SearchForm from "../StudentGrades/SearchForm"
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from "../../../../utils/AxiosInterceptos/interceptors"
import { useSelector } from 'react-redux';
import BarChartAvgs from "./BarChartAvgs"


const StudentGrades = () => {
    const [students, setStudents] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null); // Track selected user
    const [token] = useState(localStorage.getItem('token'));

    const user = useSelector((state) => state.user.user);


    // const [errorMessage, setErrorMessage] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [studentGrades, setStudentGrades] = useState([]);
    const [studentGradesList, setStudentGradesList] = useState([]);
    const navigate = useNavigate();

    const handleStudentGrades = async () => {
        try {
            if (!user) {
                toast.error('Please select a user to fetch.');
                return;
            }

            console.log("Selected student Id><><><<<<", user.id)

            const response = await api.get(`http://localhost:3500/grades/studentGradesForStudents/studentId/${user.id}`,
                {

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const { InfoBarChart, studentScores } = response.data

            console.log('Response', response.data);
            //console.log('Student response:studentScores', response.data.studentScores);

            setStudentGrades(InfoBarChart);
            setStudentGradesList(studentScores);
            toast.success('User fetched successfully.');
            setIsButtonDisabled(true); // Disable the button after deletion
            //setSelectedUserId(null); // Reset selected user

        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Handle different 404 errors based on the response message
                const errorMessage = error.response.data?.message || "Not Found"; // Access error message from response (if available)
                switch (errorMessage) {
                    case "No activities found for this student":

                        toast.error(errorMessage);
                        setStudentGrades([])
                        break;
                    case "Resource not found": // Example for another 404 error message

                        toast.error(errorMessage);
                        break;
                    default:
                        // Handle generic 404 for unexpected messages

                        toast.error(errorMessage);
                }
            } else {
                // Handle other errors (non-404)

                toast.error(errorMessage);
            }
        }

    };

    useEffect(() => {

        handleStudentGrades()
    }, [user]);




    if (studentGrades) {
        console.log("studentGrades:::", studentGrades)


    }
    if (studentGradesList) {

        console.log("studentGradesList", studentGradesList)

    }

    function extractGroupNumber(str) {
        // Regular expression to match digits at the end of the string
        const regex = /\d+$/;

        // Extract the match (the digits) or return an empty string if no match
        const match = str.match(regex);
        return match ? match[0] : "";
    }

    const fakeN1 = [1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2]
    const fakeN2 = [...fakeN1]
    return (
        <div className="container mx-auto  flex flex-col justify-center items-center">

            <div >Bienvenido: <span className='hover:bg-yellow-100 font-poppins text-large tracking-wide text-teal-600 font-semibold '> {user.name}</span></div>

            {/*  */}
            <div className=" md:w-auto px-4 flex flex-col md:flex-row ">
                {studentGrades.map((courseData, index) => (
                    <div key={index} className="mb-1  md:w-full">
                        {/* Display course information here */}
                        <div className="flex justify-center space-x-2 font-roboto">
                            <span className="">{courseData.courseName}</span>
                            <span className="">Grupo: {extractGroupNumber(courseData.group)}</span>
                        </div>
                        <div className="grid sm:px-2 sm:grid-cols-1  md:grid-cols-5 gap-4  lg:grid-cols-5 my-6 ">
                            <div className=' bg-blue-100 px-2'>
                                <div className='font-semibold'>CLF</div>
                                {studentGradesList[index].competencies.CLF.scores.map((item, itemIndex) => (
                                    <div className=''>
                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex'>T{item.term}, N1:</div>
                                            {item.scoresN1.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1  rounded-sm bg-gray-50 text-sm mx-1">
                                                    <span className=''>  {score === null ? '-' : score}</span>
                                                </div>
                                            )
                                            )}
                                        </div>

                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex '>T{item.term}, N2:</div>
                                            {item.scoresN2.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1  rounded-sm bg-gray-50 text-sm mx-1">
                                                    {score === null ? '-' : score}
                                                </div>
                                            )
                                            )}
                                        </div>

                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex'>T{item.term}, N3:</div>
                                            {item.scoresN3.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1 rounded-sm bg-gray-50 text-sm mx-1">
                                                    {score === null ? '-' : score}
                                                </div>
                                            )
                                            )}
                                        </div>


                                    </div>


                                ))}
                            </div>


                            <div className=' bg-blue-100 px-2'>

                                <div className='font-semibold'>PRC</div>
                                {studentGradesList[index].competencies.PRC.scores.map((item, itemIndex) => (
                                    <div className=' '>
                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex'>T{item.term}, N1:</div>
                                            {item.scoresN1.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1  rounded-sm bg-gray-50 text-sm mx-1">
                                                    {score === null ? '-' : score}
                                                </div>
                                            )
                                            )}
                                        </div>

                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex'>T{item.term}, N2:</div>
                                            {item.scoresN2.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1  rounded-sm bg-gray-50 text-sm mx-1">
                                                    {score === null ? '-' : score}
                                                </div>
                                            )
                                            )}
                                        </div>

                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex'>T{item.term}, N3:</div>
                                            {item.scoresN3.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1  rounded-sm bg-gray-50 text-sm mx-1">
                                                    {score === null ? '-' : score}
                                                </div>
                                            )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className=' bg-blue-100 px-2'>
                                <div className='font-semibold'>UCM</div>
                                {studentGradesList[index].competencies.UCM.scores.map((item, itemIndex) => (
                                    <div className=' '>
                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex'>T{item.term}, N1:</div>
                                            {item.scoresN1.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1  rounded-sm bg-gray-50 text-sm mx-1">
                                                    {score === null ? '-' : score}
                                                </div>
                                            )
                                            )}
                                        </div>

                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex'>T{item.term}, N2:</div>
                                            {item.scoresN2.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1  rounded-sm bg-gray-50 text-sm mx-1">
                                                    {score === null ? '-' : score}
                                                </div>
                                            )
                                            )}
                                        </div>

                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex'>T{item.term}, N3:</div>
                                            {item.scoresN3.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1  rounded-sm bg-gray-50 text-sm mx-1">
                                                    {score === null ? '-' : score}
                                                </div>
                                            )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className=' bg-blue-100 px-2'>
                                <div className='font-semibold'>ULC</div>
                                {studentGradesList[index].competencies.ULC.scores.map((item, itemIndex) => (
                                    <div className=' '>
                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex'>T{item.term}, N1:</div>
                                            {item.scoresN1.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1  rounded-sm bg-gray-50 text-sm mx-1">
                                                    {score === null ? '-' : score}
                                                </div>
                                            )
                                            )}
                                        </div>

                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex'>T{item.term}, N2:</div>
                                            {item.scoresN2.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1  rounded-sm bg-gray-50 text-sm mx-1">
                                                    {score === null ? '-' : score}
                                                </div>
                                            )
                                            )}
                                        </div>

                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex'>T{item.term}, N3:</div>
                                            {item.scoresN3.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1  rounded-sm bg-gray-50 text-sm mx-1">
                                                    {score === null ? '-' : score}
                                                </div>
                                            )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className='bg-blue-100 '>
                                <div className='font-semibold'>UTF</div>
                                {studentGradesList[index].competencies.UTF.scores.map((item, itemIndex) => (
                                    <div className=' '>
                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex'>T{item.term}, N1:</div>
                                            {item.scoresN1.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1  rounded-sm bg-gray-50 text-sm mx-1">
                                                    {score === null ? '-' : score}
                                                </div>
                                            )
                                            )}
                                        </div>

                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex'>T{item.term}, N2:</div>
                                            {item.scoresN2.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1  rounded-sm bg-gray-50 text-sm mx-1">
                                                    {score === null ? '-' : score}
                                                </div>
                                            )
                                            )}
                                        </div>

                                        <div key={itemIndex} className=" flex items-center flex-wrap">
                                            <div className='flex'>T{item.term}, N3:</div>
                                            {item.scoresN3.map((score, scoreIndex) => (
                                                <div key={scoreIndex} className="px-1  rounded-sm bg-gray-50 text-sm mx-1">
                                                    {score === null ? '-' : score}
                                                </div>
                                            )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>




                        </div>
                        {/* Render chart for the course */}
                        <div className=''>
                            <BarChartAvgs InfoBarChart={courseData} key={`chartAvgs-${index}`} />

                        </div>
                    </div>
                ))}
            </div>

        </div>
    );


};

export default StudentGrades;
