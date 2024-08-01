import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'


function ButtonArray() {
    const listStudents = useSelector((state) => state.ListStudents.studentList)
    const numButtons = listStudents.length

    // Create an array to store the state of each button
    const [buttonStates, setButtonStates] = useState(Array(numButtons).fill(false));

    // Function to toggle the state of a button at a specific index
    const toggleButtonState = (index) => {
        const newButtonStates = [...buttonStates];
        newButtonStates[index] = true
        setButtonStates(newButtonStates);
    };

    return (
        <div>
            {buttonStates.map((isClicked, index) => (
                <button
                    key={index}
                    onClick={() => toggleButtonState(index)}
                    disabled={isClicked}
                    style={{
                        backgroundColor: isClicked ? 'green' : 'red', // Change the color based on the state
                        margin: '5px',
                    }}
                >
                    Button {index + 1}
                </button>
            ))}
        </div>
    );
}

export default ButtonArray;
