import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook
import api from "../../../utils/AxiosInterceptos/interceptors";
import { useSelector } from 'react-redux';

const EnableMFA = () => {
    const [qrCode, setQrCode] = useState(null);
    const [authCode, setAuthCode] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const token = localStorage.getItem('token');
    const userId = useSelector((state) => state.user.user.id);
    const navigate = useNavigate(); // Initialize the useNavigate hook

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
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch QR code. Please try again.');
        }
    };

    const handleAuthCodeSubmit = async (e) => {
        e.preventDefault();
        setError(null);  // Clear previous errors
        setMessage(null);  // Clear previous messages

        try {
            const response = await api.post(
                'http://localhost:3500/mfa/verify-MFA',
                {
                    userId: userId,
                    authCode: authCode.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Check for errors in the response
            if (response.data.errors && response.data.errors.length > 0) {
                setError(response.data.errors[0].msg);
            } else if (response.data.message) {
                setMessage(response.data.message);
                navigate('/');  // Redirect to the dashboard page as the user passed the security measures: correct password and MFA (multi factor authentication)
            }

        } catch (err) {
            console.error('Error response:', err.response);  // Log the full response
            setError('Failed to verify code. Please try again.');
        }
    };

    return (
        <div className="mfa-container">
            <h2>Enable Multi-Factor Authentication (MFA)</h2>
            {!qrCode ? (
                <button onClick={fetchQrCode} className="btn btn-primary">
                    Get QR Code
                </button>
            ) : (
                <div>
                    <img src={qrCode} alt="Google Authenticator QR Code" />
                    <form onSubmit={handleAuthCodeSubmit} className="mt-4">
                        <label htmlFor="authCode">Enter the code from Google Authenticator:</label>
                        <input
                            type="text"
                            id="authCode"
                            value={authCode}
                            onChange={(e) => setAuthCode(e.target.value)}
                            className="input input-bordered mt-2"
                            required
                        />
                        <button type="submit" className="btn btn-success mt-4">
                            Verify Code
                        </button>
                    </form>
                </div>
            )}
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {message && <p className="text-green-500 mt-4">{message}</p>}
        </div>
    );
};

export default EnableMFA;
