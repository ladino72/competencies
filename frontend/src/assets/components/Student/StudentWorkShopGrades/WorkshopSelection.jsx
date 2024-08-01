import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from "../../../../utils/AxiosInterceptos/interceptors";
import Tooltip from "./ToolTip";
import { FaInfoCircle } from 'react-icons/fa'; // Importing the icon


const findWorkshopIdByTeamId = (courses, selectedTeam) => {
    for (const course of courses) {
        for (const workshop of course.workshops) {
            const team = workshop.teams.find(team => team._id === selectedTeam);
            if (team) {
                return workshop._id;
            }
        }
    }
    return null;
};

const WorkshopSelection = ({ token, studentId, onSelectionChange }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                const response = await api.get(
                    `http://localhost:3500/workshop/getAllWorkShopsToEnterGrades/studentId/${studentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setCourses(response.data.workshopsByCourse_Groups);
            } catch (error) {
                console.error('Error fetching workshops:', error);
            }
        };

        fetchWorkshops();
    }, [studentId, token]);

    const formik = useFormik({
        initialValues: {
            teamId: '',
        },
        validationSchema: Yup.object({
            teamId: Yup.string().required('Team is required'),
        }),
        onSubmit: () => { }, // Empty onSubmit function, submission handled in parent component
    });

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);
        setSelectedTeam('');
        formik.setFieldValue('teamId', '');
    };

    const handleTeamChange = (e) => {
        const teamId = e.target.value;
        setSelectedTeam(teamId);
        formik.handleChange(e);

        // Call onSelectionChange directly on team change
        const foundWorkshopId = findWorkshopIdByTeamId(courses, teamId);
        onSelectionChange({
            workshopId: foundWorkshopId,
            teamId: teamId
        });
    };

    function extractGroupNumber(str) {
        const regex = /\d+$/;
        const match = str.match(regex);
        return match ? match[0] : '';
    }

    return (
        <div className="container mx-auto p-4 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">Seleccione un curso y equipo</h1>
            <form className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="course" className="block text-gray-700 font-bold mb-2">
                        Seleccione un curso:
                    </label>
                    <select
                        id="course"
                        name="course"
                        onChange={handleCourseChange}
                        value={selectedCourse || ''}
                        className="block w-full bg-white border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                            <option key={course.courseDetails._id} value={course.courseDetails._id}>
                                {`${course.courseDetails.name} (Grupo:${extractGroupNumber(
                                    course.courseDetails.g_Id
                                )})`}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedCourse && (
                    <div className="mb-4">
                        <label htmlFor="team" className="block text-gray-700 font-bold mb-2">
                            Seleccione un equipo:
                        </label>
                        <select
                            id="team"
                            name="team"
                            onChange={handleTeamChange}
                            value={formik.values.teamId || ''}
                            className="block w-full bg-white border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Team</option>
                            {courses
                                .find((course) => course.courseDetails._id === selectedCourse)
                                .workshops.flatMap((workshop) => workshop.teams.map((team) => (
                                    <option key={team._id} value={team._id}>
                                        {team.name} ({workshop.name} - Tercio {workshop.term})
                                    </option>
                                )))}
                        </select>
                    </div>
                )}
            </form>
        </div>
    );
};

export default WorkshopSelection;