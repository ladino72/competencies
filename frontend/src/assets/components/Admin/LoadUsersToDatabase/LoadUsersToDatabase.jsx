import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import api from "../../../../utils/AxiosInterceptos/interceptors";
import { toast } from 'react-toastify';

const LoadUsersToDatabase = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [jsonData, setJsonData] = useState([]);
    const [repeatedEmails, setRepeatedEmails] = useState([]);
    const [progress, setProgress] = useState(0);
    const [isConverting, setIsConverting] = useState(false);
    const [token] = useState(localStorage.getItem('token'));

    const CHUNK_SIZE = 10; // Define the size of each chunk
    const DELAY = 500; // Define the delay between chunks in milliseconds

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setJsonData([]); // Clear data on new file selection
        setRepeatedEmails([]);
        setProgress(0);
        setIsConverting(false);
    };

    const sendChunkToBackend = async (chunk, chunkIndex, totalChunks) => {
        try {
            const response = await api.post(
                'http://localhost:3500/userRef/createUsers',
                { users: chunk },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setRepeatedEmails(prev => [...prev, ...response.data.repeatedEmails]);
            setProgress(((chunkIndex + 1) / totalChunks) * 100);

            // Add newly created users to the jsonData
            setJsonData(prev => [...prev, ...response.data.createdUsers]);

        } catch (error) {
            console.error(`Error sending chunk ${chunkIndex + 1} to backend:`, error);
            toast.error(`Error sending chunk ${chunkIndex + 1} to the backend.`);
        }
    };

    const handleConvert = async () => {
        if (!selectedFile) {
            toast.error('Please select an Excel file.');
            return;
        }

        setIsConverting(true); // Disable the button

        const reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);

        reader.onload = async (event) => {
            const arrayBuffer = event.target.result;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Validate data format - Check for 2 columns
            if (jsonData[0].length !== 2) {
                toast.error('Invalid Excel format. Please ensure the sheet has 2 columns: Email, ID.');
                setIsConverting(false); // Re-enable the button
                return;
            }

            let hasInvalidRows = false;
            const uniqueData = jsonData.reduce((acc, current, index) => {
                if (index === 0) return acc; // Skip header row

                const email = current[0] ? String(current[0]).trim() : '';
                const studentId = current[1] ? String(current[1]).trim() : '';

                if (email && studentId) {
                    const existing = acc.find(item => item.email === email);
                    if (!existing) {
                        acc.push({ email, studentId });
                    }
                } else {
                    hasInvalidRows = true;
                    toast.error(
                        <>
                            <span className="text-red-500">Missing or invalid email or studentId for row {index + 1}.</span><br />
                            Please fix the errors in your file and try again.
                        </>
                    );
                }

                return acc;
            }, []);

            if (hasInvalidRows) {
                setIsConverting(false); // Re-enable the button
                return;
            }

            if (uniqueData.length > 0) {
                // Split the data into chunks
                const totalChunks = Math.ceil(uniqueData.length / CHUNK_SIZE);
                for (let i = 0; i < totalChunks; i++) {
                    const chunk = uniqueData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                    await sendChunkToBackend(chunk, i, totalChunks);
                    await new Promise(resolve => setTimeout(resolve, DELAY)); // Delay between chunk uploads
                }

                toast.success('All chunks uploaded successfully.');
            } else {
                toast.error('No valid data to send to the database.');
            }

            setIsConverting(false); // Re-enable the button after processing
        };

        reader.onerror = (error) => {
            console.error('Error loading file:', error);
            toast.error('Error loading file.');
            setIsConverting(false); // Re-enable the button on error
        };
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Subir usuarios en Excel a base de datos</h1>
            <input type="file" onChange={handleFileChange} className="mb-4" />
            <button onClick={handleConvert} disabled={!selectedFile || isConverting} className="bg-blue-500 text-white px-4 py-2 rounded">
                Convertir a JSON
            </button>
            <div className="w-full bg-gray-200 rounded-full mt-4">
                <div className="bg-blue-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${progress}%` }}>
                    {progress.toFixed(2)}%
                </div>
            </div>
            {jsonData.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold">Estudiantes agregados a la base de datos:</h2>
                    <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(jsonData, null, 2)}</pre>
                </div>
            )}
            {repeatedEmails.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold">Ya se encuentran en la base de datos:</h2>
                    <ul className="bg-red-100 p-4 rounded">
                        {repeatedEmails.map((email, index) => (
                            <li key={index}>{email}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LoadUsersToDatabase;






{/** SUMMARY
    This code provides a solution for converting an Excel file containing student information into JSON format, verifying and filtering the data to ensure only unique users are processed, and then sending this data to a backend server to create new users in a database while skipping already existing users. It also displays the list of repeated emails that are already in the database to the frontend.

Key Features:

    File Upload and Conversion:
        The React component allows the user to upload an Excel file.
        The uploaded file is read and converted into JSON format using the xlsx library.
        The code ensures the Excel file has exactly two columns: Email and ID.
    Data Filtering:
        The code removes duplicate emails and student IDs from the uploaded data to ensure uniqueness.
    Data Verification and User Creation:
        The filtered data is sent to a backend API using Axios with an authorization bearer token.
        The backend verifies which users already exist in the database based on their email or student ID.
        Only new users are inserted into the database; existing users are skipped.
    Feedback to Frontend:
        The backend sends back the list of created users and repeated emails to the frontend.
        The frontend displays the JSON output of the created users and lists the repeated emails.

Code Components

1. Frontend (React Component):

    LoadUsersToDatabase: The main React component that handles file upload, data conversion, and communication with the backend.
    State Management: Manages the selected file, JSON data, and repeated emails using React's useState hook.
    File Handling: Uses FileReader to read and convert the Excel file into JSON format.
    Data Filtering: Removes duplicate entries based on email and student ID.
    API Call: Sends the filtered data to the backend with an authorization bearer token and handles the response.

2. Backend (Express Route):

    createNewUserN: An Express route handler that verifies the data against existing database entries, inserts new users, and returns the list of created users and repeated emails.
    Database Interaction: Uses MongoDB to check for existing users and insert new users.
    Error Handling: Manages potential errors during the database operations and sends appropriate responses to the frontend.

By combining these components, the code provides a seamless solution for processing and managing student data efficiently while ensuring data integrity and security through verification and authorization mechanisms.
    
    */}