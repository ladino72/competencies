import React from 'react'
import Student_Results from '../components/Student_Results'

function Students_Res() {
    return (
        <div className='flex justify-center items-center mx-auto mt-3'>
            <div >

                <Student_Results gradesLab={[2.0, 1.0, 0.0, 1.0, 1.0]} gradesTeo={[2.0, 1.0, 0.0, 1.0, 2.0]} curso={"Mecánica"} />


            </div>
        </div>
    )
}

export default Students_Res