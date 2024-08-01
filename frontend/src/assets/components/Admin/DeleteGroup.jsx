import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../../../utils/AxiosInterceptos/interceptors";

const DeleteGroup = () => {
    const [coursesAndGroups, setCoursesAndGroups] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const apiUrl = 'http://localhost:3500/courses/courses-and-groups';

    useEffect(() => {
        // Fetch courses and groups
        api.get(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then(response => {
                setCoursesAndGroups(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [token]);

    const formik = useFormik({
        initialValues: {
            courseId: '',
            groupId: '',
        },
        validationSchema: Yup.object().shape({
            courseId: Yup.string().required('Seleccione un curso'),
            groupId: Yup.string().required('Seleccione un grupo'),
        }),
        onSubmit: async (values) => {

            //console.log('Form Values::::', formik.values);

            try {
                setIsSubmitting(true);

                // Delete the selected group
                await api.delete(`http://localhost:3500/groups/${values.groupId}/delete`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log('Group deleted successfully.');
                toast.success("Grupo eliminado exitosamente.");

                // Update the list of courses and groups after deletion
                const response = await api.get(apiUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                setCoursesAndGroups(response.data);
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

                    if (status === 400 && data && data.error === 'Invalid groupId') {
                        toast.error('Invalid group ID. Please provide a valid group ID.');
                    } else if (status === 404 && data && data.error === 'Group not found with the provided groupId') {
                        toast.error('Group not found. Please provide a valid group ID.');
                    } else if (status === 404 && data && data.error === 'Corresponding course not found for the group') {
                        toast.error('Corresponding course not found for the group.');
                    } else {
                        // Log the entire error response during development
                        console.error('Unhandled error response:', data);
                        toast.error('An error occurred while deleting the group');
                    }
                }
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return (
        <div className="container mx-auto shadow-lg bg-blue-100 rounded-lg px-5 py-2">
            <form onSubmit={formik.handleSubmit}>
                <div className='flex flex-col'>
                    <label className='font-semibold' htmlFor="courseId">Curso:</label>
                    <select
                        name="courseId"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.courseId}
                    >
                        <option value="">Seleccione un curso</option>
                        {Object.keys(coursesAndGroups).map(course => (
                            <option key={course} value={course}>{course}</option>
                        ))}
                    </select>
                    <div className='text-sm text-red-600'>
                        {formik.touched.courseId && formik.errors.courseId}
                    </div>
                </div>

                <div className='flex flex-col'>
                    <label className='font-semibold' htmlFor="groupId">Grupo:</label>
                    <select
                        name="groupId"
                        disabled={!formik.values.courseId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.groupId}
                    >
                        <option value="">Seleccione un grupo</option>
                        {formik.values.courseId && coursesAndGroups[formik.values.courseId]?.map(group => (
                            <option key={group.id} value={group.id}>{group.g_Id}</option>
                        ))}
                    </select>
                    <div className='text-sm text-red-600'>
                        {formik.touched.groupId && formik.errors.groupId}
                    </div>
                </div>

                <div className='flex justify-between py-3'>
                    <button
                        type="submit"
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 w-max rounded-lg my-1"
                        disabled={!formik.values.courseId || !formik.values.groupId || isSubmitting}
                    >
                        {isSubmitting ? 'Eliminando...' : 'Eliminar grupo'}
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

            {/* Display updated list of courses and groups */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(coursesAndGroups).map(course => (
                    <div className='bg-blue-200 px-1' key={course}>
                        <h3 className='font-semibold'>{course}</h3>
                        {coursesAndGroups[course]?.length > 0 && (
                            <ul className="list-disc pl-4">
                                {coursesAndGroups[course].map(group => (
                                    <li key={group.id}>{group.g_Id}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeleteGroup;
