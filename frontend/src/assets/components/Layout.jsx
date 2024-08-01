import React, { useState } from 'react'
import Header from './Header'
import Menu from './Menu'
import { Outlet } from 'react-router-dom'
import SideBar from './SideBar'
import { FaAlignRight, FaTimes } from "react-icons/fa";

function Layout() {
    const [showSideBar, setShowSideBar] = useState(false)
    return (
        <>
            <div className="flex justify-between mx-auto w-full">
                <div className='bg-sky-100 w-50 md:invisible'>

                    <SideBar showSideBar={showSideBar} />

                </div>
                <div className='w-full'>

                    <div>
                        {showSideBar ? <FaTimes className=" relative -left-10 md:invisible h-7 w-7 text-blue-600 cursor-pointer" onClick={() => setShowSideBar(!showSideBar)} /> : <FaAlignRight className="md:invisible h-6 w-6 text-blue-600 cursor-pointer" onClick={() => setShowSideBar(!showSideBar)} />}


                        <Header />

                        <div className="mt-3">
                            <Outlet />
                        </div>

                    </div>


                </div>

            </div>


        </>
    )
}

export default Layout