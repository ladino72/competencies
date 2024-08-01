import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import CustomSelectGroup from './SignupComponents/CustomSelectGroup';
import RadioGroupGenre from './SignupComponents/RadioGroupGenre';
import CustomTextInput from './SignupComponents/CustomTextInput';
import CustomPasswordInput from "./SignupComponents/CustomPasswordInput";
import AdditionalInfoCollection from "./AdditionalInfoCollection";
import api from "../../utils/AxiosInterceptos/interceptors";

const optionsGenre = [
    { value: 'male', label: 'Hombre' },
    { value: 'female', label: 'Mujer' },
    { value: 'other', label: 'Otro' },
];

const emailValidation = Yup.string()
    .email('Invalid email address')
    .test('emailDomain', 'Email contains invalid characters or domain is not allowed', function (value) {
        const validDomains = ['@mail.escuelaing.edu.co', '@escuelaing.edu.co'];
        if (!value) return true;
        const validEmailPattern = /^[^\s!\"#%&'\/\/()?=¿\[\]{}\s]+@[^\s!\"#%&'\/\/()?=¿\[\]{}\s]+\.[^\s!\"#%&'\/\/()?=¿\[\]{}\s]+$/;
        return validDomains.some(domain => value.endsWith(domain) && validEmailPattern.test(value));
    });

const schema = Yup.object().shape({
    name: Yup.string()
        .required('Favor digite su nombre')
        .matches(/^[a-zA-Z ]+$/, 'Name can only contain letters and spaces')
        .test('consecutiveChar', 'Name cannot have 3 consecutive identical letters', (value) => {
            const regex = /(aaa|bbb|ccc|ddd|eee|fff|ggg|hhh|iii|jjj|kkk|lll|mmm|nnn|ooo|ppp|qqq|rrr|sss|ttt|uuu|vvv|www|xxx|yyy|zzz)$/i;
            return !regex.test(value);
        })
        .max(50, 'Name cannot be longer than 50 characters')
        .min(10, "Name cannot be shorter than 10 characters"),
    email: emailValidation.required('Email is required'),
    password: Yup.string().required('Please enter your password').min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
        .required('Por favor confirme su contraseña')
        .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir'),
    studentId: Yup.string()
        .required('Por favor ingrese su código de estudiante')
        .matches(/^\d+$/, 'El código debe contener solo dígitos')
        .min(6, 'El código tener al menos 6 dígitos'),
    genre: Yup.string().required('Please select your gender'),
});

const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '', // Ensure the field name matches your form
    studentId: '',
    genre: '',
    confirmationCheckbox: false, // Initialize with the correct initial value
};

const SignUpN = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [registered, setRegistered] = useState(false);
    const [groups, setGroups] = useState({});
    const errorShownRef = useRef(false);
    const [confirmation, setConfirmation] = useState(false);
    const [data, setData] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);
    const [warning_message, setWarning_message] = useState("");
    const [reg, setReg] = useState(0);

    const generateWarningMessage = () => {
        let message = '';
        if (reg === 2) {
            message = 'Recuerda, solo puedes editar tus grupos una vez más después de enviarlos. ¡Asegúrate de que todo esté correcto!';
        } else if (reg === 1) {
            message = 'Esta es la última vez que puedes hacer cambios en los grupos, ¡Asegúrate de que todo esté correcto!';
        }
        setWarning_message(message);
    };

    const handleRegistration = async (values) => {
        if (confirmation) {
            try {
                const response = await api.post('http://localhost:3500/signUpBasic', {
                    name: values.name,
                    email: values.email,
                    studentId: values.studentId,
                    password: values.password,
                    genre: values.genre,
                });

                const { token, ...datos } = response.data;
                localStorage.setItem('token', token);
                setToken(token);
                setData(datos);
                setRegistered(true);
                setReg(response.data.regCount);

                if (response.data.regCount === 2 || response.data.regCount === 1) {
                    toast.success('Sign-up successful!');
                }
            } catch (error) {
                const { status, data } = error.response;

                if (status === 400 && data.errors) {
                    setValidationErrors(data.errors);
                    validationErrors.forEach(error => {
                        toast.error(error.msg);
                    });
                } else if (status === 403) {
                    if (data.error === 'No changes allowed. Limit reached.') {
                        setErrorMessage('El proceso de registro terminó.');
                        toast.error('El proceso de registro terminó.');
                    } else {
                        console.log('Forbidden: Access denied.');
                        toast.error('Acceso denegado.');
                    }
                } else if (status === 400 && data.error === 'Invalid credentials') {
                    setErrorMessage(data.error);
                    toast.error('Credenciales inválidas');
                } else {
                    console.log("error", error);
                }
            }
        } else {
            toast.error('Please confirm before submitting.');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!token) {
                    return;
                }
                const response = await api.get('http://localhost:3500/courses/courses-and-groups', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = response.data;
                setGroups(data);
            } catch (error) {
                if (!errorShownRef.current) {
                    errorShownRef.current = true;
                    if (error.response) {
                        console.log(error.response.data);
                        console.log(error.response.status);
                        toast.error('Failed to fetch data. Please try again later.');
                    } else if (error.request) {
                        console.log(error.request);
                        toast.error('No response received. Please try again.');
                    } else {
                        console.log('Error', error.message);
                        toast.error('An error occurred. Please try again.');
                    }
                }
            }
        };

        fetchData();
    }, [token]);

    useEffect(() => {
        generateWarningMessage();
    }, [reg]);

    const handleAdditionalInfo = async (values) => {
        const token = localStorage.getItem('token');
        try {
            const response = await api.post('http://localhost:3500/signUpGroups', {
                selectedGroups: [
                    values.fume,
                    values.fime,
                    values.fimel,
                    values.fiem,
                    values.fieml,
                    values.fcop,
                    values.fcopl,
                ].filter(Boolean),
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

            toast.success('Registro completo!');
            navigate('/');
        } catch (error) {
            const { status, data } = error.response;

            if (status === 403) {
                setErrorMessage(data.error);
                toast.error(errorMessage);
            }
            if (status === 400 && data.error.startsWith('Group with ID')) {
                const groupId = data.error.match(/\d+/)[0];
                toast.error(`Grupo con ID ${groupId} excedió su aforo`);
            } else {
                console.log("error", error);
            }
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-8 px-2">
            <h1 className="text-2xl font-bold mb-4">Registrarse</h1>

            {warning_message && (
                <p className={`text-sm ${reg === 2 ? 'text-blue-500' : 'text-red-500'}`}>
                    {warning_message}
                </p>
            )}

            {data.regCount === 0 && (
                <p className='text-red-600 '>El registro ha concluido. No se permiten modificaciones adicionales.</p>
            )}

            {data.regCount !== 0 && registered ? (
                <AdditionalInfoCollection groups={groups} handleSubmit={handleAdditionalInfo} />
            ) : (
                <Formik
                    initialValues={initialValues}
                    validationSchema={schema}
                    onSubmit={(values) => {
                        handleRegistration(values);
                    }}
                >

                    {({ handleChange, values, touched, errors, resetForm }) => (
                        <Form className='w-full flex flex-col justify-between items-center'>
                            <div className="w-full">
                                <CustomTextInput
                                    label="Nombre"
                                    type="text"
                                    name="name"
                                    placeholder="Escriba su nombre: Camilo Andres Mendoza Alvarez"
                                />
                            </div>
                            {/* User email*/}
                            <div className="w-full">
                                <CustomTextInput
                                    label="Email"
                                    type="email"
                                    name="email"
                                    placeholder="Escriba su correo electrónnico"
                                />
                            </div>
                            {/* User password */}
                            <div className="flex w-full space-x-2 -ml-2 -mr-2">
                                <CustomPasswordInput
                                    label="Contraseña"
                                    name="password"
                                    placeholder="Escriba su contraseña"
                                />
                                {/* confirm user password */}
                                <CustomPasswordInput
                                    label="Confirme su contraseña"
                                    name="confirmPassword"
                                    placeholder="Confirme su contraseña"
                                />
                            </div>
                            <div className="flex w-full space-x-2 -ml-2">
                                <CustomPasswordInput
                                    label="Código Id"
                                    type="password"
                                    name="studentId"
                                    placeholder="Escriba su código Id"
                                />
                            </div>
                            <div className="self-start mb-2">
                                <RadioGroupGenre name="genre" label="Género" options={optionsGenre} />
                                <ErrorMessage name="genre" component="div" className="text-red-600" />
                            </div>

                            <div className="self-start mb-2">
                                <Field
                                    type="checkbox"
                                    id="confirmationCheckbox"
                                    name="confirmationCheckbox"
                                    checked={confirmation}
                                    onChange={() => setConfirmation(!confirmation)}
                                    className="mr-2"
                                />
                                <label htmlFor="confirmationCheckbox" className="text-sm">
                                    Confirmo la información suministrada
                                </label>
                            </div>

                            <div className="flex justify-between w-full mt-4">
                                <button
                                    type="button"
                                    onClick={() => resetForm()}
                                    className="flex justify-center items-center bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none"
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="flex justify-center items-center bg-yellow-500 text-white font-bold py-2 px-4 rounded focus:outline-none"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex justify-center items-center bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none"
                                >
                                    Registrarse
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </div>
    );
};

export default SignUpN;
