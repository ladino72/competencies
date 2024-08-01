import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';

function LayoutCoordinator() {
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
                        <Link className={isActive('Registrar Notas')} onClick={() => handleLinkClick('Registrar Notas')} to={"/teacher/inputGrades"}> Registrar Notas </Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Consulta profesor')} onClick={() => handleLinkClick('Consulta profesor')} to={"/coordinator/statsTeacher"}> Consulta profesor </Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Actividades grupos')} onClick={() => handleLinkClick('Actividades grupos')} to={"/coordinator/groupsActivities"}> Actividades de Grupos </Link>
                    </li>

                    <li className="mr-6 mb-3">
                        <Link className={isActive('Comparación grupos Gráfica')} onClick={() => handleLinkClick('Comparación grupos Gráfica')} to={"/coordinator/groupsComparisonGraphC"}> Comparación grupos (Gráfico) </Link>
                    </li>

                    <li className="mr-6 mb-3">
                        <Link className={isActive('Comparación grupos Tabla')} onClick={() => handleLinkClick('Comparación grupos Tabla')} to={"/coordinator/groupsComparisonTableC"}> Comparación grupos (Tabla) </Link>
                    </li>

                    <li className="mr-6 mb-3">
                        <a className="text-gray-400 cursor-not-allowed" href="#">Disabled</a>
                    </li>
                </ul>
            </div>
            <div className='mt-5'>
                <Outlet />
            </div>
        </div>
    )
}

export default LayoutCoordinator;
