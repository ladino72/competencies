import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import api from "../../../../../utils/AxiosInterceptos/interceptors";
import { useNavigate } from 'react-router-dom';


const StudentsGradesDeactivated = ({ studentList, selectedGroup, removeStudentsFromList }) => {
    const dispatch = useDispatch();
    const [token] = useState(localStorage.getItem('token'));
    const teacherId = useSelector((state) => state.user.user.id);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [activeStudents, setActiveStudents] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        setActiveStudents(studentList);
    }, [studentList]);

    const onSubmit = async () => {
        try {
            await api.put(
                `http://localhost:3500/grades/setStatusGrade/${selectedGroup}/deactivate`,
                {
                    students: selectedStudents,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('Data sent successfully');
            removeStudentsFromList(selectedGroup, selectedStudents);
            toast.success('Students deactivated successfully');
            setSelectedStudents([]); // Limpiar la selección después de la desactivación
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error deactivating students');
        }
    };

    return (
        <div className="container mx-auto mt-4">
            <h1 className="text-normal text-blue-600 mb-4">Seleccione los estudiantes que no desee que aparezcan en la lista porque cancelaron el curso. <span className="text-red-600">Advertencia:</span> una vez retirados del grupo estos no aparecerán más en la lista.</h1>
            <div className="flex flex-col">
                {activeStudents && activeStudents.map((student, index) => (
                    <div key={student.id} className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            id={`student${index}`}
                            value={student.id}
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => {
                                const studentId = e.target.value;
                                setSelectedStudents(prevSelectedStudents => {
                                    if (e.target.checked) {
                                        return [...prevSelectedStudents, studentId];
                                    } else {
                                        return prevSelectedStudents.filter(id => id !== studentId);
                                    }
                                });
                            }}
                        />
                        <label htmlFor={`student${index}`} className="ml-2">{student.name}</label>
                    </div>
                ))}
                <div className='flex justify-between items-center '>
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 w-max rounded-lg my-1"
                        onClick={onSubmit}
                        disabled={selectedStudents.length === 0}
                    >
                        Deshabilitar estudiantes
                    </button>
                    <button
                        className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-1 px-2 w-max rounded-lg my-1"
                        onClick={() => navigate('/teacher')} // Redirect to teacher page
                    >
                        Terminar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StudentsGradesDeactivated;
