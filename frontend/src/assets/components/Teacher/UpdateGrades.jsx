import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SelectCourseGroupsActivities from './SelectCourseGroupsActivities';   //Allow to select course, group and save students in the Redux store
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import Modal from 'react-modal';
import ModalCompetencyGrades from './ModalCompetencyGrades'             //ModalCompetencyGrades replaced CompetenciesTable
import ActivityGrades from './ActivityGrades';
import listStudentsSlice, { inputGrades } from '../../../redux/slice/listStudentsSlice';
import { clearStudentList } from "../../../redux/slice/listStudentsSlice"
import Tooltip from '../Tooltip';

import api from "../../../utils/AxiosInterceptos/interceptors"


function UpdateGrades() {
    const dispatch = useDispatch();
    const [token] = useState(localStorage.getItem("token"))
    const navigate = useNavigate();
    const [selectedCurso, setSelectedCurso] = useState('');
    const [selectedGrupo, setSelectedGrupo] = useState('');
    const [selectedActivityId, setSelectedActivityId,] = useState("");



    const [btnStates, setBtnStates] = useState([]);

    const modalRef = useRef({});
    const [gradesSavedByStudent, setGradesSavedByStudent] = useState({}); // Track grades saved for each student
    const [selectedStudentId, setSelectedStudentId] = useState(null);





    const listStudents = useSelector((state) => state.ListStudents.studentList);
    const teacherId = useSelector((state) => state.user.user.id);



    // const [listStudentS, setlistStudentS] = useState(listStudents);


    //const [studentsInGrupo, setStudentsInGrupo] = useState([]);


    const handleFormSubmit = (selectedCurso, selectedGrupo, selectedActivityId) => {

        setSelectedCurso(selectedCurso)
        setSelectedGrupo(selectedGrupo)
        setSelectedActivityId(selectedActivityId)


        // Handle the form submission data in the parent component
        console.log('Selected ProfeId:', teacherId);
        console.log('Selected Course:', selectedCurso);
        console.log('Selected Group:', selectedGrupo);
        console.log('Selected selectedActivityId:', selectedActivityId);




        // You can perform additional logic or state updates here
    };

    const initialData = [
        ['', '', '', false],
        ['', '', '', false],
        ['', '', '', false],
        ['', '', '', false],
        ['', '', '', false],
    ];

    const [tableData, setTableData] = useState(initialData);
    const [studentID, setStudentID] = useState('');

    const [buttonStates, setButtonStates] = useState(new Array(listStudents.length).fill(false));
    function isEnable(array) {
        // Only check the last element of each subarray, since that's the only element that matters for this function.
        return array.some((element) => element.scores.checked);
    }

    useEffect(() => {
        const newBtnStates = listStudents.map((stud) => {
            const checkeds = stud.scores.map((ele) => ele.checked);
            let state = checkeds.includes(true);
            return { state, id: stud.id };
        });
        console.log("newBtnStates:", newBtnStates);
        setBtnStates(newBtnStates);
    }, [listStudents]);



    const captureStudentID = (event, student) => {
        event.preventDefault();

        const id = student.id;
        setStudentID(id);

        const index = listStudents.findIndex((s) => s.id === id);

        if (index !== -1) {
            const selectedStudent = listStudents[index];

            // Generate the table data
            const updatedData = selectedStudent.scores.map((ele) => {
                const [n1, n2, n3] = [ele.n1, ele.n2, ele.n3].map(value => value === "" ? "" : parseInt(value));
                const hasNumbers = [n1, n2, n3].some(entry => typeof entry === "number");
                return [n1, n2, n3, hasNumbers];
            });

            setTableData(updatedData);

            openModal(studentID);
        }
    };



    const SendScoresToDataBase = async (studentID, selectedActivityId, updatedGrades) => {
        console.log("studentId, ActivityId, scores:", studentID, selectedActivityId, updatedGrades);

        if (selectedActivityId.length === 0) {
            toast.error("Actividad no existe");
        } else {
            try {
                const token = localStorage.getItem('token');
                console.log('Request Payload:', { scores: updatedGrades }); // Log the request payload
                const response = await api.put(
                    `http://localhost:3500/grades/UpdateStudentGrades/${studentID}/${selectedActivityId}`,
                    { scores: updatedGrades }, // Wrap the grades in an object with the 'scores' key
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                toast.success('Nota guardada exitosamente.');
                console.log('Response:', response.data); // Log the response if needed
            } catch (error) {
                if (error.response) {
                    const { status, data } = error.response;
                    if (status === 400 && data.errors) {
                        // Handle validation errors if needed
                        console.error('Validation errors:', data.errors);
                    } else {
                        console.error('Error:', error.response.data);
                        toast.error('Internal server error');
                    }
                } else {
                    console.error('Error occurred:', error.message);
                    toast.error('Error occurred while saving grades.');
                }
            }
        }
    };


    // const ConfirmSentInfoToServer = async (activityId) => {
    //     console.log(":::::::::activityId::::::", activityId);

    //     try {
    //         const response = await api.put(
    //             `http://localhost:3500/activities/${activityId}`,
    //             { completed: true },
    //             {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             }
    //         );

    //         console.log('Updated Activity:', response.data);
    //     } catch (error) {
    //         console.error('Error updating activity:', error.response.data);
    //         toast.error('Internal error server');
    //     }
    // };



    //const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const [competencies, setCompetencies] = useState([{ name: "CLF" }, { name: "UTF" }, { name: "UCM" },
    { name: "PRC" }, { name: "ULC" }]);

    const openModal = (studentId) => {


        // if (!gradesSavedByStudent[studentId]) {
        //     setSelectedStudentId(studentId);
        //     setIsModalOpen(true);
        // }
        setIsModalOpen(true);
    };

    const closeModal = () => {

        setIsModalOpen(false);

    };


    const handleRowCheck = (rowIndex, checked) => {
        const updatedData = [...tableData];
        updatedData[rowIndex][3] = checked;
        setTableData(updatedData);
    };

    const handleClear = (rowIndex, colIndex) => {
        const updatedData = [...tableData];
        updatedData[rowIndex][colIndex] = '';
        setTableData(updatedData);

    };


    const handleClearAll = () => {
        for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
            for (let colIndex = 0; colIndex < 3; colIndex++) {
                handleClear(rowIndex, colIndex)
            }
        }
    }

    const handleSetOne = () => {
        handleSetCellValue(0, 0, 1);
    };

    const handleSetCellValue = (rowIndex, colIndex, value) => {
        const updatedData = [...tableData];
        updatedData[rowIndex][colIndex] = value;
        setTableData(updatedData);

    };

    const handleSave = (e) => {
        e.preventDefault();


        const studentIdToFind = studentID; // Replace with the ID you want to find



        const index = listStudents.findIndex(student => student.id === studentIdToFind);


        const student = listStudents[index];


        //Now let us convert the table to Redux format
        const updatedGrades = tableData.map((ele, index) => {
            const n1 = ele[0] === '' ? '' : parseInt(ele[0], 10);
            const n2 = ele[1] === '' ? '' : parseInt(ele[1], 10);
            const n3 = ele[2] === '' ? '' : parseInt(ele[2], 10);
            const checked = [n1, n2, n3].some(entry => typeof entry === "number");

            return { n1, n2, n3, cp: student.scores[index].cp, checked };
        });

        console.log(":::::::::::Updated::::", updatedGrades)



        // Update the student's grades in Redux store
        dispatch(inputGrades({ studentID_: studentID, gradesParcel: updatedGrades }));

        SendScoresToDataBase(studentID, selectedActivityId, updatedGrades)


        // Update the gradesSavedByStudent state
        setGradesSavedByStudent((prev) => ({ ...prev, [studentID]: true }));
        closeModal();

    };


    const handleClose = (e) => {
        e.preventDefault();


        const studentIdToFind = studentID; // Replace with the ID you want to find

        const index = listStudents.findIndex(student => student.id === studentIdToFind);

        if (index !== -1) {
            // The student with the given ID was found at the 'index' position in the array.
            console.log('Found student at index:', index, listStudents[index].name, "studentID", studentID);
        } else {
            // The student with the given ID was not found in the array.
            console.log('Student not found with ID:', studentIdToFind);
        }
        const student = listStudents[index];


        //Now let us convert the table to Redux format
        const updatedGrades = tableData.map((ele, index) => {
            const n1 = ele[0] === '' ? '' : parseInt(ele[0], 10);
            const n2 = ele[1] === '' ? '' : parseInt(ele[1], 10);
            const n3 = ele[2] === '' ? '' : parseInt(ele[2], 10);
            const checked = [n1, n2, n3].some(entry => typeof entry === "number");

            return { n1, n2, n3, cp: student.scores[index].cp, checked };
        });

        console.log(":::::::::::Updated::::", updatedGrades)



        // Update the student's grades in Redux store
        dispatch(inputGrades({ studentID_: studentID, gradesParcel: updatedGrades }));

        closeModal()

    };



    function allStatesTrue() {
        //Returns: True if all objects have state set to true, False otherwise.
        const data = btnStates

        return data.every(item => item.state === true);
    }
    // To send grades from the Redux store to MongoDB database
    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        if (allStatesTrue() && selectedActivity !== "") {
            console.log("Form submitted!", selectedActivity);
            //ConfirmSentInfoToServer(activityId);
            dispatch(clearStudentList()); // Trigger the list clearing action
            setActivityId("")//New---------------------------------------------------
            toast.success("Las notas se han guardado exitosamente. Puede continuar subiendo notas de otro grupo o el mismo.")
            setSaveNonDuplicated([])


        } else {
            toast.error("Algunos estudiantes no tienen notas o no ha creado una actividad.")
        }

    };

    //Send data  to create new activity to server

    // Create a new activity
    const [activityId, setActivityId] = useState({});

    const createActivityInDatabase = async (data) => {
        try {
            await api.post('http://localhost:3500/activities/', data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => {
                    console.log("activityId", response.data._id)
                    setActivityId(response.data._id)
                    toast.success('Activity created')
                })
        } catch (error) {
            console.error('Error creating activity:', error);
        };
    }


    // Creaate a new activity
    const [selectedActivity, setSelectedActivity] = useState({});

    //"2024-01-22T08:00:00Z"
    const handleCreateActivity = (data) => {
        const currentDate = new Date()
        setSelectedActivity(data)
        const payload = {}
        payload.description = data.description
        payload.type = data.type
        payload.teacherId = teacherId
        payload.courseId = selectedCurso
        payload.groupId = selectedGrupo
        payload.completed = false
        payload.activityAppliedDate = currentDate.toISOString()
        payload.rubric = ["specific"]
        createActivityInDatabase(payload)
        console.log('Data submitted:', payload);

    };


    {/* */ }
    return (

        <div className="container mx-auto mt-1 flex flex-col justify-center items-center ">
            <div className='sm:w-full px-0 md:w-1/2 lg:w-1/3 xl:w-1/4 mb-2 mt-1'>
                <SelectCourseGroupsActivities
                    // setSelectedCurso={setSelectedCurso}
                    // setSelectedGrupo={setSelectedGrupo}
                    // setSelectedActivityId={setSelectedActivityId}
                    onFormSubmit={handleFormSubmit}

                />
            </div>


            {/* */}


            <div className="space-y-1 divide-y-2 divide-slate-300 w-full mt-3">

                {selectedActivityId && listStudents.map((item, index) => (
                    <div className="flex flex-col" key={item.id}>
                        <div className="font-semibold -mb-2 text-gray-800">{item.name}</div>
                        <div className="flex justify-between" key={item.id}>
                            <ActivityGrades id={item.id} />
                            <button
                                onClick={(event) => captureStudentID(event, item)}
                                id={item.id}
                                data-key={index}
                                data-type="button"
                                className={`self-center relative top-3 md:top-4 ${true
                                    ? 'bg-blue-500 hover-bg-blue-700'
                                    : 'bg-red-500 hover-bg-red-700'
                                    } text-white font-bold py-1 px-1 mx-2 rounded h-fit w-6 mt-4`}
                            >
                                <FaEdit />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="My Modal"
                shouldReturnFocusAfterClose={true}
                ariaHideApp={false}
                className="h-screen flex items-center justify-center"
                ref={modalRef}
            >
                <div>
                    <div className="flex flex-col w-full ml-0 mr-8 justify-center items-center shadow-3xl rounded-t-lg bg-blue-200 pt-4">
                        <div className="flex flex-col justify-center items-center space-x-4 w-full mx-auto pb-3">
                            <ModalCompetencyGrades
                                initialData={tableData}
                                onRowCheck={handleRowCheck}
                                onChange={(data) => setTableData(data)}
                                onClear={handleClear}
                            />
                            <div className="flex space-x-8">
                                <button
                                    onClick={handleClearAll}
                                    id="send"
                                    type="button"
                                    className="bg-blue-500 hover-bg-blue-700 text-white font-bold py-0 px-1 rounded w-20 h-fit mt-4"
                                >
                                    Limpiar
                                </button>


                                <button
                                    onClick={handleClose}
                                    id="cancel"
                                    type="button"
                                    className="bg-blue-500 hover-bg-blue-700 text-white font-bold py-0 px-1 rounded h-fit w-20 mt-4"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={handleSave}
                                    id="send"
                                    type="button"
                                    className={`bg-blue-500 hover-bg-blue-700 text-white font-bold py-0 px-1 rounded h-fit w-20 mt-4 
                                            `}

                                >
                                    Guardar
                                </button>


                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
            <form onSubmit={handleSubmit} className='w-full' >
                {selectedActivityId && listStudents.length > 0 ? <div className='  flex justify-start items-center relative'>

                    <button
                        className="bg-blue-500 hover-bg-blue-700 text-white font-bold py-1 px-2 w-max rounded-lg my-1"
                        onClick={() => navigate('/teacher')} // Redirect to teacher page
                    >
                        Terminar
                    </button>

                </div> : null}
            </form>




        </div >


    );
}

export default UpdateGrades;