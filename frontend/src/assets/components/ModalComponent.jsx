import React from "react";
import Modal from "react-modal";
import { useState } from "react";
import CourseGrades from "./CourseGrades";
import InputGrades from "../pages/InputGrades"

const ModalComponent = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    return (
        <div className="w-full">
            <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-4 border border-blue-500 hover:border-transparent rounded" onClick={openModal}>Input Grades</button>

            <Modal
                isOpen={isOpen}
                onRequestClose={closeModal}
                contentLabel="My Modal"
                shouldReturnFocusAfterClose="true"

                className="flex flex-col h-screen justify-center items-center "
            >
                <div className="w-full justify-center items-center ">
                    <div className="modal-header">
                        <p className="flex justify-center items-center">Registro de notas</p>
                    </div>
                    <div >
                        <CourseGrades />
                    </div>
                    <div className="flex justify-center items-center">
                        <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-4 border border-blue-500 hover:border-transparent rounded" onClick={closeModal}>Close</button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

export default ModalComponent;