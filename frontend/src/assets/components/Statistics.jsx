import React from 'react'
import { Plot_Pie } from './Plot_Pie'

function Statistics() {
    return (



        <div className='flex justify-center items-center mx-auto w-full mt-10'>
            <div className='grid grid-cols-1 gap-1 md:grid-cols-2 md:gap-2'>
                <div className="flex justify-between items-center p-4  md:flex-row">
                    <div className='space-y-2 '>
                        <div className=' bg-slate-100'>
                            <div className='font-semibold'>Laboratorio:</div>
                            <div>Mecánica</div>
                        </div>
                        <div className=' bg-slate-100'>
                            <div className='font-semibold'>Grupo: </div>
                            <span className=' font-normal leading-3 block'>12</span>
                        </div>
                        <div className=' bg-slate-100'>
                            <div className='font-semibold'>N. Estudiantes: </div>
                            <span className=' font-normal leading-3 block'>12</span>
                        </div>

                        <div className=' bg-slate-100'>
                            <div className='font-semibold'>Profesor:</div>
                            <span className=' font-normal leading-3 block'>Elva Molina Cifuentes</span>
                        </div>

                    </div>

                    <div>
                        <Plot_Pie />
                    </div>
                </div>

                <div className="flex justify-between items-center p-4  md:flex-row">
                    <div className='space-y-2 '>
                        <div className=' bg-slate-100'>
                            <div className='font-semibold' >Laboratorio:</div>
                            <div>Mecánica</div>
                        </div>
                        <div className=' bg-slate-100'>
                            <div className='font-semibold'>Grupo: </div>
                            <span className=' font-normal leading-3 block'>10</span>
                        </div>

                        <div className=' bg-slate-100'>
                            <div className='font-semibold'>N. Estudiantes: </div>
                            <span className=' font-normal leading-3 block'>24</span>
                        </div>

                        <div className=' bg-slate-100'>
                            <div className='font-semibold'>Profesor:</div>
                            <span className=' font-normal leading-3 block'>Rafael Guzmán Escandón</span>
                        </div>

                    </div>

                    <div>
                        <Plot_Pie />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Statistics