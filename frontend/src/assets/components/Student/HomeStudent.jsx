import React, { useState } from 'react'

import { FaUniversity } from "react-icons/fa";
import { inputGrades } from '../../../redux/slice/listStudentsSlice';
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux';

function HomeStudent() {
    const user = useSelector((state) => state.user.user.name);
    return (

        <div className="container bg-white shadow-sm rounded-sm p-6">
            <h2 className="text-xl font-bold mb-4">{user}, bienvenido/a a tu espacio de actividades</h2>
            <ul className="list-disc list-inside space-y-2">
                <li><span className="font-semibold">Ver notas:</span> Accede a tus calificaciones y revisa tu progreso.</li>
                <li><span className="font-semibold">Unirte o retirarte de un equipo:</span> Gestiona tu participación en los equipos de trabajo.</li>
                <li><span className="font-semibold">Autoevaluación y Coevaluación:</span> Evalúa tu propio desempeño y el de tus compañeros.</li>
                <li><span className="font-semibold">Ver tus notas de talleres:</span> Consulta las calificaciones de los talleres en los que has participado.</li>
            </ul>
            <p className="mt-4 text-gray-600">Explora estas opciones para estar al tanto de tus actividades y seguir avanzando en tu aprendizaje.</p>

        </div>


    )
}

export default HomeStudent