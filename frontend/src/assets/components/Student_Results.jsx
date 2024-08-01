import React from 'react'

const Activities = [
    { Term: 1, Activity: 1, Grades: [0, 1, 2, , 2, 1, 1, 1, 1, 1, , 1, 2, 2, 1] },
    { Term: 1, Activity: 2, Grades: [2, 1, 2, , 2, 1, 1, 1, 1, , , 1, 2, 2, 0] },
    { Term: 2, Activity: 1, Grades: [0, 1, 2, 1, 2, 1, 1, 1, 1, , 2, 1, 2, 2, 2] },
    { Term: 2, Activity: 2, Grades: [0, 1, 2, , 2, 1, 1, 0, 1, , 0, 1, 2, 2, 0] },
    { Term: 3, Activity: 1, Grades: [2, 1, 2, , 2, 1, 1, 1, 1, , 0, 1, 2, 2, 0] },
    { Term: 3, Activity: 2, Grades: [0, 1, 2, , 2, 0, 1, 1, 1, , 0, 1, 2, 2, 2] },
    { Term: 3, Activity: 3, Grades: [0, 1, 2, , 2, 2, 1, 1, 1, , 0, 1, 2, 2, 2] }

]

const Grades = [0, 1, 2, , 2, 1, 1, 1, 1, , , 1, 2, 2, 0]

function Student_Results() {
    return (
        <>
            <div className=' mx-auto w-full p-6'>
                <div className="uppercase text-center font-bold text-3xl mt-20 text-blue-600 ">Resultados</div>

                <div className=' '>
                    <span className='font-semibold text-xl text-blue-600'>Competencias evaluadas</span>
                    <ul className='list-disc pl-4 space-y-2 mt-2'>
                        <li > <span className='font-semibold text-blue-600 '>CL</span>-Comprensión de leyes </li>
                        <li> <span className='font-semibold text-blue-600'>UFT</span>-Usos y Fundamentos de Tecnología </li>
                        <li> <span className='font-semibold text-blue-600'>UCM</span>-Capacidad Para Utilizar Conceptos y Modelos </li>
                        <li> <span className='font-semibold text-blue-600'>PRC</span>-Pensamiento Y Razonamiento Científico</li>
                        <li> <span className='font-semibold text-blue-600'>ULC</span>-Uso de lenguaje científico</li>
                    </ul>
                </div>

                <div className="bg-neutral-50 my-4 "> La tabla de abajo muestra los resultados de las competencias obtenidos por <span className='text-xl font-semibold  capitalize '>Wilson Orlando Medina Baez</span>. <span className="font-normal -tracking-wider " >Un cero indica que la competencia  no se desarrolló en absoluto, 1 indica que la competencia no se ha desarrollado satisfactoriamente y que se debe seguir trabajando aún mas, y un 2 indica que la competencia se alcanzó de acuerdo a los estándares establecidos.</span> </div>




                <div className='flex justify-between items-center w-full divide-x-2 divide-slate-300 '>

                    <div className='flex basis-1/6 text-xs self-end text-center font-medium md:text-base justify-around items-center bg-sky-100 w-full '>
                        <div className="text-blue-600 ">Tercio</div>
                        <div className="text-blue-600">Ev. #</div>
                    </div>
                    <div className='basis-1/6'>
                        <div className='w-full text-blue-600 text-center font-semibold bg-sky-100'> CL</div>
                        <div className='flex justify-center items-center w-full font-semibold   bg-sky-50 text-center text-xs md:text-base'>
                            <div className='basis-1/3 '>N1</div>
                            <div className='basis-1/3 '>N2</div>
                            <div className='basis-1/3 '>N3</div>
                        </div>
                    </div>

                    <div className='basis-1/6'>
                        <div className='w-full text-blue-600 text-center font-semibold bg-sky-100'> UTF</div>
                        <div className='flex justify-center items-center w-full font-semibold   bg-sky-50 text-center text-xs md:text-base'>
                            <div className='basis-1/3 '>N1</div>
                            <div className='basis-1/3 '>N2</div>
                            <div className='basis-1/3 '>N3</div>
                        </div>

                    </div>
                    <div className='basis-1/6'>
                        <div className='w-full text-blue-600 text-center font-semibold bg-sky-100'> UCM</div>
                        <div className='flex justify-center items-center w-full font-semibold   bg-sky-50 text-center text-xs md:text-base'>
                            <div className='basis-1/3 '>N1</div>
                            <div className='basis-1/3 '>N2</div>
                            <div className='basis-1/3 '>N3</div>
                        </div>

                    </div>
                    <div className='basis-1/6'>
                        <div className='w-full text-blue-600 text-center font-semibold bg-sky-100'> PRC</div>
                        <div className='flex justify-center items-center w-full font-semibold   bg-sky-50 text-center text-xs md:text-base'>
                            <div className='basis-1/3 '>N1</div>
                            <div className='basis-1/3 '>N2</div>
                            <div className='basis-1/3 '>N3</div>
                        </div>

                    </div>
                    <div className='basis-1/6'>
                        <div className='w-full text-blue-600 text-center font-semibold bg-sky-100'> ULC</div>
                        <div className='flex justify-center items-center w-full font-semibold   bg-sky-50 text-center text-xs md:text-base'>
                            <div className='basis-1/3 '>N1</div>
                            <div className='basis-1/3 '>N2</div>
                            <div className='basis-1/3 '>N3</div>
                        </div>
                    </div>
                </div>



                {Activities.map((item, index) => {
                    return (
                        <div key={index} className={`flex justify-between items-center w-full  bg-sky-100 mt-1 ${index % 2 == 0 ? " bg-sky-100" : " bg-sky-50"} divide-x-2 divide-slate-200`}>
                            <div className='flex basis-1/6 text-xs self-end text-center font-medium md:text-base justify-around items-center w-full '>
                                <div className="font- ">{item.Term}</div>
                                <div className="">{item.Activity}</div>
                            </div>
                            <div className='basis-1/6'>
                                <div className={`flex justify-center items-center w-full  text-center text-xs md:text-base`}>
                                    <div className='basis-1/3 '>{item.Grades[0]}</div>
                                    <div className='basis-1/3 '>{item.Grades[1]}</div>
                                    <div className='basis-1/3 '>{item.Grades[2]}</div>
                                </div>
                            </div>

                            <div className='basis-1/6'>
                                <div className='flex justify-center items-center w-full  text-center text-xs md:text-base'>
                                    <div className='basis-1/3 '>{item.Grades[3]}</div>
                                    <div className='basis-1/3 '>{item.Grades[4]}</div>
                                    <div className='basis-1/3 '>{item.Grades[5]}</div>
                                </div>

                            </div>
                            <div className='basis-1/6'>
                                <div className='flex justify-center items-center w-full   text-center text-xs md:text-base'>
                                    <div className='basis-1/3 '>{item.Grades[6]}</div>
                                    <div className='basis-1/3 '>{item.Grades[7]}</div>
                                    <div className='basis-1/3 '>{item.Grades[8]}</div>
                                </div>
                            </div>
                            <div className='basis-1/6'>
                                <div className='flex justify-center items-center w-full   text-center text-xs md:text-base'>
                                    <div className='basis-1/3 '>{item.Grades[9]}</div>
                                    <div className='basis-1/3 '>{item.Grades[10]}</div>
                                    <div className='basis-1/3 '>{item.Grades[11]}</div>
                                </div>
                            </div>
                            <div className='basis-1/6'>
                                <div className='flex justify-center items-center w-full   text-center text-xs md:text-base'>
                                    <div className='basis-1/3 '>{item.Grades[12]}</div>
                                    <div className='basis-1/3 '>{item.Grades[12]}</div>
                                    <div className='basis-1/3 '>{item.Grades[14]}</div>
                                </div>
                            </div>
                        </div>


                    )
                })}

            </div>

        </>
    )
}

export default Student_Results