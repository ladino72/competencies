import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from "../../../../utils/AxiosInterceptos/interceptors";

const SelectCourseTeachers = ({ courseId, onTeacherSelect }) => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const fetchTeachers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`http://localhost:3500/courses/coordinator/courseId/${courseId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setTeachers(response.data.teachers);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchTeachers();
        }
    }, [courseId, token]);

    const validationSchema = Yup.object({
        teacher: Yup.string().required('Please select a teacher')
    });

    const handleSubmit = (values) => {
        onTeacherSelect(values.teacher);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className=" mx-auto mt-2">
            {/* <h1 className="text-lg font-bold mb-4">Seleccione un profesor</h1> */}
            <Formik
                initialValues={{ teacher: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {() => (
                    <Form className="space-y-4">
                        <div>
                            <Field as="select" name="teacher" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm md:text-base">
                                <option value="" label="Seleccione un profesor" />
                                {teachers.map((teacher) => (
                                    <option key={teacher._id} value={teacher._id}>
                                        {teacher.name}
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage name="teacher" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md focus:outline-none focus:bg-blue-600 mt-2"

                        >
                            Traer datos
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default SelectCourseTeachers;
