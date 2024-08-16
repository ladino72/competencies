import React, { useState } from 'react';
import SignUp from './SignUpN';
import Login from './LoginN';
import { FaUniversity } from 'react-icons/fa';

function HomePage() {
    const [signUpLogin, setSignupLogin] = useState('signup');

    return (
        <div className="flex justify-center items-center flex-col md:flex-row mx-auto w-full my-auto h-full divide-x-4">
            <div className="w-full md:w-1/2 text-center px-4 md:px-8">
                <span className="block font-bold text-4xl">Competencias</span>
                <p className="text-xs mt-1 px-6 text-gray-500 tracking-tighter">
                    Una competencia se define como la capacidad de responder a demandas complejas y llevar a cabo tareas diversas de forma adecuada. Supone una combinación de habilidades prácticas, conocimientos, motivación, valores éticos, actitudes, emociones y otros componentes sociales y de comportamiento que se movilizan conjuntamente para lograr una acción eficaz.{' '}
                    <span className="font-light text-blue-600">OCDE, 2002</span>
                </p>
                <div className="flex justify-center mt-10">
                    <FaUniversity className="h-16 w-16 md:h-32 md:w-32 text-blue-600" />
                </div>
                <div className="flex justify-center items-center space-x-3 mt-4">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" onClick={() => setSignupLogin('signup')}>
                        Registrarse
                    </button>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" onClick={() => setSignupLogin('login')}>
                        <span className="whitespace-pre">Iniciar sesión</span>
                    </button>
                </div>
                <div className="text-center font-roboto text-gray-500 mt-4">
                    Si ya se registró inicie una sesión. De lo contrario regístrese.
                </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center items-center">
                {signUpLogin === 'signup' ? <SignUp /> : <Login />}
            </div>
        </div>
    );
}

export default HomePage;
