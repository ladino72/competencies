import React from 'react';

const GModal = ({ isOpen, onClose, content }) => {
    return (
        <div
            className={`fixed top-0 left-0 w-full h-full bg-black opacity-79 z-50 flex justify-center items-center ${isOpen ? '' : 'hidden'}`}
            id="modal"
        >
            <div className="bg-sky-100 rounded p-4 mx-auto w-1/2 z-51">
                <h2 className="text-black">{content}</h2>
                <p className="text-black">This is some content that will be displayed in the modal.</p>
                <button className="btn mt-4" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default GModal;

