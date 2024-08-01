import React, { useState, useEffect } from 'react';
import TeacherSelection from './TeacherSelection';
import { toast } from 'react-toastify';
import BarChartAvgs from './BarChartAvgs';
import BarChartNumRegisters from './BarChartNumRegisters'


import api from "../../../../utils/AxiosInterceptos/interceptors"


const TeacherWork = () => {
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);
    const [teacherStats, setTeacherStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token] = useState(localStorage.getItem('token'));


    const handleTeacherSelect = (teacherId) => {
        setSelectedTeacherId(teacherId);
        console.log('Selected Teacher ID:', teacherId);
    };

    useEffect(() => {
        if (selectedTeacherId) {
            const fetchTeacherStats = async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await api.get(`http://localhost:3500/grades/statsTeacherForDirector/teacherId/${selectedTeacherId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setTeacherStats(response.data.statsByTeacher);
                } catch (err) {
                    if (err.response) {
                        if (err.response.status === 404) {
                            setError(err.response.data.message || 'No grades found for the specified criteria.');
                            toast.error(err.response.data.message || 'No grades found for the specified criteria.');
                            setTeacherStats(null)
                        } else {
                            setError(`Server responded with status ${err.response.status}: ${err.response.data.message || err.response.statusText}`);
                            toast.error(`Server responded with status ${err.response.status}: ${err.response.data.message || err.response.statusText}`);
                        }
                    } else if (err.request) {
                        setError('No response received from the server. Please try again later.');
                        toast.error('No response received from the server. Please try again later.');
                    } else {
                        setError(`Error in setting up the request: ${err.message}`);
                        toast.error(`Error in setting up the request: ${err.message}`);
                    }
                } finally {
                    setLoading(false);
                }
            };

            fetchTeacherStats();
        }
    }, [selectedTeacherId]);

    function extractGroupNumber(str) {
        // Regular expression to match digits at the end of the string
        const regex = /\d+$/;

        // Extract the match (the digits) or return an empty string if no match
        const match = str.match(regex);
        return match ? match[0] : "";
    }

    return (
        <>
            <div className="max-w-md mx-auto mt-10">
                <TeacherSelection onTeacherSelect={handleTeacherSelect} />
                {selectedTeacherId && (
                    <div className="mt-4 p-4 border rounded-md">
                        <p>Selected Teacher ID: {selectedTeacherId}</p>
                        {loading && <p>Loading teacher stats...</p>}
                        {error && <p className="text-red-500">Error: {error}</p>}
                    </div>

                )}
            </div>
            <div>
                {/* {teacherStats && (
                    <div>
                        <h2 className="text-xl font-bold">Teacher Stats</h2>
                        <pre>{JSON.stringify(teacherStats, null, 2)}</pre>
                    </div>
                )} */}
                <div className='flex flex-col justify-center'>
                    {teacherStats && teacherStats.map((course, courseIndex) => (
                        <div key={courseIndex}>
                            <div className='font-semibold space-x-1 flex justify-center'>
                                <span>{course.course}</span>
                            </div>
                            {course.groups.map((group, groupIndex) => (
                                <div key={groupIndex} className='mt-4'>
                                    <div className='font-semibold space-x-1 flex justify-center'>
                                        <span>Grupo: {extractGroupNumber(group.group)}</span>
                                    </div>
                                    <div className='flex flex-col sm:flex-row justify-between items-center'>
                                        <div className='w-full sm:w-1/2 p-2'>
                                            <BarChartAvgs InfoBarChart={group} />
                                        </div>
                                        <div className='w-full sm:w-1/2 p-2'>
                                            <BarChartNumRegisters InfoBarChart={group} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>


            </div>
        </>

    );
};

export default TeacherWork;
