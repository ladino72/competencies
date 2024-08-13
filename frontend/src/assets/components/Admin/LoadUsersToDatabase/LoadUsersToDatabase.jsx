
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import api from "../../../../utils/AxiosInterceptos/interceptors";
import { toast } from 'react-toastify';

const LoadUsersToDatabase = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [jsonData, setJsonData] = useState(null);
    const [repeatedEmails, setRepeatedEmails] = useState([]);
    const [token] = useState(localStorage.getItem('token'));

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleConvert = async () => {
        if (!selectedFile) {
            alert('Please select an Excel file.');
            return;
        }

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
                alert('Invalid Excel format. Please ensure the sheet has 2 columns: Email, ID.');
                return;
            }

            // Convert data to desired format and remove duplicates based on email
            const uniqueData = jsonData.reduce((acc, current, index) => {
                if (index === 0) return acc; // Skip header row

                // Safely extract email and studentId
                const email = current[0] != null ? String(current[0]).trim() : '';
                const studentId = current[1] != null ? String(current[1]).trim() : '';

                // Ensure both email and studentId are present and not empty
                if (email && studentId) {
                    const existing = acc.find(item => item.email === email);
                    if (!existing) {
                        acc.push({ email, studentId });
                    }
                } else {
                    toast.error(`Missing or invalid email or studentId for row ${index + 1}`);
                }

                return acc;
            }, []);

            setJsonData(uniqueData);

            // Send unique data to backend to check for existing users
            try {
                const response = await api.post('http://localhost:3500/userRef/createUsers',
                    { users: uniqueData },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setJsonData(response.data.createdUsers);
                setRepeatedEmails(response.data.repeatedEmails);
            } catch (error) {
                console.error('Error sending data to backend:', error);
            }
        };

        reader.onerror = (error) => {
            console.error('Error loading file:', error);
        };
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Subir usuarios en Excel a base de datos</h1>
            <input type="file" onChange={handleFileChange} className="mb-4" />
            <button onClick={handleConvert} disabled={!selectedFile} className="bg-blue-500 text-white px-4 py-2 rounded">
                Convertir a JSON
            </button>
            {jsonData && (
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