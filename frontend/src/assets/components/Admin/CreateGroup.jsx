import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import api from "../../../utils/AxiosInterceptos/interceptors";

const CreateGroup = () => {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [coursesAndGroups, setCoursesAndGroups] = useState(null);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch courses
        api.get('http://localhost:3500/courses/allcourses', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then(response => {
                setCourses(response.data);
            })
            .catch(error => {
                setError(error.message);
            });

        // Fetch courses with groups
        api.get('http://localhost:3500/courses/courses-and-groups', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then(response => {
                setCoursesAndGroups(response.data);
            })
            .catch(error => {
                setError(error.message);
            });

        // Fetch teachers
        api.get('http://localhost:3500/users/?role=teacher', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then(response => {
                setTeachers(response.data);
            })
            .catch(error => {
                if (error.response) {
                    if (error.response.status === 404) {
                        toast.error('No users found for the provided role');
                    } else {
                        setError(error.message);
                    }
                }
            });
    }, []);

    const initialValues = {
        courseId: '',
        teacherId: '',
        g_Id: '',
    };

    const validationSchema = Yup.object().shape({
        courseId: Yup.string().required('Seleccione un curso'),
        teacherId: Yup.string().required('Seleccione un profesor'),
        g_Id: Yup.string()
            .required('Se requiere un número de grupo')
            .matches(/^0[1-9]|1[0-9]|20$/, 'El número de grupo debe estar entre 01 y 20')
            .length(2, 'El número de grupo debe tener 2 dígitos') // Ensure exactly 2 digits
            .typeError('El número de grupo debe ser una cadena de texto'),
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            const mnemonic = courses.find(obj => obj._id === values.courseId).c_Id;
            const tweakvalues = { ...values, g_Id: mnemonic + values.g_Id };

            try {
                await api.post('http://localhost:3500/groups/', tweakvalues, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Fetch updated courses with groups after successful creation
                const updatedResponse = await api.get('http://localhost:3500/courses/courses-and-groups', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                setCoursesAndGroups(updatedResponse.data);

                toast.success("Grupo creado exitosamente");
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 400) {
                        if (error.response.data.error === 'Invalid courseId') {
                            toast.error('Invalid courseId');
                        } else if (error.response.data.error === 'Invalid teacherId') {
                            toast.error('Invalid teacherId');
                        } else if (error.response.data.error === 'Group with the same g_Id already exists for the course') {
                            toast.error('Grupo con el mismo mnemonic ya existe.');
                        }
                    } else if (error.response.status === 404) {
                        if (error.response.data.error === 'Course not found with the provided courseId') {
                            toast.error('Course not found with the provided courseId');
                        } else if (error.response.data.error === 'Teacher not found with the provided teacherId') {
                            toast.error('Teacher not found with the provided teacherId');
                        }
                    }
                } else {
                    // Handle other errors (network, server down, etc.)
                    setError('An error occurred');
                }

                setSubmitting(false);
            }
        },
    });

    return (
        <div className="container mx-auto shadow-lg bg-blue-100 rounded-lg px-5 py-2">
            {error && <p>Error: {error}</p>}
            <form onSubmit={formik.handleSubmit}>
                <div className='flex flex-col'>
                    <label className='font-semibold' htmlFor="courseId">Curso:</label>
                    <select
                        name="courseId"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.courseId}
                    >
                        <option value="">Selecione un curso</option>
                        {courses.map(course => (
                            <option key={course._id} value={course._id}>{course.name}</option>
                        ))}
                    </select>
                    <div className='text-sm text-red-600'>
                        {formik.touched.courseId && formik.errors.courseId}
                    </div>
                </div>

                <div className='flex flex-col'>
                    <label className='font-semibold' htmlFor="teacherId">Profesor:</label>
                    <select
                        name="teacherId"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.teacherId}
                    >
                        <option value="">Seleccione un profesor</option>
                        {teachers.map(teacher => (
                            <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                        ))}
                    </select>
                    <div className='text-sm text-red-600'>
                        {formik.touched.teacherId && formik.errors.teacherId}
                    </div>
                </div>

                <div className='flex flex-col'>
                    <label className='font-semibold' htmlFor="g_Id">Numero de grupo:</label>
                    <input
                        type="text"
                        name="g_Id"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.g_Id}
                    />
                    <div className='text-sm text-red-600'>
                        {formik.touched.g_Id && formik.errors.g_Id}
                    </div>
                </div>

                <div className='flex justify-between py-3'>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 w-max rounded-lg my-1"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Creando...' : 'Crear grupo'}
                    </button>

                    <button
                        type="button"
                        className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-1 px-2 w-max rounded-lg my-1"
                        onClick={() => navigate('/admin')}
                    >
                        Terminar
                    </button>
                </div>
            </form>

            {coursesAndGroups && (
                <>
                    <div className='font-semibold  '> Grupos existentes:</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-1">
                        {Object.keys(coursesAndGroups).map((courseName, index) => (
                            <div className='bg-blue-200 px-1' key={index}>
                                <div className='font-semibold text-sm'> {courseName}:</div>
                                <ul className="list-disc pl-4">
                                    {coursesAndGroups[courseName].map((group, groupIndex) => (
                                        <li key={groupIndex} className="mb-1">
                                            {group.g_Id}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default CreateGroup;