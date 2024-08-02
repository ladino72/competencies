import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';

function LayoutTeacher() {
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
                        <Link className={isActive('Actividades')} onClick={() => handleLinkClick('Actividades')} to={"/teacher/competencyActivities"}> Registros de Competencias </Link>
                    </li>

                    <li className="mr-6 mb-3">
                        <Link className={isActive('Digitar Notas de taller')} onClick={() => handleLinkClick('Digitar Notas de taller')} to={"/teacher/groupActivities"}> Actividades grupales (Talleres)  </Link>
                    </li>


                </ul>
            </div>
            <div className=' min-w-full px-2 -mt-6'>
                <Outlet />
            </div>
        </div>
    )
}

export default LayoutTeacher;
