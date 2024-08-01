import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';

function LayoutStudent() {
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
                        <Link className={isActive('Notas estudiante')} onClick={() => handleLinkClick('Notas estudiante')} to={"/estudiante/student_grades"}> Ver notas </Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Unirse a equipo')} onClick={() => handleLinkClick('Unirse a equipo')} to={"/estudiante/join_leave_workteam"}> Unirse(retirarse) a(de) equipo </Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Auto y Coevaluación')} onClick={() => handleLinkClick('Auto y Coevaluación')} to={"/estudiante/self_peers_grades"}> Auto y Coevaluación </Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Ver mis notas de talleres')} onClick={() => handleLinkClick('Ver mis notas de talleres')} to={"/estudiante/studentsGetTheirWorkShopGrades"}> Ver mis notas de talleres </Link>
                    </li>

                </ul>
            </div>
            <div className='min-w-full mt-5 mx-4'>
                <Outlet />
            </div>
        </div>
    )
}

export default LayoutStudent;