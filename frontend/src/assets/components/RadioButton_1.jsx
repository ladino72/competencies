import React, { useState } from 'react'


function RadioButton_1({ course, setCourse, phys, curso, setCourseErr, options }) {




    const onOptionChange = e => {
        setCourse(e.target.value)
        setCourseErr(false)

    }


    return (
        <div className=" w-full mt-4 text-gray-900 ">
            <div className='flex justify-between items-center'>
                <div className='font-roboto'>{phys}</div>
                <span className='text-xs text-red-500 pr-3'>{curso == true ? "Seleccione un curso" : null}</span>

            </div>
            <div className='flex space-x-4 justify-between items-center'>

                {
                    options.map(option =>
                        <div key={option.id}>

                            <div className='inline-flex items-center space-x-1 '>
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
            </div>


        </div >
    )
}


export default RadioButton_1