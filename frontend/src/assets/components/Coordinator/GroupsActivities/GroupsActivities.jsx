import React, { useState, useEffect } from 'react';
import SelectCourse from './SelectCourse';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from '../../../../utils/AxiosInterceptos/interceptors';

const GroupsActivities = () => {
    const [groupsActivities, setGroupsActivities] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [courseIds, setCourseIds] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [token] = useState(localStorage.getItem('token'));

    const coordinatorID = useSelector((state) => state.user.user.id);


    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    const toggleDescription = (groupId, termIndex, descIndex) => {
        const key = `${groupId}-${termIndex}-${descIndex}`;
        setExpandedDescriptions((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };


    const handleCourseSelect = (courseId) => {
        setSelectedCourseId(courseId);
        console.log('Selected Course ID:', courseId);
    };

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`http://localhost:3500/activities/course/${selectedCourseId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setGroupsActivities(response.data.activitiesInfo);
                console.log("-------------", response.data.activitiesInfo)
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

        if (selectedCourseId) {
            fetchActivities();
        }
    }, [selectedCourseId, token]);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`http://localhost:3500/courses/coordinator/${coordinatorID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCourseIds(response.data.courses);
            } catch (err) {
                if (err.response) {
                    if (err.response.status === 404) {
                        setError(err.response.data.message || 'No courses found for this coordinator.');
                        toast.error(err.response.data.message || 'No courses found for this coordinator.');
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

        if (coordinatorID) {
            fetchCourses();
        }
    }, [coordinatorID, token]);

    function extractGroupNumber(str) {
        const regex = /\d+$/;
        const match = str.match(regex);
        return match ? match[0] : '';
    }

    return (
        <div className='max-w-full mx-auto mt-10 flex flex-col'>
            <div className="flex justify-center shadow-sm rounded-md">
                {courseIds && <SelectCourse courses={courseIds} onCourseSelect={handleCourseSelect} />}
            </div>

            <div className="overflow-x-auto p-4">
                {groupsActivities && groupsActivities.map((group) => (
                    <div key={group.g_Id} className="mb-8">
                        <div className='flex justify-between items-center'>
                            <div className="text-lg font-semibold text-blue-600 mb-4">Grupo: {extractGroupNumber(group.g_Id)}</div>
                            <div className="text-normal font-semibold mb-2">Profesor: {group.teacher}</div>
                        </div>

                        {group.terms.map((term, termIndex) => (
                            <div key={term.term} className="mb-6">
                                <h4 className="text-md font-semibold mb-2">Tercio: {term.term}</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-200 table-fixed">
                                        <thead className="bg-blue-50">
                                            <tr>
                                                <th className="py-2 px-4 border-b border-r border-gray-300">Descripción</th>
                                                <th className="py-2 px-4 border-b border-r border-gray-300 text-center">Tipo</th>
                                                <th className="py-2 px-4 border-b border-r border-gray-300 text-center">Rúbrica</th>
                                                <th className="py-2 px-4 border-b border-gray-300 text-center">Fecha de realización</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-blue-50">
                                            {term.description.map((desc, descIndex) => {
                                                const key = `${group.g_Id}-${termIndex}-${descIndex}`;
                                                const isExpanded = expandedDescriptions[key];
                                                return (
                                                    <tr key={descIndex}>
                                                        <td className="py-2 px-4 border-b border-r border-gray-300">
                                                            <span
                                                                className={`block cursor-pointer ${isExpanded ? 'whitespace-normal' : 'whitespace-nowrap overflow-hidden text-ellipsis max-w-xs'}`}
                                                                onClick={() => toggleDescription(group.g_Id, termIndex, descIndex)}
                                                            >
                                                                {desc}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-4 border-b border-r border-gray-300 text-center">{term.type[descIndex]}</td>
                                                        <td className="py-2 px-4 border-b border-r border-gray-300 text-center">{term.rubric[descIndex]}</td>
                                                        <td className="py-2 px-4 border-b border-gray-300 text-center">{term.activityAppliedDate[descIndex]}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-2 font-lightbold text-sm">
                                    <span># Actividades:</span> {term.activityCount}
                                </div>
                                <div className="mt-2 font-lightbold text-sm">
                                    <hr />
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>

    );
};

export default GroupsActivities;
