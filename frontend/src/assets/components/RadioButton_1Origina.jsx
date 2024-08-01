import React, { useState } from 'react'


function RadioButton_1({ course, setCourse, phys }) {


    const onOptionChange = e => {
        setCourse(e.target.value)

    }

    const options = [
        {
            id: "mecánica",
            value: "Mecánica"
        },
        {
            id: "electromagnetismo",
            value: "Electromagnetismo",
        },
        {
            id: "termodinámica y ondas",
            value: "Termodinámica y Ondas"
        }
    ]

    return (
        <div className=" w-full mt-4 text-gray-900 ">
            <div className='font-roboto'>{phys}</div>

            {
                options.map(option =>
                    <div key={option.id}>
                        <div className='inline-flex items-center space-x-2 '>
                            <input className="checked:bg-blue-500 checked:hover:bg-blue-500 checked:active:bg-blue-500 checked:focus:bg-blue-500 focus:bg-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                type="radio"
                                name={option.name}
                                value={option.value}
                                id={option.id}
                                checked={course === option.value}
                                onChange={onOptionChange}
                            />
                            <span className='text-black text-sm'> <label htmlFor={option.id}>{option.value}</label></span>

                        </div>
                    </div>
                )
            }



        </div >
    )
}


export default RadioButton_1