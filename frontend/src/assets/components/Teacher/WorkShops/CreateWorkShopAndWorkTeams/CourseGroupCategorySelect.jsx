import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import api from "../../../../../utils/AxiosInterceptos/interceptors";

const validationSchema = Yup.object({
    courseId: Yup.string().required('Course is required'),
    groupId: Yup.string().required('Group is required'),
    category: Yup.string().required('Category is required'),
    description: Yup.string().max(100, 'Description must be 100 characters or less').required('Description is required'),
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

const CourseGroupCategorySelect = ({ onFormSubmit, token }) => {
    const teacherId = useSelector((state) => state.user.user.id);
    const [courseGroups, setCourseGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [teamNames, setTeamNames] = useState([]);

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
        const fetchCategories = async () => {
            try {
                const response = await api.get('http://localhost:3500/workshop/getcategoryNames', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCategories(response.data.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, [token]);

    const formik = useFormik({
        initialValues: {
            courseId: '',
            groupId: '',
            category: '',
            description: '',
        },
        validationSchema,
        onSubmit: (values) => {
            onFormSubmit(values.courseId, values.groupId, values.category, values.description, teamNames);
        },
    });

    const handleCourseChange = (event) => {
        const courseId = event.target.value;
        setSelectedCourse(courseId);
        formik.setFieldValue('courseId', courseId);
        formik.setFieldValue('groupId', '');
        onFormSubmit(courseId, formik.values.groupId, formik.values.category, formik.values.description, teamNames);
    };

    const handleGroupChange = (event) => {
        const groupId = event.target.value;
        formik.setFieldValue('groupId', groupId);
        onFormSubmit(formik.values.courseId, groupId, formik.values.category, formik.values.description, teamNames);
    };

    const handleCategoryChange = async (event) => {
        const category = event.target.value;
        formik.setFieldValue('category', category);

        try {
            const response = await api.get(`http://localhost:3500/workshop/getTeamNames?category=${category}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const teamNamesData = response.data.data;
            setTeamNames(teamNamesData);
            onFormSubmit(formik.values.courseId, formik.values.groupId, category, formik.values.description, teamNamesData);
        } catch (error) {
            console.error('Error fetching team names:', error);
        }
    };

    const handleDescriptionChange = (event) => {
        const description = event.target.value;
        formik.setFieldValue('description', description);
        onFormSubmit(formik.values.courseId, formik.values.groupId, formik.values.category, description, teamNames);
    };

    const extractGroupNumber = (str) => {
        const regex = /\d+$/;
        const match = str.match(regex);
        return match ? match[0] : "";
    };

    return (
        <div className="w-full shadow-lg bg-blue-100 rounded-lg px-5">
            <form onSubmit={formik.handleSubmit}>
                <div className="flex flex-col w-full">
                    <div className="flex flex-col w-full mb-2 mt-2">
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

                    <div className="flex flex-col w-full mb-4">
                        <div className="font-semibold">
                            <label htmlFor="category">Nombre de equipos relacionados con:</label>
                        </div>
                        <div className="w-full">
                            <select
                                id="category"
                                name="category"
                                onChange={handleCategoryChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.category}
                                className="w-full"
                            >
                                <option value="" label="Select a category" />
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-red-500 text-sm">
                            {formik.touched.category && formik.errors.category && (
                                <div>{formik.errors.category}</div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col w-full mb-1 -mt-3">
                        <div className="font-semibold">
                            <label htmlFor="description">Descripción:</label>
                        </div>
                        <div className="w-full">
                            <textarea
                                id="description"
                                name="description"
                                onChange={handleDescriptionChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.description}
                                className="w-full"
                                maxLength={100}
                                rows={3}
                            />
                        </div>
                        <div className="text-red-500 text-sm">
                            {formik.touched.description && formik.errors.description && (
                                <div>{formik.errors.description}</div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CourseGroupCategorySelect;
