import React, { useState, useEffect } from 'react';
import SearchForm from './SearchForm';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from "../../../utils/AxiosInterceptos/interceptors"

const DeleteUsers = () => {
    const [users, setUsers] = useState([]);
    const [token] = useState(localStorage.getItem('token'));
    const [errorMessage, setErrorMessage] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const navigate = useNavigate();

    const handleUserDelete = async () => {
        try {
            const selectedUserIds = users.filter((user) => user.checked).map((user) => user._id);
            const deleteUserResponse = await api.delete(
                'http://localhost:3500/users/deleteUser',
                {
                    data: {
                        usersToDelete: selectedUserIds,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('Delete response:', deleteUserResponse.data);
            toast.success('Users deleted successfully.');
            setUsers([]);
            setIsButtonDisabled(true); // Disable the button after deletion

        } catch (error) {
            if (error.response && error.response.status === 404) {
                setErrorMessage('Users not found');
                toast.error(errorMessage);
            } else {
                setErrorMessage('Error deleting users');
                toast.error(errorMessage);
            }
        }
    };

    const handleUserCheckbox = (userId) => {
        const updatedUsers = users.map((user) =>
            user._id === userId ? { ...user, checked: !user.checked } : user
        );
        setUsers(updatedUsers);
    };

    useEffect(() => {
        // Check if at least one user is checked to enable/disable the button
        const anyUserChecked = users.some((user) => user.checked);
        setIsButtonDisabled(!anyUserChecked);
    }, [users]);

    const handleSearchClean = () => {
        // Function to clean the search field
        // This will be passed to the SearchForm component
    };

    return (
        <div className="container mx-auto px-5 shadow-lg bg-blue-100 rounded-lg">

            <h1 className="font-semibold mb-4 mt-1">Eliminar usuarios</h1>
            <SearchForm setUsersToDelete={setUsers} onSearchClean={handleSearchClean} />
            <div className="mt-4">
                {users && users.map((user) => (
                    <div key={user._id} className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            className="mr-2"
                            checked={user.checked || false}
                            onChange={() => handleUserCheckbox(user._id)}
                        />
                        <label>{user.name}</label>
                    </div>
                ))}
            </div>


            <div className='flex justify-between py-3'>
                <button
                    onClick={handleUserDelete}
                    disabled={isButtonDisabled} // Disable the button based on state
                    className={`bg-red-500 text-white px-4 py-1 my-2 rounded ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                >
                    Eliminar usuarios seleccionados
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

export default DeleteUsers;
