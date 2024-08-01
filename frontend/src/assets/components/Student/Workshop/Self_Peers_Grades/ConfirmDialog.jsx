// ConfirmDialog.js
import React from 'react';
import Modal from 'react-modal';

const ConfirmDialog = ({ isOpen, onRequestClose, onConfirm, message }) => (
    <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Confirmation Dialog"
        className="modal"
        overlayClassName="overlay"
    >
        <div className="p-4">
            <h2 className="text-lg mb-4">{message}</h2>
            <div className="flex justify-end">
                <button
                    onClick={onRequestClose}
                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md mr-2"
                >
                    Cancelar
                </button>
                <button
                    onClick={onConfirm}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md"
                >
                    Confirmar
                </button>
            </div>
        </div>
    </Modal>
);

export default ConfirmDialog;
