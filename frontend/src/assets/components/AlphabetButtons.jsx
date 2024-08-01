import React, { useState, useEffect } from 'react';

const AlphabetButtons = ({ onLetterClick }) => {
    const alphabet = '1ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const [activeLetter, setActiveLetter] = useState(null);

    // Use useEffect to set the initial active letter only once
    useEffect(() => {
        if (!activeLetter) {
            setActiveLetter('1'); // Set the initial active letter to '1' on the first render
            onLetterClick('1'); // Call the callback function with the initial active letter
        }
    }, [activeLetter, onLetterClick]);

    const handleButtonClick = (letter) => {
        setActiveLetter(letter);
        onLetterClick(letter); // Call the callback function with the clicked letter
    };

    return (
        <div className="flex space-x-2">
            {alphabet.split('').map((letter, index) => (
                <div key={index} className="group relative">
                    <button
                        className={`py-0.5 px-2 rounded-lg  ${index === 0 ? 'w-10' : 'w-7'}  flex items-center justify-center ${activeLetter === letter ? 'bg-red-500 text-white' : 'bg-blue-500 text-gray-100'} group-hover:bg-yellow-400 group-hover:text-black transition-colors`}
                        onClick={() => handleButtonClick(letter)}
                    >
                        {letter === '1' ? 'All' : letter}
                    </button>
                    {index === 0 && (
                        <span className="hidden group-hover:block absolute left-full ml-2  transform -translate-y-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded z-10 w-36 top-[-8px]"> {/* Adjust the top displacement here */}
                            This is the first button
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AlphabetButtons;




