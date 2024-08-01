import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import api from "../../../../../utils/AxiosInterceptos/interceptors";
import { useSelector } from 'react-redux';
import moment from 'moment-timezone';

const SeeWorkTeamStudents = () => {
    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [teams, setTeams] = useState([]);
    const [noTeamsMessage, setNoTeamsMessage] = useState(false);

    const teacherId = useSelector((state) => state.user.user.id);
    const token = localStorage.getItem('token');


    // Adjust date function with improved logic
    const adjustDate = (isoDate) => {
        moment.locale('es');
        const colombiaTimezone = 'America/Bogota';

        // Parse and format the end date
        const formattedDate = moment.tz(isoDate, colombiaTimezone).format('YYYY-MM-DD HH:mm');

        // Get current date and time in the same timezone
        const now = moment().tz(colombiaTimezone).format('YYYY-MM-DD HH:mm');


        return formattedDate;
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get(`http://localhost:3500/teacher/getCoursesForATeacher/${teacherId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourses(response.data.courses);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };
        fetchCourses();
    }, [teacherId, token]);

    const cleanScreen = () => {
        setTeams([]);
        setNoTeamsMessage(false);
    };

    const fetchTeamStudentNames = async (workshopId) => {
        try {
            console.log(`Fetching data for workshopId: ${workshopId}`);
            const response = await api.get(`http://localhost:3500/workshop/getTeamStudentNames/workshopId/${workshopId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && Array.isArray(response.data.teamsStudentNames)) {
                setTeams(response.data.teamsStudentNames);

                setNoTeamsMessage(response.data.teamsStudentNames.length === 0);
            } else {
                setTeams([]);
                setNoTeamsMessage(true);
                toast.error("No teams found.");
            }
        } catch (error) {
            console.error('Error fetching team student names:', error);
            setNoTeamsMessage(true);
            toast.error("Error fetching team student names.");
        }
    };

    const handleCourseChange = async (event, setFieldValue) => {
        const courseId = event.target.value;
        setGroups([]);
        setWorkshops([]);
        cleanScreen();

        setFieldValue('courseId', courseId);
        setFieldValue('groupId', '');
        setFieldValue('workshopId', '');

        if (courseId) {
            const selectedCourse = courses.find(course => course._id === courseId);
            setGroups(selectedCourse ? selectedCourse.groups : []);
        }
    };

    const handleGroupChange = async (event, setFieldValue) => {
        const groupId = event.target.value;
        cleanScreen();
        setWorkshops([]);

        setFieldValue('groupId', groupId);
        setFieldValue('workshopId', '');

        if (groupId) {
            try {
                const response = await api.get(`http://localhost:3500/workshop/getWorkshopsCourseIdGroupId/courseId/${event.target.form.courseId.value}/groupId/${groupId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWorkshops(response.data.workshops);
            } catch (error) {
                console.error('Error fetching workshops:', error);
            }
        }
    };

    const handleWorkshopChange = (event, setFieldValue) => {
        cleanScreen();
        const workshopId = event.target.value;
        setFieldValue('workshopId', workshopId);
    };

    const validationSchema = Yup.object({
        courseId: Yup.string().required('Course is required'),
        groupId: Yup.string().required('Group is required'),
        workshopId: Yup.string().required('Workshop is required'),
    });



    return (
        <div>
            <div className="max-w-md mx-auto mt-2 p-4 bg-white rounded shadow-md">
                <h1 className="text-2xl font-bold mb-4">Seleccione un curso, grupo, taller y equipo</h1>
                <Formik
                    initialValues={{ courseId: '', groupId: '', workshopId: '' }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        fetchTeamStudentNames(values.workshopId);
                    }}
                >
                    {({ setFieldValue }) => (
                        <Form>
                            <div className="mb-4">
                                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">Curso</label>
                                <Field as="select" name="courseId" onChange={(e) => handleCourseChange(e, setFieldValue)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    <option value="">Seleccione un curso</option>
                                    {courses.map((course) => (
                                        <option key={course._id} value={course._id}>{course.name}</option>
                                    ))}
                                </Field>
                                <ErrorMessage name="courseId" component="div" className="text-red-500 text-sm" />
                            </div>

                            {groups.length > 0 && (
                                <div className="mb-4">
                                    <label htmlFor="groupId" className="block text-sm font-medium text-gray-700">Grupo</label>
                                    <Field as="select" name="groupId" onChange={(e) => handleGroupChange(e, setFieldValue)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                        <option value="">Seleccione un grupo</option>
                                        {groups.map((group) => (
                                            <option key={group._id} value={group._id}>{group.g_Id}</option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="groupId" component="div" className="text-red-500 text-sm" />
                                </div>
                            )}

                            {workshops.length > 0 && (
                                <div className="mb-4">
                                    <label htmlFor="workshopId" className="block text-sm font-medium text-gray-700">Taller</label>
                                    <Field as="select" name="workshopId" onChange={(e) => handleWorkshopChange(e, setFieldValue)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                        <option value="">Seleccione un taller</option>
                                        {workshops.map((workshop) => (
                                            <option key={workshop._id} value={workshop._id}>{workshop.name} (Tercio {workshop.term})  Finaliza ({adjustDate(workshop.endDate)})</option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="workshopId" component="div" className="text-red-500 text-sm" />
                                </div>
                            )}

                            <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                Traer datos
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>

            <div className="mx-auto w-full flex flex-col justify-between">
                {teams.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {teams.map((team, index) => (
                            <div key={index} className="bg-white shadow-md rounded-lg p-4">
                                <h2 className="text-lg font-bold mb-2">{team.teamName}</h2>
                                <ul className="list-disc pl-5">
                                    {team.students.length > 0 ? (
                                        team.students.map((student, idx) => (
                                            <li key={idx} className="text-sm text-gray-700">{student}</li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-gray-700">No students found</li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : noTeamsMessage ? (
                    <p className="text-center text-gray-500">No existen equipos formados para este curso, grupo y taller.</p>
                ) : null}
            </div>
        </div>
    );
};

export default SeeWorkTeamStudents;
