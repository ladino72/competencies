import React, { useState } from 'react'
import SignUp from './SignUp'
import Login from './Login'
import { FaUniversity } from "react-icons/fa";


function HomePage() {
    const [signUpLogin, setSignupLogin] = useState("signup")
    return (
        <>
            <div className='flex justify-start items-center mx-auto w-full flex-col md:flex-row md:justify-between my-auto h-fit divide-x-4'>
                <div className='basis-1/2 w-full'>

                    <span className='text-center font-bold text-4xl block'>Competencias</span>
                    <p className='text-xs mt-1 px-6 text-gray-500 tracking-tighter text-center'>Una competencia se define como la capacidad de responder a demandas complejas
                        y llevar a cabo tareas diversas de forma adecuada. Supone una combinación de habilidades prácticas, conocimientos, motivación, valores éticos, actitudes,
                        emociones y otros componentes sociales y de comportamiento que se movilizan conjuntamente para lograr una acción eficaz. <span className='font-light text-blue-600 '>OCDE,2002</span></p>
                    <div className='flex justify-center m-10 '>
                        <FaUniversity className="h-16 w-16 md:h-32 md:w-32 text-blue-600 " />
                    </div>
                    <div className='flex justify-center items-center space-x-3'>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" onClick={() => setSignupLogin("signup")}>
                            Registrarse
                        </button>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" onClick={() => setSignupLogin("login")}>
                            <span className='whitespace-pre'>Iniciar sesión</span>
                        </button>
                    </div>
                    <div className='text-center font-roboto text-gray-500 mt-4'>
                        Si ya se registró inicie una sesión. De lo contrario regístrese.
                    </div>
                </div>
                <div className='basis-1/2 w-full'>
                    {signUpLogin == "signup" ? <SignUp /> : <Login />}

                </div>
            </div>
        </>
    )
}

export default HomePage