import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import api from "../../../../../utils/AxiosInterceptos/interceptors";

const validationSchema = Yup.object({
    courseId: Yup.string().required('Course is required'),
    groupId: Yup.string().required('Group is required'),
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
};

const getCourses = (courseGroups) => {
    return courseGroups.map(courseWithGroups => courseWithGroups.course);
};

const groupsForCourse = (courseId, courseGroups) => {
    const course = courseGroups.find(courseWithGroups => courseWithGroups.course._id === courseId);
    return course ? course.groups.flat() : [];
};

const SelectCourseGroups = ({ onFormSubmit }) => {
    const teacherId = useSelector((state) => state.user.user.id);
    const [token] = useState(localStorage.getItem('token'));
    const [courseGroups, setCourseGroups] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');

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

    const formik = useFormik({
        initialValues: {
            courseId: '',
            groupId: '',
        },
        validationSchema,
        onSubmit: (values) => {
            onFormSubmit(values.courseId, values.groupId);
        },
    });

    const handleCourseChange = (event) => {
        const courseId = event.target.value;
        setSelectedCourse(courseId);
        formik.setFieldValue('courseId', courseId);
        formik.setFieldValue('groupId', '');
        onFormSubmit(courseId, formik.values.groupId);
    };

    const handleGroupChange = (event) => {
        const groupId = event.target.value;
        formik.setFieldValue('groupId', groupId);
        onFormSubmit(formik.values.courseId, groupId);
    };

    const extractGroupNumber = (str) => {
        const regex = /\d+$/;
        const match = str.match(regex);
        return match ? match[0] : "";
    };

    return (
        <div className="w-full shadow-lg bg-blue-100 rounded-lg px-5">
            <form>
                <div className="flex flex-col w-full">
                    <div className="flex flex-col w-full mb-2">
                        <div className="font-semibold">
                            <label htmlFor="courseId">Seleccione un curso:</label>
                        </div>
                        <div className="w-full">
                            <select
                                id="courseId"
                                name="courseId"
                                onChange={handleCourseChange}
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
                        <div className="flex flex-col w-full mb-4">
                            <div className="font-semibold">
                                <label htmlFor="groupId">Seleccione un grupo:</label>
                            </div>
                            <div className="w-full">
                                <select
                                    id="groupId"
                                    name="groupId"
                                    onChange={handleGroupChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.groupId}
                                    className="w-full"
                                >
                                    <option value="" label="Select a group" />
                                    {groupsForCourse(selectedCourse, courseGroups).map((group) => (
                                        <option key={group._id} value={group._id} label={extractGroupNumber(group.g_Id)} />
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
                </div>
            </form>
        </div>
    );
};

export default SelectCourseGroups;
