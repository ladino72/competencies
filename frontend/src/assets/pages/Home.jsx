import React from 'react'
import { useSelector } from 'react-redux';

function Home() {
    const user = useSelector((state) => state.user.user.role);

    return (

        <div className='container mx-auto'>
            <div className='mt-16 font-roboto text-2xl mb-1'>Bienvenido {user}</div>
            <div className=' first-letter:font-bold text-normal text-blue-700' >La competencia científica para estudiantes de ingeniería es la capacidad de aplicar los conocimientos y métodos científicos para resolver problemas de ingeniería. Esta competencia incluye las siguientes habilidades:

                <ul className="list-disc list-inside mr-2">
                    <li className="text-black"> Comprensión de los fundamentos científicos: Los estudiantes de ingeniería deben tener una comprensión sólida de los fundamentos científicos, como la física, la química y las matemáticas. Esto les permitirá comprender los principios que rigen los sistemas y procesos que diseñan e implementan.
                    </li>
                    <li className="text-black">Habilidades de pensamiento crítico: Los estudiantes de ingeniería deben ser capaces de pensar críticamente sobre los problemas y aplicar los principios científicos para encontrar soluciones. Esto incluye la capacidad de identificar problemas, evaluar información, generar soluciones y evaluar los resultados.
                    </li>
                    <li className="text-black"> Habilidades de resolución de problemas: Los estudiantes de ingeniería deben ser capaces de resolver problemas de ingeniería de manera efectiva. Esto incluye la capacidad de identificar y definir el problema, generar soluciones, seleccionar la mejor solución y evaluar los resultados.
                    </li>
                    <li className="text-black"> Habilidades de comunicación: Los estudiantes de ingeniería deben ser capaces de comunicar sus ideas de manera efectiva, tanto de manera oral como escrita. Esto incluye la capacidad de explicar conceptos científicos complejos, presentar resultados de investigación y escribir informes técnicos.
                    </li>
                </ul>


            </div>

            <div className='mt-1 mb-4'> Las asignaturas ofrecidas por el departamento de ciencias naturales (<span className="text-blue-600 font-semibold">DCN</span>)  pertenecen al núcleo de formación común por campo de conocimiento aportan al desarrollo de las siguientes competencias específicas. </div>

            <div className="flex justify-center items-center mx-auto w-full m-2">

                <div className="grid grid-cols-1 md:gap-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-2 gap-1 xl:grid-cols-5">
                    <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                        <h5 className="mb-2 text-2xl font-bold tracking-tighter text-gray-900 dark:text-white">Comprensión de leyes - CL </h5>
                        <p className="font-normal text-gray-700 dark:text-gray-400">Capacidad para explicar las leyes fundamentales de la física y la química que gobiernan la naturaleza tal como las explican las Ciencias Naturales.</p>
                    </div>


                    <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                        <h5 className="mb-2 text-2xl font-bold tracking-tighter text-gray-900 dark:text-white">Usos y Fundamentos de Tecnología - UFT </h5>
                        <p className="font-normal text-gray-700 dark:text-gray-400">
                            Capacidad para usar herramientas tecnológicas relacionadas tanto con software como con instrumentos de medición básicos utilizados en las ciencias exactas y aplicadas, y explicar los principios de operación de algunos dispositivos tecnológicos.</p>
                    </div>

                    <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                        <h5 className="mb-2 text-2xl font-bold tracking-tighter text-gray-900 dark:text-white">Capacidad Para Utilizar Conceptos y Modelos - UCM  </h5>
                        <p className="font-normal text-gray-700 dark:text-gray-400">
                            Capacidad para utilizar conceptos y modelos científicos para analizar problemas e interrogantes en contextos académicos y cotidianos. </p>
                    </div>


                    <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                        <h5 className="mb-2 text-2xl font-bold tracking-tighter text-gray-900 dark:text-white">Pensamiento Y Razonamiento Científico - PRC </h5>
                        <p className="font-normal text-gray-700 dark:text-gray-400">
                            Capacidad para aplicar procedimientos, métodos y herramientas científicas para la solución de los problemas en el contexto de las ciencias exactas y aplicadas.   </p>
                    </div>

                    <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                        <h5 className="mb-2 text-2xl font-bold tracking-tighter  text-gray-900 dark:text-white">Uso de lenguaje científico - ULC  </h5>
                        <p className="font-normal text-gray-700 dark:text-gray-400">
                            Capacidad para utilizar los lenguajes científico, gráfico y analítico para describir y explicar fenómenos naturales.  </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home