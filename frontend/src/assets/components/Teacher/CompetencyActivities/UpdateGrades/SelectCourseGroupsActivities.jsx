import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from "../../../../../utils/AxiosInterceptos/interceptors";
import { useDispatch } from 'react-redux';
import { initState } from '../../../../../redux/slice/listStudentsSlice';
import { toast } from 'react-toastify';
import { clearStudentList } from "../../../../../redux/slice/listStudentsSlice"



const validationSchema = Yup.object({
    courseId: Yup.string().required('Course is required'),
    groupId: Yup.string().required('Group is required'),
    activityId: Yup.string().required('Activity is required'),
});

const getCoursesAndGroups = (data) => {
    const coursesWithGroups = [];
    const seenCourseIds = new Set();

    data.courses.forEach(course => {
        const courseId = course._id;

        if (!seenCourseIds.has(courseId)) {
            coursesWithGroups.push({
                course: {
                    _id: courseId,
                    name: course.name,
                },
                groups: [],
            });
            seenCourseIds.add(courseId);
        }

        const lastCourseIndex = coursesWithGroups.length - 1;
        coursesWithGroups[lastCourseIndex].groups.push(course.groups);
    });

    return coursesWithGroups;
}

const getCourses = (courseGroups) => {
    const uniqueCourses = courseGroups.map(courseWithGroups => courseWithGroups.course);
    return uniqueCourses;
}

const groupsForCourse = (courseId, courseGroups) => {
    const groupsForCourse = courseGroups.find(courseWithGroups => courseWithGroups.course._id === courseId).groups;
    return groupsForCourse;
}

// const activitiesForGroup = (groupId, courseGroups) => {
//     const group = courseGroups.find(courseWithGroups => courseWithGroups.groups.some(group => group._id === groupId));

//     if (group) {
//         const activities = group.groups.find(group => group._id === groupId).activities;
//         return activities;
//     }

//     return [];
// }
const activitiesForGroup = (groupId, courseGroups) => {
    const activities = [];

    for (const courseData of courseGroups) {
        const groups = courseData.groups || [];

        const group = groups.find(group => group._id === groupId);

        if (group && group.activities) {
            activities.push(...group.activities.map(activity => activity.id));
        }
    }

    return activities;
}


const SelectCourseGroupsActivities = ({ onFormSubmit }) => {
    const dispatch = useDispatch();
    const [token] = useState(localStorage.getItem('token'));
    const teacherId = useSelector((state) => state.user.user.id);
    const [courseGroups, setCourseGroups] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedActivityId, setSelectedActivityId] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);
    const [activityGrades, setActivityGrades] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const response = await api.get(`http://localhost:3500/teacher/${teacherId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                setCourseGroups(getCoursesAndGroups(response.data));
            } catch (error) {
                console.error('Error fetching teacher data:', error);
            }
        };

        fetchTeacherData();
    }, [teacherId, token]);

    useEffect(() => {
        const fetchData = async () => {
            if (selectedActivityId) {
                try {
                    setLoading(true);

                    const token = localStorage.getItem('token');
                    const response = await api.get(`http://localhost:3500/grades/getActivityGrades/${selectedActivityId}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    setActivityGrades(response.data);
                    // toast.success('Grades fetched successfully.');
                } catch (error) {
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        const { status, data } = error.response;

                        if (status === 400 && data.errors) {
                            setValidationErrors(data.errors);
                            validationErrors.forEach(error => {
                                toast.error(error.msg);
                            });
                        } else {
                            console.error('Error occurred while fetching data:', error);
                            toast.error('Error occurred while fetching data.');
                        }
                    } else if (error.request) {
                        // The request was made but no response was received
                        console.error('No response received:', error.request);
                        toast.error('No response received from the server.');
                    } else {
                        // Something happened in setting up the request
                        console.error('Error setting up the request:', error.message);
                        toast.error('Error setting up the request.');
                    }
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [selectedActivityId]);


    const formik = useFormik({
        initialValues: {
            courseId: '',
            groupId: '',
            activityId: '',
        },
        validationSchema,
        onSubmit: (values) => {

            const updatedStudents = activityGrades;
            dispatch(initState({ updatedStudents }));

            const isCreateActivity_ActivityGradesVisible = false;

            setTimeout(() => {
                onFormSubmit(values.courseId, values.groupId, values.activityId, isCreateActivity_ActivityGradesVisible);
            }, 0);
        },
    });

    const handleCourseChange = (event) => {
        const courseId = event.target.value;
        setSelectedCourse(courseId);
        formik.handleChange(event);
    };

    const handleGroupChange = (event) => {
        const groupId = event.target.value;
        setSelectedGroup(groupId);

        formik.handleChange(event);
    };

    const handleActivityChange = (event) => {
        const activityId = event.target.value;
        setSelectedActivityId(activityId);
        dispatch(clearStudentList()); // Trigger the list clearing action
        formik.handleChange(event);
    };


    return (
        <div className="w-full shadow-lg bg-blue-100 rounded-lg px-5">
            <form onSubmit={formik.handleSubmit}>
                <div className="flex flex-col w-full">
                    <div className="flex flex-col w-full">
                        <div className="font-semibold">
                            <label htmlFor="courseId">Seleccione un curso:</label>
                        </div>
                        <div className="w-full">
                            <select
                                id="courseId"
                                name="courseId"
                                onChange={(e) => {
                                    handleCourseChange(e);
                                    formik.handleChange(e);
                                }}
                                onBlur={formik.handleBlur}
                                value={formik.values.courseId}
                                className="w-full"
                            >
                                <option value="" label="Select a course" />
                                {getCourses(courseGroups).map((course) => (
                                    <option key={course._id} value={course._id} label={course.name} />
                                ))}
                            </select>
                        </div>
                        <div className="text-red-500 text-sm">
                            {formik.touched.courseId && formik.errors.courseId && (
                                <div>{formik.errors.courseId}</div>
                            )}
                        </div>
                    </div>

                    {selectedCourse && (
                        <div className="flex flex-col w-full">
                            <div className="font-semibold">
                                <label htmlFor="groupId">Seleccione un grupo:</label>
                            </div>
                            <div className="w-full">
                                <select
                                    id="groupId"
                                    name="groupId"
                                    onChange={(e) => {
                                        handleGroupChange(e);
                                        formik.handleChange(e);
                                    }}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.groupId}
                                    className="w-full"
                                >
                                    <option value="" label="Select a group" />
                                    {groupsForCourse(selectedCourse, courseGroups).map((group) => (
                                        <option key={group._id} value={group._id} label={group.g_Id} />
                                    ))}
                                </select>
                            </div>
                            <div className="text-red-500 text-sm">
                                {formik.touched.groupId && formik.errors.groupId && (
                                    <div>{formik.errors.groupId}</div>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedGroup && (
                        <div className="flex flex-col w-full">
                            <div className="font-semibold">
                                <label htmlFor="activityId">Seleccione una actividad:</label>
                            </div>
                            <div className="w-full">
                                <select
                                    id="activityId"
                                    name="activityId"
                                    onChange={(e) => {
                                        handleActivityChange(e);
                                        formik.handleChange(e);
                                    }}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.activityId}
                                    className="w-full"
                                >
                                    <option value="" label="Seleccione una actividad" />
                                    {activitiesForGroup(selectedGroup, courseGroups).map((activity, index) => (
                                        <option key={activity} value={activity} label={`Actividad ${index + 1}`} />
                                    ))}
                                </select>
                            </div>
                            <div className="text-red-500 text-sm">
                                {formik.touched.activityId && formik.errors.activityId && (
                                    <div>{formik.errors.activityId}</div>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 w-max rounded-lg my-1"
                        type="submit"
                    >
                        {loading ? 'Fetching Students...' : 'Traer estudiantes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SelectCourseGroupsActivities;
