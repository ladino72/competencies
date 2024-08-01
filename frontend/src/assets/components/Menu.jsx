import React, { useState } from 'react'
import { BoltIcon, Bars3BottomRightIcon, XMarkIcon, BoltSlashIcon } from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'

{/*
Taken from:
https://www.google.com/search?channel=fs&client=ubuntu-sn&q=React+Tailwindcss+navbar#fpstate=ive&vld=cid:7c35acff,vid:7JGBGhuWxl0
 */}

function Menu() {
    let Links = [

        {
            name: "Inicio",
            link: "/"
        },

        {
            name: "Estudiante",
            link: "/student",
        },
        {
            name: "Profesor",
            link: "/teacher"
        },
        {
            name: "Coordinador",
            link: "/coordinator"
        },
        {
            name: "Director",
            link: "/director"
        },
        {
            name: "Admin",
            link: "/admin"
        },

    ]

    let [isOpen, setisOpen] = useState(false)

    return (
        <div className='shadow-md w-full relative top-0 left-0'>
            <div className='md:px-10 py-4 px-7 md:flex justify-between bg-white'>
                {/* Logo */}
                <div className='flex text-2xl cursor-pointer items-center gap-1'>
                    <BoltIcon className="h-7 w-7 text-blue-600" />
                    <span className=" font-bold">Luis Ladino</span>
                </div>

                {/* Menu Icon*/}
                <div onClick={() => setisOpen(!isOpen)} className='w-7 h-7 absolute right-8 top-6 cursor-pointer md:hidden'>
                    {
                        isOpen ? <XMarkIcon /> : <Bars3BottomRightIcon />
                    }

                </div>

                {/* Nav links*/}
                <ul className={`md:flex md:items-center md:pb-0 pb-10  bg-white md:z-auto z-[-1] left-0 w-full md:w-auto md:pl-0 pl-9 transition-all duration-500 ease-in ${isOpen ? "top-12" : "top-[-480px]"}`}>

                    {
                        Links.map((link, index) => (
                            <li key={index} className=' font-semibold my-3 md:my-0 md:ml-8'>
                                <Link to={link.link}> {link.name}</Link>
                            </li>))
                    }
                    <button className='btn bg-blue-600 text-white py-1 px-3 md:ml-8 rounded md:static'>Get Started</button>

                </ul>

            </div>
        </div>
    )
}

export default Menu
