import React, { useState } from 'react';

function ColorChangingButtons() {
    const [activeButton, setActiveButton] = useState(null);

    const buttonColors = ['bg-blue-500', 'bg-blue-500', 'bg-blue-500', 'bg-blue-500'];

    const handleButtonClick = (index) => {
        setActiveButton(index);
    };

    return (
        <div>
            {buttonColors.map((color, index) => (
                <button
                    key={index}
                    className={`w-16 h-16 rounded-full m-2 ${index === activeButton ? 'bg-red-500' : 'bg-blue-500'} text-white`}
                    onClick={() => handleButtonClick(index)}
                >
                    Button {index + 1}
                </button>
            ))}
        </div>
    );
}

export default ColorChangingButtons;
