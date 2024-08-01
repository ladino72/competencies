import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';

function LayoutDirector() {
    const [activeLink, setActiveLink] = useState(null);

    const handleLinkClick = (linkName) => {
        setActiveLink(linkName);
    };

    const isActive = (linkName) => {
        return activeLink === linkName ? 'text-blue-800 font-semibold' : 'text-blue-500';
    };

    return (
        <div className="flex flex-col items-center justify-center mx-auto w-full   ">
            <div className='mt-10'>
                <ul className="flex flex-col font-semibold md:flex-row md:flex-wrap">
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Estadísticas')} onClick={() => handleLinkClick('Estadísticas')} to={"/director/stat"}> Estadísticas </Link>
                    </li>

                    <li className="mr-6 mb-3">
                        <Link className={isActive('Estadísticas por curso')} onClick={() => handleLinkClick('Estadísticas por curso')} to={"/director/statCourse"}> Estadísticas por curso</Link>
                    </li>

                    <li className="mr-6 mb-3">
                        <Link className={isActive('Comparación de grupos')} onClick={() => handleLinkClick('Comparación de grupos')} to={"/director/statGroupsComparison"}> Comparación grupos (Tabla)</Link>
                    </li>

                    <li className="mr-6 mb-3">
                        <Link className={isActive('Comparación de actividades')} onClick={() => handleLinkClick('Comparación de actividades')} to={"/director/statActivitiesComparison"}> Comparación grupos (Gráfico)</Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Estudiantes sobresalientes')} onClick={() => handleLinkClick('Estudiantes sobresalientes')} to={"/director/statTopStudents"}> Estudiantes sobresalientes</Link>
                    </li>

                    <li className="mr-6 mb-3">
                        <Link className={isActive('Notas de estudiante')} onClick={() => handleLinkClick('Notas de estudiante')} to={"/director/statStudentGrades"}> Notas de estudiante</Link>
                    </li>

                    <li className="mr-6 mb-3">
                        <a className={isActive('Estadísticas profesor')} onClick={() => handleLinkClick('Estadísticas profesor')} href="/director/statsTeacher">Estadísticas por profesor</a>
                    </li>


                </ul>
            </div>

            <div className=' mt-5'>
                <Outlet />
            </div>
        </div>
    )
}

export default LayoutDirector;
