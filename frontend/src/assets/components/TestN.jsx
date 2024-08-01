import React, { useState } from 'react';
import Modal from 'react-modal';
import CompetenciesTable from './CompetenciesTable';

Modal.setAppElement('#root');

const TestN = () => {
    const students = [
        { id: 1, name: 'Student 1' },
        { id: 2, name: 'Student 2' },
        { id: 3, name: 'Student 3' },
        // Add more students as needed
    ];

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div>
            <h1>List of Students</h1>
            <ul>
                {students.map((student) => (
                    <li key={student.id}>
                        {student.name}{' '}
                        <button onClick={() => openModal(student)}>Enter Grades</button>
                    </li>
                ))}
            </ul>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Enter Grades Modal"
            >
                <button onClick={closeModal}>Close</button>
                {selectedStudent && (
                    <div>
                        <h2>Enter Grades for {selectedStudent.name}</h2>

                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TestN;
