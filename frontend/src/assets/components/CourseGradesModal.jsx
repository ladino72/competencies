import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import listStudentsSlice, { inputGrades } from '../../redux/slice/listStudentsSlice';
import ActivityGrades from '../components/ActivityGrades';
import { FaEdit } from 'react-icons/fa';
import Modal from 'react-modal';
import CompetenciesTable from './CompetenciesTable';

//import StudentList from '../components/StudentList';
import TeacherStudentSelector from './TeacherStudentSelector';
import CourseGroupsSelector from './CourseGroupsSelector';
import TeacherSelectionComponent from './TeacherSelectionComponent';



function CourseGradesModal() {

    const dispatch = useDispatch();

    const teacher = useSelector((state) => state.teachers.selectedTeacher);
    const course = useSelector((state) => state.courses.selectedCourse);
    const group = useSelector((state) => state.groups.selectedGroup);
    const student = useSelector((state) => state.students.selectedStudent);


    const listStudents = useSelector((state) => state.ListStudents.studentList);

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
        return array.some((element) => element.grades.checked);
    }

    const btnstates = listStudents.map(stud => {
        const checkeds = stud.grades.map(ele => ele.checked)
        let state = checkeds.includes(true)
        return { state, id: stud.id }
    }
    )


    const [isOpen, setIsOpen] = useState(false);
    const [competencies, setCompetencies] = useState([{ name: "CLF" }, { name: "UTF" }, { name: "UCM" },
    { name: "PRC" }, { name: "ULC" }]);

    const openModal = () => {

        setIsOpen(true);
    };

    const closeModal = () => {
        resetModal();
    };

    const resetModal = () => {
        setIsOpen(false);

    };


    const captureStudentID = (event) => {
        event.preventDefault();
        const id = event.currentTarget.id;
        setStudentID(id);

        const index = listStudents.findIndex((student) => student.id === id);

        if (index !== -1) {
            const student = listStudents[index];


            // Generate the table data
            const updatedData = student.grades.map((ele) => {
                // Extract values of n1, n2, and n3 properties and convert them to integers
                const [n1, n2, n3] = [ele.n1, ele.n2, ele.n3].map(value => value === "" ? "" : parseInt(value));

                // Check if the array contains any numbers
                const hasNumbers = [n1, n2, n3].some(entry => typeof entry === "number");

                // Return a new row of data with the hasNumbers flag
                return [n1, n2, n3, hasNumbers];
            });

            console.log("CaptureStudentID--------------------->", updatedData)


            setTableData(updatedData);

        }

        openModal();
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

            return { n1, n2, n3, cp: student.grades[index].cp, checked };
        });

        // Update the student's grades in Redux
        dispatch(inputGrades({ studentID_: studentID, gradesParcel: updatedGrades }));

        closeModal()

    };

    //console.log(`------From the App store:---------\n `)
    teacher ? console.log(`teacherId:${teacher.teacherId}`) : console.log("")
    course ? console.log(`courseId:${course.course}`) : console.log("")
    group ? console.log(`groupId:${group.group}`) : console.log("")
    student ? console.log(`groupId:${student.studentId}`) : console.log("")


    return (
        <div className="container mx-auto w-full mt-20">
            <div className="space-y-1 divide-y-2 divide-slate-300">
                {listStudents.map((item, index) => (
                    <div className="flex flex-col" key={item.id}>
                        <div className="font-semibold -mb-2 text-gray-800">{item.name}</div>
                        <div className="flex justify-between" key={item.id}>
                            <ActivityGrades id={item.id} />
                            <button
                                onClick={captureStudentID}
                                id={item.id}
                                data-key={index}
                                data-type="button"
                                className={`self-center relative top-3 md:top-4 ${!btnstates[index].state
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


            <hr className='py-5' />

            <CourseGroupsSelector />

            <TeacherStudentSelector />
            <Modal
                isOpen={isOpen}
                onRequestClose={closeModal}
                contentLabel="My Modal"
                shouldReturnFocusAfterClose={true}
                ariaHideApp={false}
                className="h-screen flex items-center justify-center"
            >
                <form>
                    <div className="flex flex-col w-full ml-0 mr-8 justify-center items-center shadow-3xl rounded-t-lg bg-blue-200 pt-4">
                        <div className="flex flex-col justify-center items-center space-x-4 w-full mx-auto pb-3">
                            <CompetenciesTable
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
                                    onClick={handleSave}
                                    id="send"
                                    type="button"
                                    className="bg-blue-500 hover-bg-blue-700 text-white font-bold py-0 px-1 rounded h-fit w-20 mt-4"
                                >
                                    Guardar
                                </button>

                                <button
                                    onClick={closeModal}
                                    id="cancel"
                                    type="button"
                                    className="bg-blue-500 hover-bg-blue-700 text-white font-bold py-0 px-1 rounded h-fit w-20 mt-4"
                                >
                                    Cerrar
                                </button>


                            </div>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default CourseGradesModal;
