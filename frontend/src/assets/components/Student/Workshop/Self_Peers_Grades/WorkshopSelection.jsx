import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from "../../../../../utils/AxiosInterceptos/interceptors";
import Tooltip from "./ToolTip";
import { FaInfoCircle } from 'react-icons/fa';
import moment from 'moment-timezone';
import { toast } from 'react-toastify';

const WorkshopSelection = ({ token, studentId, onSelectionChange, evaluationStatus }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedPeer, setSelectedPeer] = useState(null);
    const [peers, setPeers] = useState([]);
    const [workshopId, setWorkshopId] = useState('');
    const [isWorkshopEnded, setIsWorkshopEnded] = useState(false);

    const adjustDate = (isoDate) => {
        moment.locale('es');
        const colombiaTimezone = 'America/Bogota';
        return moment.tz(isoDate, colombiaTimezone).format('YYYY-MM-DD HH:mm');
    };

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

    useEffect(() => {
        if (courses && selectedTeam) {
            const foundWorkshopId = findWorkshopIdByTeamId(courses, selectedTeam);
            setWorkshopId(foundWorkshopId || '');
            onSelectionChange({ selectedTeam, workshopId: foundWorkshopId, selectedPeer });
        }
    }, [courses, selectedTeam, selectedPeer, onSelectionChange]);

    useEffect(() => {
        if (workshopId) {
            const selectedWorkshop = courses.flatMap(course => course.workshops).find(workshop => workshop._id === workshopId);
            if (selectedWorkshop) {
                const now = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm');
                const workshopEndDate = adjustDate(selectedWorkshop.endDate);

                if (now > workshopEndDate) {
                    toast.error("La fecha de unirse a un grupo ya expiró");
                    setIsWorkshopEnded(true);
                } else {
                    setIsWorkshopEnded(false);
                }
            }
        }
    }, [workshopId, courses]);

    const formik = useFormik({
        initialValues: {
            teamId: '',
            peers: '',
        },
        validationSchema: Yup.object({
            teamId: Yup.string().required('Team is required'),
            peers: Yup.string().required('Peer selection is required'),
        }),
        onSubmit: () => { },
    });

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);
        setSelectedTeam('');
        setSelectedPeer(null);
        formik.setFieldValue('teamId', '');
        formik.setFieldValue('peers', '');
        setPeers([]);
    };

    const handleTeamChange = (e) => {
        const teamId = e.target.value;
        const selectedCourseObj = courses.find(
            (course) => course.courseDetails._id === selectedCourse
        );
        const selectedTeamObj = selectedCourseObj.workshops.reduce((acc, workshop) => {
            const team = workshop.teams.find((team) => team._id === teamId);
            return team ? team : acc;
        }, null);
        setPeers(selectedTeamObj.students);
        formik.setFieldValue('peers', '');
        setSelectedTeam(teamId);
        setSelectedPeer(null);
        formik.handleChange(e);
    };

    const handlePeerChange = (e) => {
        const peerId = e.target.value;
        setSelectedPeer(peerId);
        formik.handleChange(e);
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
                                        {team.name} ({workshop.name} - Tercio {workshop.term}) - Finaliza: ({adjustDate(workshop.endDate)})
                                    </option>
                                )))}
                        </select>
                    </div>
                )}
                {peers.length > 0 && !isWorkshopEnded && (
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">
                            Seleccione un miembro del equipo para evaluar:
                        </label>
                        {peers.map((peer) => {
                            const peerStatus = evaluationStatus.find(status => status.peerId === peer._id);
                            const isEvaluated = peerStatus ? peerStatus.hasSubmitted : false;
                            return (
                                <div key={peer._id} className="flex items-center mb-2">
                                    <input
                                        type="radio"
                                        id={peer._id}
                                        name="peers"
                                        value={peer._id}
                                        onChange={handlePeerChange}
                                        checked={formik.values.peers === peer._id}
                                        disabled={isEvaluated}
                                        className={`mr-2 form-radio text-blue-600 h-4 w-4 ${isEvaluated ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                    <label
                                        htmlFor={peer._id}
                                        className={`text-gray-700 ${isEvaluated ? 'opacity-50' : ''}`}
                                    >
                                        {peer.name}
                                    </label>
                                    {isEvaluated && (
                                        <Tooltip text="Este estudiante ya ha sido evaluado">
                                            <FaInfoCircle className="ml-2 text-sm text-red-400" />
                                        </Tooltip>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </form>
        </div>
    );
};

export default WorkshopSelection;
