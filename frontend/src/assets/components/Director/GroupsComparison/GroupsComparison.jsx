import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import api from "../../../../utils/AxiosInterceptos/interceptors";
import { GComparison } from './GComparison';

const validationSchema = Yup.object().shape({
    courseId: Yup.string().required('Course is required'),
    threshold: Yup.number().required('Threshold is required'),
});

const GroupsComparison = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedCourseName, setSelectedCourseName] = useState("");
    const [threshold, setThreshold] = useState(""); // State for selected threshold

    const [data, setData] = useState(null);

    const [token] = useState(localStorage.getItem('token'));


    const fetchData = async () => {
        try {
            const response = await api.get(`http://localhost:3500/statistics/course/${selectedCourse}/threshold/${threshold}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setData(response.data.activities);
            setLoading(false);
        } catch (error) {
            // Handle error response
            console.error('Error fetching data:', error);
            if (error.response && error.response.status === 404) {
                toast.error('No existen datos disponibles');
            } else if (error.response && error.response.status === 500) {
                toast.error('Internal Server Error');
            } else {
                // Log the entire error response during development
                console.error('Unhandled error response:', error.response);
                toast.error('An unexpected error occurred');
            }

            setData([])
        }
    };

    useEffect(() => {
        const fetchCourses = async () => {
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

        fetchCourses();
    }, []);

    const thresholds = [0.0, 1.0, 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9]; // List of thresholds

    useEffect(() => {
        // Fetch new data whenever either courseId or threshold changes
        if (selectedCourse && threshold) {
            fetchData()
        }
    }, [selectedCourse, threshold]); // Trigger effect when either selectedCourse or threshold changes

    useEffect(() => {
        if (!token) {
            // Token does not exist in local storage, handle this case
            toast.error('Token is missing or invalid');
            // You can redirect the user to the login page or show an error message
            return;
        }
    })

    if (data) { console.log("----------data----------", data) }

    return (
        <div className="container mx-auto  flex flex-col justify-center items-center">
            <div>
                <h1 className="text-2xl font-bold mb-4">Seleccione un curso y un umbral</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <Formik
                        initialValues={{ courseId: '', threshold: '' }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            console.log('Submitted:', values);
                            setSelectedCourse(values.courseId);
                            const selectedCourseObj = courses.find(course => course._id === values.courseId);
                            setSelectedCourseName(selectedCourseObj ? selectedCourseObj.name : "");
                            setThreshold(values.threshold);
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="flex flex-col">
                                    <Field as="select" name="courseId" className="mb-2">
                                        <option value="">Seleccione un curso</option>
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>
                                                {course.name}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="courseId" component="div" className="text-red-500 ml-2" />

                                    <Field as="select" name="threshold">
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
                {/* Pass selected course name and threshold as props to GComparison component */}
                {data && selectedCourse && threshold && <GComparison key={`${selectedCourse}-${threshold}`} courseName={selectedCourseName} threshold={threshold} data={data} loading={loading} />}
            </div>
        </div>
    );
};

export default GroupsComparison;
