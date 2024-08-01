import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import WorkshopSelection from './WorkshopSelection';
import api from "../../../../../utils/AxiosInterceptos/interceptors";

const Self_Peers_Grades = () => {
    const userId = useSelector((state) => state.user.user.id);
    const [token] = useState(localStorage.getItem('token'));
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [selectedPeer, setSelectedPeer] = useState(null);
    const [selfAssessmentQuestions, setSelfAssessmentQuestions] = useState([]);
    const [peerAssessmentQuestions, setPeerAssessmentQuestions] = useState([]);
    const [responses, setResponses] = useState([]);
    const [evaluationStatus, setEvaluationStatus] = useState([]);

    useEffect(() => {
        const fetchSelfAssessmentQuestions = async () => {
            try {
                const response = await api.get('http://localhost:3500/workshop/get-student-rubric', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSelfAssessmentQuestions(response.data);
            } catch (error) {
                toast.error('Failed to fetch self-assessment questions.');
            }
        };

        const fetchPeerAssessmentQuestions = async () => {
            try {
                const response = await api.get('http://localhost:3500/workshop/get-peer-rubric', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPeerAssessmentQuestions(response.data);
            } catch (error) {
                toast.error('Failed to fetch peer-assessment questions.');
            }
        };

        fetchSelfAssessmentQuestions();
        fetchPeerAssessmentQuestions();
    }, [token]);

    useEffect(() => {
        if (selectedPeer) {
            if (selectedPeer === userId) {
                setResponses(selfAssessmentQuestions.map(topic => ({
                    topic: topic.topic,
                    questions: topic.questions.map(question => ({ questionId: question._id, questionText: question.question_text, grade: 0 }))
                })));
            } else {
                setResponses(peerAssessmentQuestions.map(topic => ({
                    topic: topic.topic,
                    questions: topic.questions.map(question => ({ questionId: question._id, questionText: question.question_text, grade: 0 }))
                })));
            }
        }
    }, [selectedPeer, selfAssessmentQuestions, peerAssessmentQuestions, userId]);

    const handleSelectionChange = ({ selectedTeam, workshopId, selectedPeer }) => {
        setSelectedTeam(selectedTeam);
        setSelectedWorkshop(workshopId);
        setSelectedPeer(selectedPeer);
    };

    const handleGradeChange = (topicIndex, questionIndex, grade) => {
        const newResponses = [...responses];
        newResponses[topicIndex].questions[questionIndex].grade = grade;
        setResponses(newResponses);
    };

    const fetchEvaluationStatus = async () => {
        if (selectedTeam && selectedWorkshop) {
            try {
                const response = await api.get('http://localhost:3500/workshop/getSelfPeerEvaluationStatus', {
                    params: { workshopId: selectedWorkshop, selectedTeam, userId },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEvaluationStatus(response.data);
            } catch (error) {
                console.error('Failed to fetch evaluation status:', error);
                toast.error('Failed to fetch evaluation status.');
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if any grade is zero
        const hasZeroGrade = responses.some(response =>
            response.questions.some(question => question.grade === 0)
        );

        if (hasZeroGrade) {
            const confirmSubmit = window.confirm('Algunas notas son cero. Está seguro que quiere enviar las notas?');
            if (!confirmSubmit) {
                return;
            }
        }

        const payload = {
            workshopId: selectedWorkshop,
            teamId: selectedTeam,
            peerStudentId: selectedPeer,
            givenById: userId,
            responses: responses.map(response => ({
                topic: response.topic,
                questions: response.questions.map(question => ({
                    questionId: question.questionId,
                    questionText: question.questionText,
                    grade: parseInt(question.grade) // Ensure this is an integer
                }))
            }))
        };

        api.put('http://localhost:3500/workshop/selfPeerGrades', payload, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                toast.success("Grades submitted successfully!");
                fetchEvaluationStatus(); // Refetch evaluation status after submission
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    toast.error("You have already submitted grades for this peer.");
                } else {
                    toast.error("Failed to submit grades.");
                }
            });
    };

    useEffect(() => {
        fetchEvaluationStatus();
    }, [selectedTeam, selectedWorkshop, userId, token]);

    return (
        <>
            <div>
                <WorkshopSelection
                    studentId={userId}
                    token={token}
                    onSelectionChange={handleSelectionChange}
                    evaluationStatus={evaluationStatus}
                />
            </div>
            <div className='flex w-full justify-center items-center'>
                {selectedPeer && (
                    <form onSubmit={handleSubmit} className="max-w-7xl bg-white p-2 mt-4">
                        <div className="text-2xl text-center text-blue-600 font-bold mb-2">Auto evaluación y Coevaluación</div>

                        <div className='text-blue-600 py-2 text-center'>Autoevaluarse y evaluar a otros debe hacerse con justicia y honestidad </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {responses.map((response, topicIndex) => (
                                <div key={topicIndex} className="bg-gray-100 p-4 rounded-lg shadow-inner">
                                    <h3 className="text-xl font-bold mb-2">{response.topic}</h3>
                                    {response.questions.map((question, questionIndex) => (
                                        <div key={questionIndex} className="mb-2">
                                            <label className="block text-gray-700 mb-1">{question.questionText}</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="5"
                                                value={question.grade}
                                                onChange={(e) => handleGradeChange(topicIndex, questionIndex, parseInt(e.target.value))}
                                                className="block w-full bg-white border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mb-4">
                            <button
                                type="submit"
                                className="min-w-min bg-blue-500 text-white py-2 px-4 rounded-md focus:outline-none focus:bg-blue-600 mt-4"
                            >
                                Enviar notas
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
};

export default Self_Peers_Grades;
