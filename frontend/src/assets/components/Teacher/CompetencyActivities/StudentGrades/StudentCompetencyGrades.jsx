import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from "../../../../../utils/AxiosInterceptos/interceptors";
import SelectCourseGroups from './SelectCourseGroups';
import BarChartAvgs from "./BarChartAvgs";
import BarChartNumRegisters from './BarChartNumRegisters';

const StudentCompetencyGrades = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [token] = useState(localStorage.getItem('token'));
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [studentGrades, setStudentGrades] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        setIsButtonDisabled(!(selectedStudentId && selectedCourse && selectedGroup));
    }, [selectedStudentId, selectedCourse, selectedGroup]);

    const fetchStudents = async (courseId, groupId) => {
        try {
            const response = await api.get(`http://localhost:3500/users/getStudents/group/${groupId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Error fetching students. Please try again.');
        }
    };

    const handleStudentGrades = async () => {
        try {
            if (!selectedStudentId) {
                toast.error('Please select a student to fetch grades.');
                return;
            }

            const response = await api.get(`http://localhost:3500/grades/studentGradesFullAnalysis/studentId/${selectedStudentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setStudentGrades(response.data.InfoBarChart);
            toast.success('Student grades fetched successfully.');
            setIsButtonDisabled(true);
            setSelectedStudentId(null);

        } catch (error) {
            if (error.response && error.response.status === 404) {
                const errorMessage = error.response.data?.message || "Not Found";
                switch (errorMessage) {
                    case "No activities found for this student":
                        toast.error(errorMessage);
                        setStudentGrades([]);
                        break;
                    case "Resource not found":
                        toast.error(errorMessage);
                        break;
                    default:
                        toast.error(errorMessage);
                }
            } else {
                toast.error('An error occurred.');
            }
        }
    };

    const handleFormSubmit = (courseId, groupId) => {
        setSelectedCourse(courseId);
        setSelectedGroup(groupId);
        fetchStudents(courseId, groupId);
    };

    const handleSearchClean = () => {
        setStudents([]);
        setSelectedStudentId(null);
    };

    const extractGroupNumber = (str) => {
        const regex = /\d+$/;
        const match = str.match(regex);
        return match ? match[0] : "";
    };

    return (
        <div className="flex flex-col">
            <div className="self-center px-4 mb-6 md:mb-4">
                <div className="shadow-lg rounded-lg">
                    <SelectCourseGroups onFormSubmit={handleFormSubmit} />

                    {selectedCourse && selectedGroup && (
                        <>
                            <div className="font-semibold mb-4 my-2 mx-4">Buscar estudiante</div>
                            <div className="self-start px-2">
                                {students && students.map((student) => (
                                    <div key={student.studentId} className="flex items-center mb-2 space-x-1">
                                        <input
                                            type="radio"
                                            id={student.studentId}
                                            name="studentSelection"
                                            checked={selectedStudentId === student.studentId}
                                            onChange={() => setSelectedStudentId(student.studentId)}
                                        />
                                        <label htmlFor={student.studentId}>{student.name}</label>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-around items-center py-3">
                                <button
                                    onClick={handleStudentGrades}
                                    disabled={isButtonDisabled}
                                    className={`bg-red-500 text-white px-4 py-1 my-2 rounded ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                                >
                                    Traer datos de estudiante
                                </button>
                                <button
                                    className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded-lg my-2"
                                    onClick={() => navigate('/director')}
                                >
                                    Terminar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="md:w-auto px-4 flex flex-col md:flex-row flex-wrap">
                {studentGrades.map((courseData, index) => (
                    <div key={index} className="mb-4 md:w-full">
                        <div className="flex justify-center space-x-2 font-roboto">
                            <span>{courseData.courseName}</span>
                            <span>Grupo: {extractGroupNumber(courseData.group)}</span>
                        </div>
                        <div className='flex sm:flex-col md:flex-row md:justify-center items-center'>
                            <BarChartAvgs InfoBarChart={courseData} key={`chartAvgs-${index}`} />
                            <BarChartNumRegisters InfoBarChart={courseData} key={`chartRegisters-${index}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentCompetencyGrades;