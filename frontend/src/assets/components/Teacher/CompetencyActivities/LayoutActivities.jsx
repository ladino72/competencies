import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';

function LayoutActivities() {
    const [activeLink, setActiveLink] = useState(null);

    const handleLinkClick = (linkName) => {
        setActiveLink(linkName);
    };

    const isActive = (linkName) => {
        return activeLink === linkName ? 'text-blue-800 font-semibold' : 'text-blue-500';
    };

    return (
        <div className="flex flex-col items-center justify-center mx-auto w-full">
            <div className='mt-10'>
                <ul className="flex flex-col font-semibold md:flex-row md:flex-wrap">

                    <li className="mr-6 mb-3">
                        <Link className={isActive('Digitar notas de actividad')} onClick={() => handleLinkClick('Digitar notas de actividad')} to={"/teacher/competencyActivities/ingresarNotas"}> Digitar notas de actividad</Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Actualizar notas de actividad')} onClick={() => handleLinkClick('Actualizar notas de actividad')} to={"/teacher/competencyActivities/updateGrades"}> Actualizar notas de actividad</Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Eliminar actividad')} onClick={() => handleLinkClick('Eliminar actividad')} to={"/teacher/competencyActivities/deleteActivityGrades"}> Eliminar actividad</Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Desactivar estudiante de grupo')} onClick={() => handleLinkClick('Desactivar estudiante de grupo')} to={"/teacher/competencyActivities/deactivateStudentFromGroup"}> Retirar estudiantes de un grupo</Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Competencias Profesor')} onClick={() => handleLinkClick('Competencias Profesor')} to={"/teacher/competencyActivities/teacherStatCompetencies"}> Estadisticas Competencias</Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Notas estudiante')} onClick={() => handleLinkClick('Notas estudiante')} to={"/teacher/competencyActivities/studentCompetencyGrades"}> Consultar estudiante</Link>
                    </li>

                </ul>
            </div>
            <div className='w-full px-2 mt-5'>
                <Outlet />
            </div>
        </div>
    )
}

export default LayoutActivities;