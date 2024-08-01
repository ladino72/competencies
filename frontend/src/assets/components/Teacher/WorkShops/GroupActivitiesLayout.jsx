import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';

function GroupActivitiesLayout() {
    const [activeLink, setActiveLink] = useState(null);

    const handleLinkClick = (linkName) => {
        setActiveLink(linkName);
    };

    const isActive = (linkName) => {
        return activeLink === linkName ? 'text-blue-800 font-semibold' : 'text-blue-500';
    };

    return (
        <div className="container flex flex-col items-center justify-center mx-auto w-full">
            <div className='mt-10'>
                <ul className="flex flex-col font-semibold md:flex-row md:flex-wrap">
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Digitar Nota Grupos')} onClick={() => handleLinkClick('Digitar Nota Grupos')} to={"/teacher/groupActivities/enterGroupGrades"}> Digitar notas de equipos</Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Actualizar nota de grupo')} onClick={() => handleLinkClick('Actualizar nota de grupo')} to={"/teacher/groupActivities/updateGroupGrades"}> Actualizar notas de equipos</Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Mostrar notas de equipos de un grupo')} onClick={() => handleLinkClick('Mostrar notas de equipos de un grupo')} to={"/teacher/groupActivities/displayWorkshopGradesForGroupTeams"}> Ver notas de equipos de un grupo</Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Crear workshop y equipos')} onClick={() => handleLinkClick('Crear workshop y equipos')} to={"/teacher/groupActivities/createWorkShopAndTeams"}> Crear taller y equipos</Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Ver equipos y estudiantes')} onClick={() => handleLinkClick('Ver equipos y estudiantes')} to={"/teacher/groupActivities/seeStudentsInWorkTeams"}> Ver equipos y estudiantes</Link>
                    </li>


                </ul>
            </div>
            <div className=' min-w-full px-2 mt-2'>
                <Outlet />
            </div>
        </div>
    )
}

export default GroupActivitiesLayout;
