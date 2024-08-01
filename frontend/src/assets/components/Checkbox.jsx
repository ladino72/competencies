import React from 'react'

// Taken from https://www.codingdeft.com/posts/react-checkbox/

function Checbox({ isChecked, label, checkHandler, index }) {
    return (
        <div className='inline-flex items-center'>

            <input
                type="checkbox"
                id={`checkbox-${index}`}
                checked={isChecked}
                onChange={checkHandler}
            />

            <label className='w-12 pl-1' htmlFor={`checkbox-${index}`}>{label}</label>

        </div>
    )
}

export default Checbox