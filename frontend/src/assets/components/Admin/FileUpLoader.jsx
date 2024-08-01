import React, { useState, useEffect } from 'react';

import { toast } from 'react-toastify';

const FileUploader = ({ onFileLoad }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const clearUserList = () => {
        // Clear the user list when browse button is clicked
        onFileLoad([]); // Notify parent component to clear the user list
    };

    const handleFileChange = async (event) => {

        const file = event.target.files[0];
        if (!file) return;

        try {
            setLoading(true); // Start loading when a file is selected. 

            const content = await readFileContent(file);

            await new Promise(resolve => setTimeout(resolve, 1500)); // Delay here, to see the loading message for 1.5 seg.. 
            //If we do not put this delay the message ""loading..."" appears and dissapears very quickly that it is impossible to see it because the code it is executed rapidly

            const userData = JSON.parse(content).map(user => ({ ...user, checked: false, disabled: true }));
            onFileLoad(userData);
        } catch (error) {
            console.error('Error reading file:', error);
            setError('Error reading file');
        } finally {
            setLoading(false); // Stop loading when file reading finishes or if an error occurs
        }
    };


    useEffect(() => {
        console.log("Loading state:", loading); // Will log the updated loading state
    }, [loading]);

    const readFileContent = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();

            fileReader.onload = (event) => {
                resolve(event.target.result);
            };

            fileReader.onerror = (error) => {
                reject(error);
            };

            fileReader.readAsText(file);
        });
    };

    const handleFileInputClick = () => {
        setError(null)
        clearUserList();
    };

    return (
        <div className="max-w-lg mx-auto mt-4 bg-blue-100 px-1 w-full flex flex-col">
            <div className='flex justify-start items-center space-x-2 '>
                <label htmlFor="fileInput">Seleccione archivo:</label>
                <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    onClick={handleFileInputClick}
                />
            </div>
            <div className='text-blue-600'>
                {loading && <p>Loading...</p>}

            </div>
            <div className='text-red-600'>
                {error && <p>Error: {error}</p>}
            </div>
        </div>
    );
};

export default FileUploader;