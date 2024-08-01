import React from 'react'
import { useSelector } from 'react-redux'


function ActivityGrades({ scores }) {


    // Proceed to render the table
    const Activities = [
        {

            Grades: [
                scores[0].n1,
                scores[0].n2,
                scores[0].n3,
                scores[1].n1,
                scores[1].n2,
                scores[1].n3,
                scores[2].n1,
                scores[2].n2,
                scores[2].n3,
                scores[3].n1,
                scores[3].n2,
                scores[3].n3,
                scores[4].n1,
                scores[4].n2,
                scores[4].n3,

            ],
        },
    ];

    return (
        <>
            <div className=' mx-auto w-full py-2'>

                <div className='flex justify-between items-center w-full divide-x-2 divide-slate-300 '>


                    <div className='basis-1/5'>
                        <div className='w-full text-blue-600 text-center font-semibold bg-sky-100'> CL</div>
                        <div className='flex justify-center items-center w-full font-semibold   bg-sky-50 text-center text-xs md:text-base'>
                            <div className='basis-1/3 '>N1</div>
                            <div className='basis-1/3 '>N2</div>
                            <div className='basis-1/3 '>N3</div>
                        </div>
                    </div>

                    <div className='basis-1/5'>
                        <div className='w-full text-blue-600 text-center font-semibold bg-sky-100'> UTF</div>
                        <div className='flex justify-center items-center w-full font-semibold   bg-sky-50 text-center text-xs md:text-base'>
                            <div className='basis-1/3 '>N1</div>
                            <div className='basis-1/3 '>N2</div>
                            <div className='basis-1/3 '>N3</div>
                        </div>

                    </div>
                    <div className='basis-1/5'>
                        <div className='w-full text-blue-600 text-center font-semibold bg-sky-100'> UCM</div>
                        <div className='flex justify-center items-center w-full font-semibold   bg-sky-50 text-center text-xs md:text-base'>
                            <div className='basis-1/3 '>N1</div>
                            <div className='basis-1/3 '>N2</div>
                            <div className='basis-1/3 '>N3</div>
                        </div>

                    </div>
                    <div className='basis-1/5'>
                        <div className='w-full text-blue-600 text-center font-semibold bg-sky-100'> PRC</div>
                        <div className='flex justify-center items-center w-full font-semibold   bg-sky-50 text-center text-xs md:text-base'>
                            <div className='basis-1/3 '>N1</div>
                            <div className='basis-1/3 '>N2</div>
                            <div className='basis-1/3 '>N3</div>
                        </div>

                    </div>
                    <div className='basis-1/5'>
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

                            <div className='basis-1/5'>
                                <div className={`flex justify-center items-center w-full  text-center text-xs md:text-base`}>
                                    <div className='basis-1/3 '>{item.Grades[0]}</div>
                                    <div className='basis-1/3 '>{item.Grades[1]}</div>
                                    <div className='basis-1/3 '>{item.Grades[2]}</div>
                                </div>
                            </div>

                            <div className='basis-1/5'>
                                <div className='flex justify-center items-center w-full  text-center text-xs md:text-base'>
                                    <div className='basis-1/3 '>{item.Grades[3]}</div>
                                    <div className='basis-1/3 '>{item.Grades[4]}</div>
                                    <div className='basis-1/3 '>{item.Grades[5]}</div>
                                </div>

                            </div>
                            <div className='basis-1/5'>
                                <div className='flex justify-center items-center w-full   text-center text-xs md:text-base'>
                                    <div className='basis-1/3 '>{item.Grades[6]}</div>
                                    <div className='basis-1/3 '>{item.Grades[7]}</div>
                                    <div className='basis-1/3 '>{item.Grades[8]}</div>
                                </div>
                            </div>
                            <div className='basis-1/5'>
                                <div className='flex justify-center items-center w-full   text-center text-xs md:text-base'>
                                    <div className='basis-1/3 '>{item.Grades[9]}</div>
                                    <div className='basis-1/3 '>{item.Grades[10]}</div>
                                    <div className='basis-1/3 '>{item.Grades[11]}</div>
                                </div>
                            </div>
                            <div className='basis-1/5'>
                                <div className='flex justify-center items-center w-full   text-center text-xs md:text-base'>
                                    <div className='basis-1/3 '>{item.Grades[12]}</div>
                                    <div className='basis-1/3 '>{item.Grades[13]}</div>
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

export default ActivityGrades