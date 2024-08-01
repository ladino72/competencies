import React, { useState } from 'react';

import { Formik, Form, Field } from 'formik';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from "../../../../../utils/AxiosInterceptos/interceptors";
import CourseGroupWorkshopTeamSelector from './CourseGroupWokshopTeamSelector';

const TeacherGroupGrade = () => {
    const [courseId, setCourseId] = useState('');
    const [groupId, setGroupId] = useState('');
    const [workshopId, setWorkshopId] = useState('');
    const [teamId, setTeamId] = useState('');
    const [grades, setGrades] = useState({});
    const [groupRubric, setGroupRubric] = useState([]);
    const [isFormValid, setIsFormValid] = useState(false);

    const teacherId = useSelector((state) => state.user.user.id);
    const token = localStorage.getItem('token');

    const handleOnSubmit = (values, groupRubric) => {
        setCourseId(values.courseId);
        setGroupId(values.groupId);
        setWorkshopId(values.workshopId);
        setTeamId(values.teamId);
        if (values.teamId === "") {
            setGroupRubric([]);
        } else {
            setGroupRubric(groupRubric);
        }
        setGrades({});
        setIsFormValid(false);
    };

    const handleGradeChange = (topicId, optionId) => {
        setGrades((prevGrades) => {
            const newGrades = {
                ...prevGrades,
                [topicId]: optionId
            };
            checkFormValidity(newGrades);
            return newGrades;
        });
    };

    const checkFormValidity = (newGrades) => {
        const isValid = groupRubric.every(topic => newGrades[topic._id] !== undefined);
        setIsFormValid(isValid);
    };

    const handleFormSubmit = async (values, { setSubmitting }) => {
        const gradesPayload = Object.keys(grades).map(topicId => ({
            topicId: topicId,
            optionId: grades[topicId]
        }));

        const payload = {
            workshopId,
            courseId,
            groupId,
            teamId,
            grades: gradesPayload
        };

        try {
            await api.post('http://localhost:3500/workshop/teacher-grades-to-teams', payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('Grades submitted successfully');
        } catch (error) {
            console.error('Error submitting grades:', error);
            if (error.response && error.response.status === 400) {
                toast.error('Already typed the notes for this team. Changes were not saved!');
            } else {
                toast.error('Error submitting grades');
            }
        }

        setSubmitting(false);
    };

    return (
        <div className="">
            <div className="pb-4">
                <CourseGroupWorkshopTeamSelector teacherId={teacherId} onSubmit={handleOnSubmit} />
            </div>

            <div className='mx-auto w-full flex flex-col'>
                {courseId && groupId && workshopId && teamId && groupRubric.length > 0 && (
                    <Formik
                        initialValues={{}}
                        onSubmit={handleFormSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                                {groupRubric.map((topic) => (
                                    <div key={topic._id} className="mb-2">
                                        <div className='bg-blue-50 shadow-md rounded-md px-1'>
                                            <h2 className="text-lg font-bold">{topic.topic}</h2>
                                            <div role="group" aria-labelledby={`radio-group-${topic._id}`}>
                                                {topic.options.map((option) => (
                                                    <label key={option._id} className="block mb-2">
                                                        <Field
                                                            type="radio"
                                                            name={`grades.${topic._id}`}
                                                            value={option._id}
                                                            checked={grades[topic._id] === option._id}
                                                            onChange={() => handleGradeChange(topic._id, option._id)}
                                                            className="form-radio h-5 w-5 text-blue-600"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-600">{`(${option.grade} ${option.grade === 1 ? 'pt' : 'pts'})`}</span>
                                                        <span className="ml-1">{option.optionText}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className='col-span-1 sm:col-span-2 lg:col-span-3 flex justify-center mt-2 mb-4'>
                                    <button
                                        type="submit"
                                        className={`px-4 py-2 font-semibold rounded ${isSubmitting || !isFormValid ? 'bg-blue-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
                                        disabled={isSubmitting || !isFormValid}
                                    >
                                        Enviar notas
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                )}
            </div>
        </div>
    );
};

export default TeacherGroupGrade;
