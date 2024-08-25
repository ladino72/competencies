import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from "../../../utils/AxiosInterceptos/interceptors";
import { useSelector } from 'react-redux';

const EnableMFA = () => {
    const [qrCode, setQrCode] = useState(null);
    const [apiError, setApiError] = useState(null);
    const [message, setMessage] = useState(null);
    const token = localStorage.getItem('token');
    const userId = useSelector((state) => state.user.user.id);
    const navigate = useNavigate();

    const fetchQrCode = async () => {
        try {
            const response = await api.post(
                'http://localhost:3500/mfa/enable-MFA',
                { userId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setQrCode(response.data.qrCode);
            setApiError(null);
        } catch (err) {
            console.error(err);
            setApiError('Error al traer el código QR. Por favor intente de nuevo.');
        }
    };

    const formik = useFormik({
        initialValues: {
            authCode: '',
        },
        validationSchema: Yup.object({
            authCode: Yup.string()
                .required('Por favor, ingrese el código de autenticación.'),
        }),
        onSubmit: async (values) => {
            setApiError(null);  // Clear previous API errors
            setMessage(null);  // Clear previous messages

            try {
                const response = await api.post(
                    'http://localhost:3500/mfa/verify-MFA',
                    {
                        userId: userId,
                        authCode: values.authCode.trim(),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.errors && response.data.errors.length > 0) {
                    setApiError(response.data.errors[0].msg);
                } else if (response.data.message) {
                    setMessage(response.data.message);
                    navigate('/');  // Redirect to the dashboard
                }

            } catch (err) {
                console.error('Error response:', err.response);
                setApiError('Error en verificación de código. Por favor intente de nuevo.');
            }
        },
    });

    return (
        <div className="mfa-container">
            <h2>Activar la autenticación multifactor (MFA)</h2>
            {!qrCode ? (
                <button onClick={fetchQrCode} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:bg-blue-600 mt-2">
                    Obtener código QR
                </button>
            ) : (
                <div className="flex flex-col items-center mt-4">
                    <img src={qrCode} alt="Google Authenticator QR Code" className="mb-4 w-60 h-60" />
                    <form onSubmit={formik.handleSubmit} className="flex flex-col items-center">
                        <label htmlFor="authCode">Digite el código suministrado por el autenticador de Google:</label>
                        <input
                            type="text"
                            id="authCode"
                            {...formik.getFieldProps('authCode')}
                            className="input input-bordered mt-2"
                        />
                        {formik.touched.authCode && formik.errors.authCode ? (
                            <div className="text-red-500 mt-2">{formik.errors.authCode}</div>
                        ) : null}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:bg-blue-600 mt-2"
                        >
                            Verificar código
                        </button>
                    </form>
                </div>
            )}
            {apiError && !formik.errors.authCode ? (
                <p className="text-red-500 mt-4">{apiError}</p>
            ) : null}
            {message && <p className="text-green-500 mt-4">{message}</p>}
        </div>
    );
};

export default EnableMFA;
