import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from "../../../../utils/AxiosInterceptos/interceptors"
import HistogramsCourse from './HistogramsCourse';

const validationSchema = Yup.object().shape({
    courseId: Yup.string().required('Course is required'),
});

const StatCourse = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState("")
    const [token] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('http://localhost:3500/courses/allcourses', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCourses(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <div className="container mx-auto  flex flex-col justify-center items-center">

                <h1 className="text-2xl font-bold mb-4">Seleccione un curso</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <Formik
                        initialValues={{ courseId: '' }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            console.log('Submitted:', values);
                            setSelectedCourse(values.courseId);
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="flex flex-col">
                                    <Field
                                        as="select"
                                        name="courseId"
                                    //className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500"
                                    >
                                        <option value="">Seleccione un curso</option>
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>
                                                {course.name}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="courseId" component="div" className="text-red-500 ml-2" />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:bg-blue-600 mt-2"
                                    disabled={isSubmitting}
                                >
                                    Traer datos
                                </button>
                            </Form>
                        )}
                    </Formik>
                )}


            </div>

            <div className='flex w-full justify-center items-center'>
                {selectedCourse && <HistogramsCourse courseId={selectedCourse} />}
            </div>
        </div>

    );
};

export default StatCourse;
