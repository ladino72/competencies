import React from 'react'
import Estudiante from './Estudiante'
import { useSelector } from 'react-redux';


const Studentmain = () => {
    const user = useSelector((state) => state.user.user);
    return (
        <div>

            <Estudiante studentId={user.id} />
        </div>
    )
}

export default Studentmain