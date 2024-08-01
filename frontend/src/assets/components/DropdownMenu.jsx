// DropdownMenu.js
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const DropdownMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    if (!isOpen) {
        return (
            <button
                onClick={toggleDropdown}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
                Open Dropdown
            </button>
        );
    }

    return ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute w-48 py-2 bg-white border rounded shadow-lg">
                <ul className="p-2">
                    <li className="hover:bg-gray-100 cursor-pointer" onClick={toggleDropdown}>
                        Option 1
                    </li>
                    <li className="hover:bg-gray-100 cursor-pointer" onClick={toggleDropdown}>
                        Option 2
                    </li>
                    <li className="hover:bg-gray-100 cursor-pointer" onClick={toggleDropdown}>
                        Option 3
                    </li>
                </ul>
            </div>
        </div>,
        document.body
    );
};

export default DropdownMenu;
