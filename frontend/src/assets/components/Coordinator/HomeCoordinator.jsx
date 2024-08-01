import React, { useState } from 'react'

import { FaUniversity } from "react-icons/fa";
import { inputGrades } from '../../../redux/slice/listStudentsSlice';
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux';

function HomeCoordinator() {
    const user = useSelector((state) => state.user.user.name);
    return (

        <div className="container mx-auto w-full mt-5 z-10 ">
            <div className='text-normal '>Bienvenido coordinador <span className='text-blue-500 font-semibold hover:text-blue-700'>{user}</span></div>
            <div>En esta sección de la aplicación, usted puede realizar diversas tareas, tal como lo indican los nombres de las pestañas. Le invitamos a explorar las diferentes opciones disponibles y aprovechar al máximo las funcionalidades que esta sección ofrece.</div>
        </div>


    )
}

export default HomeCoordinator




