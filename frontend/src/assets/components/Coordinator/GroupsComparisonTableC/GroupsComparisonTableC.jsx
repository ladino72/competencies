import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import api from "../../../../utils/AxiosInterceptos/interceptors";
import GComparisonC from './GComparisonC';
import SelectCourse from './SelectCourse';
import { useSelector } from 'react-redux';

const validationSchema = Yup.object().shape({
    threshold: Yup.number().required('Threshold is required'),
});

const GroupsComparisonTableC = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [threshold, setThreshold] = useState("");
    const [data, setData] = useState(null);
    const [token] = useState(localStorage.getItem('token'));
    const [courseIds, setCourseIds] = useState(null);
    const coordinatorID = useSelector((state) => state.user.user.id);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [error, setError] = useState(null);

    const handleCourseSelect = (courseId) => {
        setSelectedCourseId(courseId);
        console.log('Selected Course ID:', courseId);
    };

    const fetchData = async () => {
        try {
            const response = await api.get(`http://localhost:3500/statistics/course/${selectedCourseId}/threshold/${threshold}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setData(response.data.activities);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response && error.response.status === 404) {
                toast.error('No existen datos disponibles');
            } else if (error.response && error.response.status === 500) {
                toast.error('Internal Server Error');
            } else {
                console.error('Unhandled error response:', error.response);
                toast.error('An unexpected error occurred');
            }
            setData([]);
        }
    };

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`http://localhost:3500/courses/coordinator/${coordinatorID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCourseIds(response.data.courses);
            } catch (err) {
                if (err.response) {
                    if (err.response.status === 404) {
                        setError(err.response.data.message || 'No courses found for this coordinator.');
                        toast.error(err.response.data.message || 'No courses found for this coordinator.');
                    } else {
                        setError(`Server responded with status ${err.response.status}: ${err.response.data.message || err.response.statusText}`);
                        toast.error(`Server responded with status ${err.response.status}: ${err.response.data.message || err.response.statusText}`);
                    }
                } else if (err.request) {
                    setError('No response received from the server. Please try again later.');
                    toast.error('No response received from the server. Please try again later.');
                } else {
                    setError(`Error in setting up the request: ${err.message}`);
                    toast.error(`Error in setting up the request: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        if (coordinatorID) {
            fetchCourses();
        }
    }, [coordinatorID, token]);

    const thresholds = [0.0, 1.0, 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9];

    useEffect(() => {
        if (selectedCourseId && threshold) {
            fetchData();
        }
    }, [selectedCourseId, threshold]);

    useEffect(() => {
        if (!token) {
            toast.error('Token is missing or invalid');
            return;
        }
    }, [token]);

    if (data) {
        console.log("----------data----------", data);
    }

    return (
        <div className="container mx-auto flex flex-col justify-center items-center">
            <div className="flex justify-center items-center ">
                {courseIds && <SelectCourse courses={courseIds} onCourseSelect={handleCourseSelect} />}
            </div>
            <div>
                <h1 className="text-lg font-bold mb-4">Seleccione un umbral</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <Formik
                        initialValues={{ courseId: '', threshold: '' }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            setThreshold(values.threshold);
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="flex flex-col">
                                    <Field as="select" name="threshold" className="mb-2 p-2 border rounded">
                                        <option value="">Seleccione un umbral</option>
                                        {thresholds.map((value, index) => (
                                            <option key={index} value={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="threshold" component="div" className="text-red-500 ml-2" />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md focus:outline-none focus:bg-blue-600 mt-2"
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
                {data && selectedCourseId && threshold && <GComparisonC key={`${selectedCourseId}-${threshold}`} threshold={threshold} data={data} loading={loading} />}
            </div>
        </div>
    );
};

export default GroupsComparisonTableC;
