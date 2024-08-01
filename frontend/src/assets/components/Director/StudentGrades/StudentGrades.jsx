import React, { useState, useEffect } from 'react';
import SearchForm from "../StudentGrades/SearchForm"
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from "../../../../utils/AxiosInterceptos/interceptors"

import BarChartAvgs from "./BarChartAvgs"
import BarChartNumRegisters from './BarChartNumRegisters';

const StudentGrades = () => {
    const [students, setStudents] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null); // Track selected user
    const [token] = useState(localStorage.getItem('token'));
    // const [errorMessage, setErrorMessage] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [studentGrades, setStudentGrades] = useState([]);
    const navigate = useNavigate();

    const handleStudentGrades = async () => {
        try {
            if (!selectedUserId) {
                toast.error('Please select a user to fetch.');
                return;
            }

            console.log("Selected student Id><><><<<<", selectedUserId)

            const response = await api.get(`http://localhost:3500/grades/studentGradesFullAnalysis/studentId/${selectedUserId}`,
                {

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('Student response:', response.data.InfoBarChart);

            setStudentGrades(response.data.InfoBarChart);
            toast.success('User fetched successfully.');
            setIsButtonDisabled(true); // Disable the button after deletion
            setSelectedUserId(null); // Reset selected user

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
        // Check if a user is selected to enable/disable the button
        setIsButtonDisabled(!selectedUserId);
    }, [selectedUserId]);

    const handleSearchClean = () => {
        // Function to clean the search field
        // This will be passed to the SearchForm component
    };

    if (studentGrades) {
        console.log("Student Grades>>>>O", studentGrades)
    }

    function extractGroupNumber(str) {
        // Regular expression to match digits at the end of the string
        const regex = /\d+$/;

        // Extract the match (the digits) or return an empty string if no match
        const match = str.match(regex);
        return match ? match[0] : "";
    }

    return (
        <div className="flex flex-col ">

            {/* Menu */}
            <div className="self-center px-4 mb-6 md:mb-4">
                <div className="shadow-lg rounded-lg">
                    <div className="font-semibold mb-4 mt-1">Buscar estudiante</div>
                    <div className="mb-4">
                        <SearchForm setListOfSudents={setStudents} onSearchClean={handleSearchClean} />
                    </div>
                    <div className="self-start px-2">
                        {students && students.map((user) => (
                            <div key={user._id} className="flex items-center mb-2">
                                <input
                                    type="radio"
                                    className="mr-2"
                                    checked={selectedUserId === user._id}
                                    onChange={() => setSelectedUserId(user._id)}
                                />
                                <label>{user.name}</label>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-around items-center py-3">
                        <button
                            onClick={handleStudentGrades}
                            disabled={isButtonDisabled}
                            className={`bg-red-500 text-white px-4 py-1 my-2 rounded ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                        >
                            Traer estudiante seleccionado
                        </button>
                        <button
                            className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded-lg my-2"
                            onClick={() => navigate('/director')}
                        >
                            Terminar
                        </button>
                    </div>
                </div>
            </div>

            {/* Plots */}
            <div className="md:w-auto px-4 flex flex-col md:flex-row flex-wrap">
                {studentGrades.map((courseData, index) => (
                    <div key={index} className="mb-4 md:w-full">
                        {/* Display course information here */}
                        <div className="flex justify-center space-x-2 font-roboto">
                            <span className="">{courseData.courseName}</span>
                            <span className="">Grupo: {extractGroupNumber(courseData.group)}</span>
                        </div>
                        <p>{/* Additional course info (optional) */}</p>
                        {/* Render chart for the course */}
                        <div className='flex sm: flex-col md:flex-row md:justify-center  items-center'>
                            <BarChartAvgs InfoBarChart={courseData} key={`chartAvgs-${index}`} />
                            <BarChartNumRegisters InfoBarChart={courseData} key={`chartRegisters-${index}`} />
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );


};

export default StudentGrades;
