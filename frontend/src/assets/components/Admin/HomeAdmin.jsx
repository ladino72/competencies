import React, { useState } from 'react'

import { FaUniversity } from "react-icons/fa";
import { inputGrades } from '../../../redux/slice/listStudentsSlice';
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux';

function HomeAdmin() {
    const user = useSelector((state) => state.user.user.name);
    return (

        <div className="container mx-auto w-full mt-5 z-10 ">
            <div className='text-normal '>Bienvenido administrador <span className='text-blue-500 font-semibold hover:text-blue-700'>{user}</span></div>
            <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui incidunt fugiat voluptate quibusdam quisquam? Exercitationem, dolorum? Reiciendis similique quos est nihil distinctio deleniti deserunt doloribus, ea dignissimos velit dolore consequuntur.</div>
        </div>


    )
}

export default HomeAdmin




