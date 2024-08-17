import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux'
import { setUseR } from '../../redux/slice/userSlice/userSlice';

import CustomTextInput from './LoginComponents/CustomTextInput';
import RadioGroupRole from './LoginComponents/RadioGroupRole';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../permissions/AuthContext';


const roles = [
    { label: 'Student', value: 'student' },
    { label: 'Teacher', value: 'teacher' },
    { label: 'Coordinator', value: 'coordinator' },
    { label: 'Director', value: 'director' },
    { label: 'Admin', value: 'admin' },
];

const LoginN = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const dispatch = useDispatch();

    const initialValues = {
        email: '',
        password: '',
        role: ''
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email address').required('Email is required'),
        role: Yup.string().required('Please select a role'),
        password: Yup.string().required('Password is required'),
    });

    const handleSubmit = async (values) => {
        try {
            const response = await axios.post('http://localhost:3500/loginN', {
                email: values.email,
                password: values.password,

            },);



            const { token } = response.data;


            // Decode token to get user data
            const decodedToken = jwtDecode(token);
            if (decodedToken) {
                const { user } = decodedToken;
                const { id, name, roles } = user;

                console.log('--From loginN, User info:--', { id, name, roles });
                // Save the token to local storage
                localStorage.setItem('token', token);

                console.log("You try to log in as:", values.role, roles)
                if (roles.includes(values.role)) {

                    console.log("You are logged in as:::", values.role)
                    const newUseWithRealRole = {
                        id: user.id,
                        name: user.name,
                        role: values.role// Extract the first role
                    };
                    console.log("newUseWithRealRole:", newUseWithRealRole)
                    dispatch(setUseR(newUseWithRealRole));
                    setUser({ role: values.role })


                    // Redirect to dashboard or any other route after successful login
                    //navigate('/');
                    navigate('/phys/mfa');

                }
                else {
                    toast.error('Unauthorized access');
                    dispatch(setUser(null));
                    // Redirect to login upon fail to login
                    navigate('/phys');
                }

            } else {
                // Handle decoding failure
                toast.error('Failed to decode token.');
            }


        } catch (error) {
            // Handle login error
            toast.error('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className='w-full'>
            <div className="max-w-lg mx-auto mt-8 px-4">
                <h1 className="text-2xl font-bold mb-2">Login</h1>


                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        handleSubmit(values);
                    }}
                >
                    {({ handleSubmit }) => (
                        <Form onSubmit={handleSubmit}>
                            {/* User email */}
                            <CustomTextInput
                                label="Email"
                                type="email"
                                name="email"
                                placeholder="Digite su correo electrónico"
                                fullWidth // Pass a prop to set full width
                            />

                            <RadioGroupRole name="role" label="Seleccione un rol" options={roles} />

                            {/* User password */}
                            <CustomTextInput
                                label="Contraseña"
                                type="password"
                                name="password"
                                placeholder="Digite su contraseña"
                                fullWidth // Pass a prop to set full width
                            />

                            {/* Submit button */}
                            <button
                                type="submit"
                                className="flex justify-center items-center bg-blue-500 text-white font-bold py-2 mt-2 px-4 rounded focus:outline-none"
                            >
                                Login
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default LoginN;
