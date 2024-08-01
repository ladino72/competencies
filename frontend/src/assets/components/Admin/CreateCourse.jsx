import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../../../utils/AxiosInterceptos/interceptors"

const CreateCourse = () => {
    const [coordinators, setCoordinators] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [token] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();


    useEffect(() => {
        // Fetch coordinator data
        api.get('http://localhost:3500/users/?role=coordinator', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // Replace YOUR_TOKEN with the actual token
            },
        })
            .then(response => {
                setCoordinators(response.data);
            })
            .catch(error => {
                console.error('Error fetching coordinators:', error);
            });

        // Fetch course data
        api.get('http://localhost:3500/admin', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // Replace YOUR_TOKEN with the actual token
            },
        })
            .then(response => {

                // const cursos = response.data.courses.map(course => [course.name, course.c_Id]);
                //console.log("::Cursos:::", cursos)
                setCourses(response.data.courses);
            })
            .catch(error => {
                console.error('Error fetching courses:', error);
            });
    }, []);

    const formik = useFormik({
        initialValues: {
            coordinator: '',
            selectedCourse: '',
        },
        validationSchema: Yup.object({
            coordinator: Yup.string().required('Seleccione un coordinador'),
            selectedCourse: Yup.string().required('Seleccione un curso'),
        }),

        onSubmit: async values => {
            const courseDetails = courses.find(course => course.c_Id === values.selectedCourse);
            console.log("course details:::", courseDetails)
            if (!courseDetails) {
                toast.error('Course details not found');
                return;
            }

            try {
                await api.post('http://localhost:3500/courses/', {
                    name: courseDetails.name,
                    c_Id: courseDetails.c_Id,
                    coordinator: values.coordinator,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                toast.success('Curso creado exitosamente.');
            } catch (error) {
                // Handle API errors
                if (error.response && error.response.data && error.response.data.errors) {
                    // Update formik errors with the server validation errors
                    const serverErrors = {};
                    error.response.data.errors.forEach(error => {
                        serverErrors[error.param] = error.msg;
                    });
                    formik.setErrors(serverErrors);
                } else {
                    // Handle errors other than express-validator errors

                    const { status, data } = error.response;

                    if (status === 400 && data && data.error === 'Course with the same name already exists') {
                        toast.error('Course with the same name already exists');
                    } else if (status === 400 && data && data.error === 'Invalid coordinatorId') {
                        toast.error('Invalid coordinatorId');
                    }
                    else {
                        // Log the entire error response during development
                        console.error('Unhandled error response:', data);
                        toast.error('Internal error server');
                    }
                }
            }
        },
    });

    useEffect(() => {
        if (selectedCourse) {
            const courseDetails = courses.find(course => course.c_Id === selectedCourse);
            if (courseDetails) {
                setSelectedCourse(courseDetails.c_Id);
            }
        }
    }, [selectedCourse, courses]);


    return (
        <div className="container mx-auto shadow-lg bg-blue-100 rounded-lg px-5 " >
            <form onSubmit={formik.handleSubmit}>
                <div className='flex flex-col w-full'>

                    <div className='flex flex-col'>
                        <label htmlFor="selectedCourse" className='font-semibold'>Curso</label>
                        <select
                            id="selectedCourse"
                            name="selectedCourse"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.selected}
                            className="w-full"

                        >
                            <option value="">Seleccione un curso</option>
                            {courses.map(course => (
                                <option key={course._id} value={course.c_Id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                        <div className='text-red-600 text-sm'>
                            {formik.touched.selectedCourse && formik.errors.selectedCourse ? (
                                <div>{formik.errors.selectedCourse}</div>
                            ) : null}
                        </div>
                    </div>
                    <div className='flex flex-col'>
                        <label htmlFor="coordinator" className='font-semibold'>Coordinador</label>
                        <select
                            id="coordinator"
                            name="coordinator"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.coordinator}
                            className="w-full"
                        >
                            <option value="">Seleccione un Coordinador</option>
                            {coordinators.map(coordinator => (
                                <option key={coordinator._id} value={coordinator._id}>
                                    {coordinator.name}
                                </option>
                            ))}
                        </select>
                        <div className='text-red-600 text-sm'>
                            {formik.touched.coordinator && formik.errors.coordinator ? (
                                <div>{formik.errors.coordinator}</div>
                            ) : null}
                        </div>
                    </div>

                    <div className='flex justify-between py-3'>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 w-max rounded-lg my-1  "
                        >
                            Crear curso
                        </button>
                        <button
                            className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-1 px-2 w-max rounded-lg my-1"
                            onClick={() => navigate('/admin')} // Redirect to home page
                        >
                            Terminar
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateCourse;
