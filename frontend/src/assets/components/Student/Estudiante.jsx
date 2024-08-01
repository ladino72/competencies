import React, { useState, useEffect } from 'react';

import api from "../../../utils/AxiosInterceptos/interceptors"
import { useSelector } from 'react-redux';
import ActivityGrades from './ActivityGrades';


const Estudiante = ({ studentId }) => {
    const [grades, setGrades] = useState([]);
    const [token] = useState(localStorage.getItem('token'));
    //const user = useSelector((state) => state.user.user.role);
    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await api.get(`http://localhost:3500/grades/${studentId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                setGrades(response.data.courses);
            } catch (error) {
                console.error('Error fetching grades:', error);
            }
        };

        fetchGrades();
    }, [studentId]);


    const LongText = ({ text, limit = 100 }) => {
        const [isExpanded, setIsExpanded] = useState(false);

        const toggleTextExpansion = () => setIsExpanded(!isExpanded);

        const truncatedText = isExpanded ? text : text.substring(0, limit) + "...";

        return (
            <div className="text-gray-700" onClick={toggleTextExpansion}>
                <p className="line-clamp-3">{truncatedText}</p>
            </div>
        );
    };

    return (
        <div className="container w-full mx-auto mt-2">
            <div className='text-lg font-bold mb-2 text-blue-800 '>{user.name}</div>

            {grades.map((course, index) => (
                <div key={index} className="mb-8 w-full bg-blue-20">
                    <h2 className="text-lg font-bold mb-2">{course.course}</h2>

                    {course.grades.map((grade, index) => (
                        <div className="flex flex-col justify-between items-center md:flex-row  lg:flex-row  md:space-x-3 lg:space-x-5 " key={index}>
                            <div className={`flex flex-col w-full lg:basis-1/4`}>
                                <div className='flex flex-row justify-between md:flex-row lg:flex-row font-roboto'>
                                    <div className='basis-1/2 '>
                                        Grupo: {grade.group.g_Id.replace(/[a-zA-Z]/g, "")}
                                    </div>
                                    <div className='basis-1/2 '>
                                        Tercio: {grade.activity.term}
                                    </div>
                                </div>

                                <div className='flex flex-row justify-between md:flex-row lg:flex-row '>
                                    <div className='basis-1/2 font-roboto'>Actividad: {grade.activityNum}</div>
                                    <div className="basis-1/2 font-roboto">Tipo: {grade.activity.type.join(', ')}</div>
                                </div>

                                <div className="flex flex-col md:flex-row lg:flex-row md:items-center lg:items-center md:justify-bwtween" >
                                    <div className='font-roboto'>Descripción:</div>
                                    <div className="flex-grow text-left overflow-ellipsis whitespace-nowrap text-gray-600 text-sm sm:px-0 md:px-1 ">
                                        <LongText text={grade.activity.description} />
                                    </div>
                                </div>

                            </div>

                            <div key={index} className='w-full lg:basis-3/4 '>
                                <ActivityGrades scores={grade.scores} />
                            </div>
                        </div>
                    ))}



                </div>
            ))}
        </div>
    );
};

export default Estudiante;