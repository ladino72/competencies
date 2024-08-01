import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { FaAlignRight, FaTimes } from "react-icons/fa";

function LaySignUpLogin() {
    return (
        <>
            <div className="flex flex-col items-center justify-center mx-auto w-full ">
                <div className=" text-4xl text-blue-600 tracking-wide mt-4 font-extrabold capitalize font-bai text-center mb-10 md:mb-5">
                    Sistema de Seguimiento y Análisis de Competencias (SSAC)
                </div>
                <div >
                    <Outlet />
                </div>


            </div>


        </>
    )
}

export default LaySignUpLogin