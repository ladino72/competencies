import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from "../../../../../utils/AxiosInterceptos/interceptors";
import CourseGroupCategorySelect from './CourseGroupCategorySelect';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateWorkShopAndWorkTeams = () => {
    const [token] = useState(localStorage.getItem('token'));
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [description, setDescription] = useState('');
    const [teamNames, setTeamNames] = useState([]);
    const [endDate, setEndDate] = useState(null);
    const navigate = useNavigate();

    const handleFormSubmit = (courseId, groupId, category, description, teamNamesData) => {
        setSelectedCourse(courseId);
        setSelectedGroup(groupId);
        setSelectedCategory(category);
        setDescription(description);
        setTeamNames(teamNamesData);
    };

    const submitInfo = async () => {
        const dataPackage = {
            description: description,
            groupId: selectedGroup,
            courseId: selectedCourse,
            teamNames: teamNames,
            endDate: endDate,
        };

        try {
            const response = await api.post('http://localhost:3500/workshop/createWorkshop', dataPackage, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 201 || response.status === 200) {
                toast.success('Taller y equipos creados exitosamente.');
            } else {
                toast.error('Error al crear taller y equipos.');
            }
        } catch (error) {
            console.error('Error submitting data:', error);
            if (error.response && error.response.data && error.response.data.error) {
                const errorMessage = error.response.data.error;
                if (errorMessage.includes('Nombres de equipo deben ser únicos')) {
                    toast.error(`${errorMessage}`);
                } else if (errorMessage === 'El más reciente taller que creó no tiene equipos') {
                    toast.error('El más reciente taller que creó no tiene equipos.');
                } else if (errorMessage === 'Para crear un nuevo taller, primero hay que aplicar el anterior.') {
                    toast.error('Para crear un nuevo taller, primero hay que aplicar el anterior.');
                } else {
                    toast.error(` ${errorMessage}`);
                }
            } else {
                toast.error('Internal server error');
            }
        }
    };

    useEffect(() => {
        setIsButtonDisabled(!(selectedCourse && selectedGroup && selectedCategory && description && endDate));
    }, [selectedCourse, selectedGroup, selectedCategory, description, endDate]);

    return (
        <div className="flex flex-col items-center justify-between">
            <div className="w-full max-w-md px-4 mb-6">
                <div className="shadow-lg rounded-lg">
                    <CourseGroupCategorySelect onFormSubmit={handleFormSubmit} token={token} />
                </div>
                <div className="w-full px-4 mb-1 bg-blue-100 ">

                    <label className="block font-semibold px-1">Fecha expiración:</label>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy-MM-dd HH:mm"
                        className=" px-1 mb-2 border rounded-md w-full"
                    />
                </div>

                <div className="w-full max-w-md flex justify-between items-center px-4  py-1 mb-4 -mt-2 bg-blue-100">
                    <button
                        className={`min-w-min px-2 py-1  mb-2 rounded-lg text-normal font-semibold text-white ${isButtonDisabled ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-500 text-white'
                            }`}
                        disabled={isButtonDisabled}
                        onClick={submitInfo}
                    >
                        Crear taller y equipos
                    </button>

                    <button
                        className="bg-blue-500 mb-2 hover:bg-blue-700 text-white font-bold py-1 px-2 w-max rounded-lg"
                        onClick={() => navigate('/teacher/competencyActivities')}
                    >
                        Terminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateWorkShopAndWorkTeams;
