import React, { useState } from 'react';
import { Bars3BottomRightIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { FaUniversity } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();

    const links = [
        { name: 'Inicio', link: '/' },
        { name: 'Estudiante', link: '/estudiante' },
        { name: 'Profesor', link: '/teacher' },
        { name: 'Coordinador', link: '/coordinator' },
        { name: 'Director', link: '/director' },
        { name: 'Admin', link: '/admin' },
        { name: 'Salir', link: '/phys' },
    ];

    const [isOpen, setIsOpen] = useState(false);
    const [activeLink, setActiveLink] = useState(null);

    const handleLinkClick = (link) => {
        setActiveLink(link);
        if (link === '/phys') {
            localStorage.removeItem('token');
            navigate('/phys');
        }
        setIsOpen(false);
    };

    return (
        <div className='shadow-md w-full fixed top-0 left-0 bg-white'>
            <div className='md:px-10 py-2 px-7 md:flex justify-between items-center'>
                {/* Logo */}
                <div className='flex items-center gap-2'>
                    <FaUniversity className='h-8 w-8 sm:h-10 sm:w-10 text-blue-700' />
                    <span className='font-bold text-lg sm:text-xl md:text-2xl text-gray-800'>
                        SSAC
                    </span>
                    <span className='hidden sm:inline-block text-xs sm:text-sm text-gray-600 font-poppins'>
                        (Sistema de Seguimiento y Análisis de Competencias)
                    </span>
                </div>

                {/* Menu Icon */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className='w-7 h-7 absolute right-8 top-6 cursor-pointer md:hidden'
                >
                    {isOpen ? <XMarkIcon className='h-7 w-7' /> : <Bars3BottomRightIcon className='h-7 w-7' />}
                </div>

                {/* Nav links */}
                <ul
                    className={`md:flex md:items-center md:pb-0 pb-10 absolute md:static bg-white md:z-auto z-[-1] left-0 w-full md:w-auto md:pl-0 pl-9 transition-all duration-500 ease-in ${isOpen ? 'top-16' : '-top-80'
                        }`}
                >
                    {links.map((link, index) => (
                        <li key={index} className='font-medium text-sm sm:text-base md:text-base lg:text-lg md:ml-6 lg:ml-8 my-3 md:my-0'>
                            <Link
                                to={link.link}
                                className={`${activeLink === link.link ? 'text-blue-800' : 'text-blue-600'
                                    } hover:text-blue-800`}
                                onClick={() => handleLinkClick(link.link)}
                            >
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Header;
