import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';

function LayoutAdmin() {
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
                        <Link className={isActive('Crear usuarios')} onClick={() => handleLinkClick('Crear usuarios')} to={"/admin/create_users"}> Crear usuarios </Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Crear un usuario')} onClick={() => handleLinkClick('Crear un usuario')} to={"/admin/create_user"}> Crear un usuario</Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Eliminar usuario')} onClick={() => handleLinkClick('Eliminar usuario')} to={"/admin/delete_user"}> Eliminar usuario</Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Crear curso')} onClick={() => handleLinkClick('Crear curso')} to={"/admin/create_course"}> Crear curso </Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Crear grupo')} onClick={() => handleLinkClick('Crear grupo')} to={"/admin/create_group"}> Crear grupo </Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Eliminar grupo')} onClick={() => handleLinkClick('Eliminar grupo')} to={"/admin/delete_group"}> Eliminar grupo </Link>
                    </li>
                    <li className="mr-6 mb-3">
                        <Link className={isActive('Crear fechas')} onClick={() => handleLinkClick('Crear fechas')} to={"/admin/setTermDates"}> Fijar fechas tercios </Link>
                    </li>

                    <li className="mr-6 mb-3">
                        <Link className={isActive('Cargar usuarios a MongoDB')} onClick={() => handleLinkClick('Cargar usuarios a MongoDB')} to={"/admin/loadUsersToDatabase"}> Subir usuarios a base de datos </Link>
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

export default LayoutAdmin;
