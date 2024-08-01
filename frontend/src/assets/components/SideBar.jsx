import React from 'react'
import { Link } from "react-router-dom"

function SideBar({ showSideBar }) {
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
            name: "Director",
            link: "/director"
        },
        {
            name: "Signup",
            link: "/signup"
        },
        {
            name: "Login",
            link: "/login"
        },
        {
            name: "Coordinador",
            link: "/coordinator"
        },
        {
            name: "Admin",
            link: "/admin"
        },
    ]
    return (
        <div className={`transition-all duration-700 h-screen mt-20 overflow-hidden ${showSideBar ? "w-60" : "w-0"}`}>
            <ul className='flex flex-col justify-center items-start mx-auto w-full '>
                {
                    Links.map((link, index) => (
                        <li key={index} className=' font-semibold   text-blue-600 pl-10 py-3 hover:bg-red-300 w-full'>
                            <Link to={link.link}> {link.name}</Link>
                        </li>))
                }
            </ul>
        </div>
    )
}

export default SideBar