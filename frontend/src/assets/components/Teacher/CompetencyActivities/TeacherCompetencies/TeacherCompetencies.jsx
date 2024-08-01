import React, { useState, useEffect } from 'react';
import SelectCourse from './SelectCourse';
import { toast } from 'react-toastify';
import BarChartAvgs from './BarChartAvgs';
import BarChartNumRegisters from './BarChartNumRegisters';
import { useSelector } from 'react-redux';
import api from '../../../../../utils/AxiosInterceptos/interceptors';

const TeacherCompetencies = () => {
    const [teacherStats, setTeacherStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [courseIds, setCourseIds] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [token] = useState(localStorage.getItem('token'));

    const teacherId = useSelector((state) => state.user.user.id);



    const handleCourseSelect = (courseId) => {
        setSelectedCourseId(courseId);
        console.log('Selected Course ID:', courseId);
    };

    useEffect(() => {
        const fetchTeacherStats = async () => {
            setLoading(true);
            setError(null);
            try {
                //const response = await api.get(`http://localhost:3500/grades/statsTeacherForCoordinator/teacherId/${teacherId}/courseId/${selectedCourseId}`, {
                const response = await api.get(`http://localhost:3500/grades/statsTeacherForCoordinator/teacherId/${teacherId}/courseId/${selectedCourseId}`, {

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
                        setTeacherStats(null);
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

        if (teacherId && selectedCourseId) {
            fetchTeacherStats();
        }
    }, [teacherId, selectedCourseId, token]);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`http://localhost:3500/courses/teacher-courses/${teacherId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCourseIds(response.data.courses);
            } catch (err) {
                if (err.response) {
                    if (err.response.status === 404) {
                        setError(err.response.data.message || 'No courses found for this teacher.');
                        toast.error(err.response.data.message || 'No courses found for this teacher.');
                        setTeacherStats(null);
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

        if (teacherId) {
            fetchCourses();
        }
    }, [teacherId, token]);

    function extractGroupNumber(str) {
        const regex = /\d+$/;
        const match = str.match(regex);
        return match ? match[0] : '';
    }

    return (
        <div className="container mx-auto  flex flex-col justify-center items-center w-full">
            <div className="sm:w-min-full flex flex-col px-2 justify-between items-center shadow-md rounded-md py-2">
                <div className='w-full '>
                    {courseIds && <SelectCourse courses={courseIds} onCourseSelect={handleCourseSelect} />}
                </div>

            </div>
            <div className="flex flex-col justify-center my-4">
                {teacherId && teacherStats && teacherStats.map((course, courseIndex) => (
                    <div key={courseIndex}>
                        <div className="font-semibold space-x-1 flex justify-center">
                            <span>{course.course}</span>
                        </div>
                        {course.groups.map((group, groupIndex) => (
                            <div key={groupIndex} className="mt-4">
                                <div className="font-semibold space-x-1 flex justify-center">
                                    <span>Grupo: {extractGroupNumber(group.group)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-between items-center">
                                    <div className="w-full sm:w-1/2 p-2">
                                        <BarChartAvgs InfoBarChart={group} />
                                    </div>
                                    <div className="w-full sm:w-1/2 p-2">
                                        <BarChartNumRegisters InfoBarChart={group} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeacherCompetencies;
