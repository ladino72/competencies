import { useState } from 'react'
import { FcRight } from "react-icons/fc";
import { useAuth } from "./../permissions/AuthContext";
import { Can } from "./../permissions/Can";
import Unauthorized from '../components/UnauthorizedAccess';

function Coordinator() {


    return (

        <div className="container mx-auto w-full mt-20">
            {/* <Can I="read" a="Statistics"> */}
            <p>  Welcome to the Coordinator space</p>
            {/* </Can>
            <Can not I="read" a="Statistics">
                <Unauthorized />
            </Can> */}

        </div>


    )
}



export default Coordinator