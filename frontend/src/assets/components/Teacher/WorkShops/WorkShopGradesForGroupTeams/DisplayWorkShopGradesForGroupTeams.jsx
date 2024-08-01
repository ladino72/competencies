import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import { toast } from 'react-toastify';
import api from "../../../../../utils/AxiosInterceptos/interceptors";
import CourseGroupWorkshopTeamSelector from "./CourseGroupWokshopTeamSelector"

import { useSelector } from 'react-redux';

const DisplayWorkShopGradesForGroupTeams = () => {
    const [workshopId, setWorkshopId] = useState('');
    const [gradesData, setGradesData] = useState(null);
    const teacherId = useSelector((state) => state.user.user.id);
    const token = localStorage.getItem('token');

    const handleOnSubmit = (values) => {
        setWorkshopId(values.workshopId);
    };

    const handleSelectionChange = () => {
        setGradesData(null);
    };

    useEffect(() => {
        if (workshopId) {
            const fetchGrades = async () => {
                try {
                    const response = await api.post(
                        'http://localhost:3500/workshop/getTotalWorkshopGradeForStudentsInGroup',
                        { workshopId },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    setGradesData(response.data);
                } catch (error) {
                    toast.error('Error fetching workshop grades');
                    console.error(error);
                }
            };

            fetchGrades();
        }
    }, [workshopId, token]);

    return (
        <div className="container mx-auto p-4">
            <div className="pb-4">
                <CourseGroupWorkshopTeamSelector
                    teacherId={teacherId}
                    onSubmit={handleOnSubmit}
                    onSelectionChange={handleSelectionChange}
                />
            </div>

            {gradesData && gradesData.workshopResults.map(team => (
                <div key={team.teamName} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">{team.teamName}</h2>
                    {team.teamResults.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="py-2 px-4 border border-gray-300">Nombre</th>
                                        <th className="py-2 px-4 border border-gray-300">Profesor</th>
                                        <th className="py-2 px-4 border border-gray-300">Autoevaluación</th>
                                        <th className="py-2 px-4 border border-gray-300">Coevaluación</th>
                                        <th className="py-2 px-4 border border-gray-300 whitespace-nowrap">Nota total/5.0</th>
                                        <th className="py-2 px-4 border border-gray-300">Comentario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {team.teamResults.map(student => (
                                        <tr key={student.peerId}>
                                            <td className="py-2 px-4 border border-gray-300">{student.userName}</td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">{student.teamGrade ?? 0.0}</td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">
                                                {student.selfAssessmentGrade !== undefined ? student.selfAssessmentGrade.toFixed(1) : 0.0}
                                            </td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">
                                                {student.peerGrades !== undefined ? student.peerGrades.toFixed(1) : 0.0}
                                            </td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">
                                                {student.totalGrade !== undefined ? student.totalGrade.toFixed(1) : 0.0}
                                            </td>
                                            <td className="py-2 px-4 border border-gray-300 text-center text-red-500">
                                                {student.errors ? student.errors.join(', ') : ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-600">No students in this team.</p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default DisplayWorkShopGradesForGroupTeams;