import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import WorkshopSelection from './WorkshopSelection';
import api from "../../../../utils/AxiosInterceptos/interceptors";
import { FaInfoCircle } from 'react-icons/fa'; // Importing the icon
import Tooltip from './ToolTip';


const StudentsGetTheirWorkShopGrades = () => {
    const userId = useSelector((state) => state.user.user.id);
    const [token] = useState(localStorage.getItem('token'));
    const [workshopGrades, setWorkshopGrades] = useState(null);

    const handleSelectionChange = async (selection) => {
        const { workshopId, teamId } = selection;
        if (!workshopId || !teamId) return; // Prevent API call if any selection is missing

        try {
            const response = await api.post(
                'http://localhost:3500/workshop/getStudentTotalGradeInWorkshop',
                {
                    workshopId,
                    teamId,
                    peerId: userId, // Assuming userId is the peerId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setWorkshopGrades(response.data); // Assuming response.data contains the grades
        } catch (error) {
            // console.error('Error fetching workshop grades:', error);
            // toast.error('Error fetching workshop grades');
            if (error.response && error.response.data && error.response.data.message === 'Self assessment not found for this peer') {
                toast.error('Estudiante no realizó la autoevaluación');
            } else {
                toast.error('Error fetching workshop grades');
            }
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <WorkshopSelection
                studentId={userId}
                token={token}
                onSelectionChange={handleSelectionChange}
            />
            {workshopGrades && (
                <div className="mt-4 flex flex-col items-center">
                    <h2 className="text-2xl font-bold mb-4">Notas del taller</h2>

                    {/* Evaluación del profesor */}
                    <div className="bg-sky-50 w-full max-w-4xl px-6 py-4 rounded-lg mt-4 shadow-md">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg leading-6 font-medium text-pink-900">Evaluación del profesor</h3>
                            <div className="flex space-x-1 text-pink-900">
                                <span className="font-medium">Nota total:</span>
                                <span>{(workshopGrades.teamGrade ?? 0).toFixed(1)}/5.0</span>
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-lg leading-6 font-medium text-blue-600">Aspectos evaluados</h3>
                            <ul className="divide-y divide-gray-200 mt-2">
                                {workshopGrades.teamGradeDetails?.map((detail, index) => (
                                    <li key={index} className="py-4">
                                        <div className="flex justify-between">
                                            <p className="text-sm font-medium text-gray-900">{detail.topic}</p>
                                            <p className="text-sm text-gray-800">{detail.grade}</p>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">{detail.question}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Autoevaluación */}
                    <div className="bg-sky-50 w-full max-w-4xl px-6 py-4 rounded-lg mt-4 shadow-md">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg leading-6 font-medium text-pink-900">Autoevaluación</h3>
                            <div className="flex space-x-1 text-pink-900">
                                <span className="font-medium">Nota total:</span>
                                <span>{(workshopGrades.selfAssessmentGrade ?? 0).toFixed(1)}/5.0</span>
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-lg leading-6 font-medium text-blue-600">Aspectos evaluados</h3>
                            <ul className="divide-y divide-gray-200 mt-2">
                                {workshopGrades.selfAssessmentDetails?.map((section, index) => (
                                    <li key={index} className="py-4">
                                        <div className="flex justify-between">
                                            <p className="text-sm font-medium text-gray-900">{section.topic}</p>
                                        </div>
                                        <ul className="divide-y divide-gray-200 mt-2">
                                            {section.questions?.map((question, idx) => (
                                                <li key={idx} className="py-4">
                                                    <div className="flex justify-between">
                                                        <p className="text-sm font-medium text-gray-500">{question.question}</p>
                                                        <p className="text-sm text-gray-800">{question.grade}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Coevaluación */}
                    <div className="bg-sky-50 w-full max-w-4xl px-6 py-4 rounded-lg mt-4 shadow-md">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg leading-6 font-medium text-pink-900">Coevaluación</h3>
                            <div className="flex space-x-1 text-pink-900">
                                <span className="font-medium">Nota total:</span>
                                <span>{(workshopGrades.peerGrades ?? 0).toFixed(1)}/5.0</span>
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-lg leading-6 font-medium text-blue-600">Aspectos evaluados</h3>
                            <ul className="divide-y divide-gray-200 mt-2">
                                {workshopGrades.averagePeerGrades?.map((section, index) => (
                                    <li key={index} className="py-4">
                                        <div className="flex justify-between">
                                            <p className="text-sm font-medium text-gray-900">{section.topic}</p>
                                        </div>
                                        <ul className="divide-y divide-gray-200 mt-2">
                                            {section.questions?.map((question, idx) => (
                                                <li key={idx} className="py-4">
                                                    <div className="flex justify-between">
                                                        <p className="text-sm font-medium text-gray-500">{question.question}</p>
                                                        <p className="text-sm text-gray-800">{question.grade}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Nota total del taller */}
                    <div className="bg-sky-50 w-full max-w-4xl px-6 py-4 rounded-lg mt-4 shadow-md">
                        <div className="flex justify-between items-center text-blue-600">
                            <div className='flex items-center'>
                                <div className="text-lg font-medium">Nota total taller:</div>
                                <Tooltip text="Nota total= Evaluación profesor=50%, autoevaluación=25% y coevaluación=25%">
                                    <FaInfoCircle className="ml-2 text-sm text-red-400" />
                                </Tooltip>
                            </div>
                            <div className="text-lg">{(workshopGrades.totalGrade ?? 0).toFixed(1)}/5.0</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsGetTheirWorkShopGrades;