import React, { useState, useEffect } from 'react';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';              // To get info about the current teacher in the app
import api from "../../../utils/AxiosInterceptos/interceptors"

import { useDispatch } from 'react-redux';
import { initState } from '../../../redux/slice/listStudentsSlice'; // Import the initState action



// Define the validation schema
const validationSchema = Yup.object({
    courseId: Yup.string().required('Course is required'),
    groupId: Yup.string().required('Group is required'),
});



// Helper function to group courses and their groups. 
const getCoursesAndGroups = (data) => {
    // https://bard.google.com/chat/675f34c1fe402e84?hl=es_419
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

    return coursesWithGroups

}

// Helper function
const getCourses = (courseGroups) => {
    const uniqueCourses = courseGroups.map(courseWithGroups => courseWithGroups.course);
    return uniqueCourses
}
// Helper function
const groupsForCourse = (courseId, courseGroups) => {
    const groupsForCourse = courseGroups.find(courseGroups => courseGroups.course._id === courseId).groups;
    return groupsForCourse

}
{/* ::::::::::::: */ }

const SelectCourseGroups = ({ onFormSubmit, handle_CreateActivity_ActivityGradesVisibillity, onEnableCreateActivityButton }) => {
    const dispatch = useDispatch();

    const [token] = useState(localStorage.getItem('token'));
    const teacherId = useSelector((state) => state.user.user.id);

    const [courseGroups, setcourseGroups] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');


    // Fetch teacher data on component mount
    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const response = await api.get(`http://localhost:3500/teacher/${teacherId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Replace with your actual token
                    },
                });

                console.log("==========================000ResponseData::::::", response.data)

                setcourseGroups(getCoursesAndGroups(response.data))


            } catch (error) {
                console.error('Error fetching teacher data:', error);
            }
        };

        fetchTeacherData();
    }, []);

    const formik = useFormik({
        initialValues: {
            courseId: '',
            groupId: '',
        },
        validationSchema,
        onSubmit: (values) => {
            //Get the students for the selected course and group.
            const targetGroup = courseGroups
                .find(courseWithGroups => courseWithGroups.course._id === values.courseId)
                .groups.find(group => group._id === values.groupId);

            const activityCount = targetGroup.activityCount;
            // You can also have accsess to const activities = targetGroup.activities;

            const studentsInGroup = targetGroup.students;

            console.log("---------::::before:::::::---------", studentsInGroup)
            // To Each student in the array of ojects,  scores is added
            const updatedStudents = studentsInGroup.map(student => ({
                ...student,
                scores: [
                    { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
                    { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
                    { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
                    { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
                    { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
                ],

            }));
            console.log("---------:::::after::::::---------", updatedStudents)


            //Put the studentsInGroup in the Redux store (ListStudents slice)
            dispatch(initState({ updatedStudents }));

            const isCreateActivity_ActivityGradesVisible = false

            // Call the callback function from props
            onFormSubmit(values.courseId, values.groupId, activityCount, isCreateActivity_ActivityGradesVisible);
        },
    });

    const handleCourseChange = (event) => {
        const courseId = event.target.value;
        setSelectedCourse(courseId);
        formik.handleChange(event);
    };


    const handleGroupChange = (event) => {
        const groupId = event.target.value;
        handle_CreateActivity_ActivityGradesVisibillity(true);
        setSelectedGroup(groupId);
        onEnableCreateActivityButton()
        formik.handleChange(event);
    };

    console.log("coorseGroups:::::::::::::::::::::::::", courseGroups)

    return (
        <div className=" w-full  shadow-lg bg-blue-100 rounded-lg px-5">
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
                                    formik.handleChange(e); // Update formik values
                                }}
                                onBlur={formik.handleBlur}
                                value={formik.values.courseId}
                                className="w-full" // Apply w-full to the select element
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
                                        formik.handleChange(e); // Update formik values
                                    }}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.groupId}
                                    className="w-full" // Apply w-full to the select element
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

                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 w-max rounded-lg my-1"
                        type="submit"

                    >
                        Traer estudiantes
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SelectCourseGroups;
