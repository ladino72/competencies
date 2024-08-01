import React, { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
import FileUploader from './FileUpLoader';
import { useNavigate } from 'react-router-dom';

import api from "../../../utils/AxiosInterceptos/interceptors"


const CreateUsers = () => {

    const [users, setUsers] = useState([]);
    const [addedUsers, setAddedUsers] = useState([]);
    const [upLoadPress, setUpLoadPress] = useState(false);
    const navigate = useNavigate();

    const handleUploadUsers = () => {
        sendUsersToEndpoint();
        setUpLoadPress(true);
    };

    const handleFileLoad = (userData) => {
        setUsers(userData);
    };

    const handleUserChecked = (index) => {
        const updatedUsers = users.map((user, i) =>
            i === index ? { ...user, checked: !user.checked } : user
        );
        setUsers(updatedUsers);
    };


    const sendUsersToEndpoint = async () => {
        try {
            const token = localStorage.getItem('token');
            if (users.length === 0 || users.some(user => !isValidUser(user))) {
                throw new Error('Users data is not valid');
            }

            const response = await api.post('http://localhost:3500/users/addusers', { users }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 201) {
                setAddedUsers(response.data.addedUsers);

                { toast.success("Users loaded successfully") }
            }
        } catch (error) {
            if (error.message === 'Users data is not valid') {
                toast.error('Seleccione el archivo de datos');
            } else {
                // Handle other errors here
                console.error('Error handling file change:', error.message);
            }
        }
    };

    const isValidUser = (user) => {
        return 'name' in user && 'email' in user && 'password' in user && 'genre' in user && 'roles' in user;
    };

    useEffect(() => {
        if (addedUsers.length > 0) {
            const updatedUsers = users.map(user => {
                const matchingUser = addedUsers.find(addedUser => addedUser.name === user.name);
                if (matchingUser) {
                    return {
                        ...user,
                        checked: matchingUser.message === 'User added',
                        disabled: true,
                    };
                }
                return user;
            });
            setUsers(updatedUsers);
        }
    }, [addedUsers]);


    return (
        <div className="container mx-auto shadow-lg bg-blue-100 rounded-lg px-5">
            <div className="font-semibold ">Cargar lista de usuarios de un archivo .json</div>
            <FileUploader onFileLoad={handleFileLoad} />


            {users.length > 0 && (
                <ul className="w-full mt-4 px-1">
                    {users.map((user, index) => (
                        <li key={index} className={`flex justify-between items-center  ${upLoadPress ? 'justify-start' : ''}`}>
                            <div className="flex justify-between items-center w-full">
                                <div className='flex items-center'>
                                    <input
                                        type="checkbox"
                                        checked={user.checked}
                                        disabled={user.disabled}
                                        onChange={() => handleUserChecked(index)}
                                    />
                                    <div className="ml-2 ">{user.name}</div>
                                </div>


                                {upLoadPress && (
                                    <div className={`text-sm text-${user.checked ? 'blue' : 'red'}-600`}>
                                        {user.checked ? 'Usuario agregado' : 'Usuario ya esxiste'}
                                    </div>
                                )}

                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <div className='flex justify-between py-3'>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 w-max rounded-lg my-2  "
                    onClick={handleUploadUsers}
                >
                    Subir usuarios a la base de datos
                </button>
                <button
                    className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-1 px-2 w-max rounded-lg my-2"
                    onClick={() => navigate('/admin')} // Redirect to home page
                >
                    Terminar
                </button>
            </div>
        </div>
    );
};

export default CreateUsers;
