import React, { useState, useEffect, useRef } from 'react';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../../../utils/AxiosInterceptos/interceptors"

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    genre: Yup.string().required('Genre is required'),
    roles: Yup.string().required('Roles are required').matches(/^(teacher|student|coordinator|director|admin)(-(teacher|student|coordinator|director|admin))*$/, 'Invalid input. Please use only "teacher", "student", "coordinator", "director", or "admin", separated by "-" if combining multiple roles.'),
});

const initialValues = {
    name: '',
    email: '',
    password: '',
    genre: '',
    roles: '',
};

const CreateUser = () => {
    const [validationErrors, setValidationErrors] = useState([]);
    const navigate = useNavigate();

    const parseRoles = (roles) => {
        // Split the roles by '-' and trim extra spaces
        const rolesArray = roles.split('-').map(role => role.trim());
        return rolesArray;
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const token = localStorage.getItem('token');

            // Extracting and converting roles to an array
            const rolesArray = parseRoles(values.roles);

            // Adjusting the values before sending
            const updatedValues = { ...values, roles: rolesArray };

            const response = await api.post('http://localhost:3500/users', updatedValues, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Form data sent:', response.data);
            toast.success('User created successfully.');
            setSubmitting(false);
        } catch (error) {
            const { status, data } = error.response;

            if (status === 400 && data.errors) {
                // Handle validation errors (These errors come from express-validator)
                setValidationErrors(data.errors);
                console.log("--------data.errors--------", data.errors) //Important to see the real msg
                if (Array.isArray(validationErrors)) {
                    validationErrors.forEach(error => {
                        toast.error(error.msg);
                    });
                } else {
                    toast.error('Probably the role does not exist');
                }
                validationErrors.forEach(error => {
                    toast.error(error.msg);
                });
            }
            else if (status === 400) {
                // Handle the 400 error here, for example, setting a form field error message
                toast.error('User with this email already exists');
            } else {
                console.error('Error occurred while sending form data:', error);
                toast.error('Error occurred while sending form data.');
            }

            setSubmitting(false);
        }
    };
    return (
        <div className="container mx-auto px-6 shadow-lg bg-blue-100 rounded-lg">

            <div className=" font-semibold mb-4 mt-1">Datos usuario</div>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className='bg-blue-100 rounded  pb-8 mb-4 w-full'>
                        <div className="mb-4 ">
                            <label className="block text-gray-700 text-sm font-bold mb-2 " htmlFor="name">
                                Name
                            </label>
                            <Field
                                className="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="text"
                                name="name"
                                placeholder="Name"
                            />
                            <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <Field
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="email"
                                name="email"
                                placeholder="Email"
                            />
                            <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <Field
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="password"
                                name="password"
                                placeholder="Password"
                            />
                            <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Genre</label>
                            <div className="flex mb-2">
                                <label className="mr-4">
                                    <Field type="radio" name="genre" value="male" className="mr-2" />
                                    Male
                                </label>
                                <label className="mr-4">
                                    <Field type="radio" name="genre" value="female" className="mr-2" />
                                    Female
                                </label>
                                <label>
                                    <Field type="radio" name="genre" value="other" className="mr-2" />
                                    Other
                                </label>
                            </div>
                            <ErrorMessage name="genre" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                        <div className="mb-4">
                            {/* Label for 'Roles' field with tooltip */}
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="roles"
                            >
                                Roles
                                {/* Tooltip */}
                                <span className="text-xs text-gray-600 ml-1 cursor-default">
                                    (Roles separated by -)
                                    <span className="absolute z-10 bg-gray-200 text-gray-800 text-xs py-1 px-2 rounded-md -top-8 left-0 w-max">
                                        Roles separated by -
                                    </span>
                                </span>
                            </label>
                            <Field
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="text"
                                name="roles"
                                placeholder="Roles"
                            />
                            <ErrorMessage name="roles" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                Registrarse
                            </button>
                            <button
                                className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-1 px-2 w-max rounded-lg my-2"
                                onClick={() => navigate('/admin')} // Redirect to home page
                            >
                                Terminar
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>


    );
};

export default CreateUser;
