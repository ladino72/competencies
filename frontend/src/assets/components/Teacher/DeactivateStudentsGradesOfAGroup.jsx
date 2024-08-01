import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import api from "../../../utils/AxiosInterceptos/interceptors";
import StudentsGradesDeactivated from './StudentsGradesDeactivated';



const DeactivateStudentsGradesOfAGroup = () => {
    const dispatch = useDispatch();
    const [token] = useState(localStorage.getItem('token'));
    const teacherId = useSelector((state) => state.user.user.id);
    const [courseGroups, setCourseGroups] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [studentList, setStudentList] = useState([]);

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

    const validationSchema = Yup.object({
        courseId: Yup.string().required('Course is required'),
        groupId: Yup.string().required('Group is required'),
    });

    // Helper function to group courses and their groups
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

    // Helper function to get unique courses
    const getCourses = (courseGroups) => {
        const uniqueCourses = courseGroups.map(courseWithGroups => courseWithGroups.course);
        return uniqueCourses;
    };

    // Helper function to get groups for a specific course
    const groupsForCourse = (courseId, courseGroups) => {
        const groupsForCourse = courseGroups.find(courseGroups => courseGroups.course._id === courseId).groups;
        return groupsForCourse;
    };

    function removeStudentsFromGroup(groupId, studentIds) {
        // Create a deep copy of the data object to avoid modifying the original
        const newData = JSON.parse(JSON.stringify(courseGroups));

        // Find the target group by its _id
        const targetGroup = newData.flatMap(course => course.groups).find(group => group._id === groupId);

        // If the group is found
        if (targetGroup) {
            // Filter out the students with the provided IDs
            targetGroup.students = targetGroup.students.filter(student => !studentIds.includes(student.id));
        }
        setCourseGroups(newData)
        //Get the students for the selected course and group.
        const targGroup = courseGroups
            .find(courseWithGroups => courseWithGroups.course._id === selectedCourse)
            .groups.find(group => group._id === selectedGroup);

        const studentsInGroup = targGroup.students;
        setStudentList(studentsInGroup) /////Revise


        // return studentsInGroup
        //return newData;
    }
    const removeStudentsFromList = (groupId, studentIds) => {
        removeStudentsFromGroup(groupId, studentIds)
        // Update the student list after removing students
        setStudentList(prevStudentList => prevStudentList.filter(student => !studentIds.includes(student.id)));
    };



    const formik = useFormik({
        initialValues: {
            courseId: '',
            groupId: '',
        },
        validationSchema,
        onSubmit: (values) => {
            const selectedGroup = courseGroups.find(courseGroup => courseGroup.course._id === values.courseId)
                .groups.find(group => group._id === values.groupId);
            const studentsInGroup = selectedGroup ? selectedGroup.students : [];
            setStudentList(studentsInGroup);
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

    return (
        <div className="container mx-auto  flex flex-col justify-center items-center">
            <div className=" shadow-lg bg-blue-100 rounded-lg px-5">
                <form onSubmit={formik.handleSubmit}>
                    <div className="flex flex-col w-full">
                        <div className="flex flex-col w-full">
                            <div className="font-semibold">
                                <label htmlFor="courseId">Select a course:</label>
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
                                    {courseGroups.map(courseGroup => (
                                        <option key={courseGroup.course._id} value={courseGroup.course._id}>{courseGroup.course.name}</option>
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
                                    <label htmlFor="groupId">Select a group:</label>
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
                                        {courseGroups.find(courseGroup => courseGroup.course._id === selectedCourse)
                                            .groups.map(group => (
                                                <option key={group._id} value={group._id}>{group.g_Id}</option>
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

            <StudentsGradesDeactivated
                selectedGroup={selectedGroup}
                studentList={studentList}
                removeStudentsFromList={removeStudentsFromList}
            />
        </div>
    );
};

export default DeactivateStudentsGradesOfAGroup;
