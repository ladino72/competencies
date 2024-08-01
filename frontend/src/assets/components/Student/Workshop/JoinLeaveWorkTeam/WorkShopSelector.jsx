import React, { useState, useEffect } from 'react';
import api from "../../../../../utils/AxiosInterceptos/interceptors";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import moment from 'moment-timezone';
import { toast } from 'react-toastify';

const WorkshopSelector = ({ studentId, token }) => {
    const [courses, setCourses] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedWorkshop, setSelectedWorkshop] = useState('');
    const [teamInfo, setTeamInfo] = useState([]);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [currentGroupId, setCurrentGroupId] = useState('');
    const [isWorkshopEnded, setIsWorkshopEnded] = useState(false);

    const adjustDate = (isoDate) => {
        moment.locale('es');
        const colombiaTimezone = 'America/Bogota';
        const formattedDate = moment.tz(isoDate, colombiaTimezone).format('YYYY-MM-DD HH:mm');
        const now = moment().tz(colombiaTimezone).format('YYYY-MM-DD HH:mm');

        if (now > formattedDate) {
            toast.error("La fecha de unirse a un grupo ya expiró");
            setIsWorkshopEnded(true);
        } else {
            setIsWorkshopEnded(false);
        }

        return formattedDate;
    };

    const fetchWorkshops = async () => {
        try {
            const response = await api.get(`http://localhost:3500/workshop/getAllWorkshopsNew/studentId/${studentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const workshopsData = response.data.workshops;
            const uniqueCourses = [...new Map(workshopsData.map(workshop => [workshop.courseDetails._id, workshop.courseDetails])).values()];
            setCourses(uniqueCourses);
            setWorkshops(workshopsData);
        } catch (error) {
            console.error('Error fetching workshops:', error);
        }
    };

    useEffect(() => {
        fetchWorkshops();
    }, [token]);

    useEffect(() => {
        if (selectedWorkshop) {
            const selectedWorkshopInfo = workshops.find(workshop => workshop._id === selectedWorkshop);
            if (selectedWorkshopInfo) {
                adjustDate(selectedWorkshopInfo.endDate);
                setTeamInfo(selectedWorkshopInfo.teams);
                const studentTeam = selectedWorkshopInfo.teams.find(team => team.students.some(student => student._id === studentId));
                setCurrentTeam(studentTeam);
                setCurrentGroupId(selectedWorkshopInfo.groupId);
            }
        } else {
            setTeamInfo([]);
            setCurrentTeam(null);
            setCurrentGroupId('');
            setIsWorkshopEnded(false);
        }
    }, [selectedWorkshop, workshops, studentId]);

    const initialValues = {
        course: '',
        workshop: '',
        team: ''
    };

    const validationSchema = Yup.object({
        course: Yup.string().required('Course is required'),
        workshop: Yup.string().required('Workshop is required'),
        team: Yup.string().required('Team is required')
    });

    const joinTeam = async (values) => {
        if (isWorkshopEnded) {
            toast.error('No puedes unirte a un equipo porque el taller ha terminado.');
            return;
        }

        const { course, workshop, team } = values;
        const selectedWorkshopInfo = workshops.find(w => w._id === workshop);

        const payload = {
            studentId,
            workshopName: selectedWorkshopInfo.name,
            teamName: team,
            courseId: course,
            term: selectedWorkshopInfo.term,
            groupId: currentGroupId
        };

        try {
            await api.post('http://localhost:3500/workshop/joinTeam', payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            await fetchWorkshops();
            setSelectedWorkshop(workshop);
        } catch (error) {
            console.error('Error joining team:', error);
        }
    };

    const removeStudentFromTeam = async () => {
        if (!currentTeam || isWorkshopEnded) {
            toast.error('No puedes salir del equipo porque el taller ha terminado.');
            return;
        }

        const payload = {
            studentId,
            workshopId: selectedWorkshop,
            teamId: currentTeam._id
        };

        try {
            await api.post('http://localhost:3500/workshop/removeStudentFromTeam', payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            await fetchWorkshops();
            setSelectedWorkshop(selectedWorkshop);
        } catch (error) {
            console.error('Error removing student from team:', error);
        }
    };

    return (
        <div className="flex flex-col justify-between items-center p-4">
            <h1 className="text-2xl font-bold mb-4">Seleccione un curso y taller</h1>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={joinTeam}
            >
                {({ setFieldValue }) => (
                    <Form>
                        <div className="mb-4">
                            <label htmlFor="course" className="block text-lg font-medium mb-2">Curso</label>
                            <Field as="select" name="course" className="p-2 border rounded" style={{ width: '24rem' }} onChange={(e) => {
                                const courseId = e.target.value;
                                setFieldValue('course', courseId);
                                setSelectedCourse(courseId);
                                setSelectedWorkshop('');
                                setTeamInfo([]);
                                setCurrentTeam(null);
                                setCurrentGroupId('');
                                setIsWorkshopEnded(false);
                            }}>
                                <option value="">Seleccione un curso</option>
                                {courses.map(course => (
                                    <option key={course._id} value={course._id}>
                                        {course.name} ({course.c_Id})
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage name="course" component="div" className="text-red-500 text-sm mt-2" />
                        </div>

                        {selectedCourse && (
                            <div className="mb-4">
                                <label htmlFor="workshop" className="block text-lg font-medium mb-2">Taller</label>
                                <Field as="select" name="workshop" className="p-2 border rounded" style={{ width: '24rem' }} onChange={(e) => {
                                    const workshopId = e.target.value;
                                    setFieldValue('workshop', workshopId);
                                    setSelectedWorkshop(workshopId);
                                }}>
                                    <option value="">Seleccione un taller</option>
                                    {workshops.filter(workshop => workshop.courseDetails._id === selectedCourse).map(workshop => (
                                        <option key={workshop._id} value={workshop._id}>
                                            {workshop.name} (Tercio: {workshop.term}) - Finaliza: {moment.tz(workshop.endDate, 'America/Bogota').format('YYYY-MM-DD HH:mm')}
                                        </option>
                                    ))}
                                </Field>
                                <ErrorMessage name="workshop" component="div" className="text-red-500 text-sm mt-2" />
                            </div>
                        )}

                        {teamInfo.length > 0 && !isWorkshopEnded && (
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold mb-2">Equipos</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {teamInfo.map(team => (
                                        <div key={`${team._id}-${team.name}`} className="p-4 border rounded shadow">
                                            <Field type="radio" name="team" value={team.name} id={`team-${team._id}`} className="mr-2" />
                                            <label htmlFor={`team-${team._id}`} className="font-medium">{team.name}</label>
                                            <ul className="mt-2">
                                                {team.students.map(student => (
                                                    <li key={student._id} className={`pl-2 ${student._id === studentId ? 'text-blue-500' : ''}`}>
                                                        {student.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                                <ErrorMessage name="team" component="div" className="text-red-500 text-sm mt-2" />
                            </div>
                        )}

                        <div className="flex justify-between mt-4">
                            <button type="submit" className="p-2 bg-blue-500 text-white rounded" disabled={teamInfo.length === 0 || isWorkshopEnded}>
                                Unirse a un equipo
                            </button>
                            {currentTeam && !isWorkshopEnded && (
                                <button type="button" className="p-2 bg-red-500 text-white rounded" onClick={removeStudentFromTeam}>
                                    Retirarse de un equipo
                                </button>
                            )}
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default WorkshopSelector;
