import React, { useState, useRef } from 'react'

import { AiOutlineClear } from "react-icons/ai";



function ThreeIntegerInputs() {


    const [cpN1, setCPN1] = useState("")
    const [cpN2, setCPN2] = useState("")
    const [cpN3, setCPN3] = useState("")

    const refCP1 = useRef(null);
    const refCP2 = useRef(null);
    const refCP3 = useRef(null);

    const handleCPN1 = (e) => {
        const min = 0;
        const max = 2;
        const value = Math.max(min, Math.min(max, Number(e.target.value)));
        setCPN1(value);
        console.log("you entered", parseInt(value))
    }

    const handleCPN2 = (e) => {
        const min = 0;
        const max = 2;
        const value = Math.max(min, Math.min(max, Number(e.target.value)));
        setCPN2(value);
        console.log("you entered", parseInt(e.target.value))
    }
    const handleCPN3 = (e) => {
        const min = 0;
        const max = 2;
        const value = Math.max(min, Math.min(max, Number(e.target.value)));
        setCPN3(value);
        console.log("you entered", parseInt(e.target.value))
    }

    {/**https://timmousk.com/blog/react-clear-input/ */ }
    const onClearCP1 = (e) => {
        refCP1.current.value = "";
        setCPN1("")

        console.log("Clean", cpN1)
    };

    const onClearCP2 = (e) => {
        refCP2.current.value = "";
        setCPN2("")
    };

    const onClearCP3 = (e) => {
        refCP3.current.value = "";
        setCPN3("")
    };
    console.log("cpN1 value:", cpN1, "cpN2 value:", cpN2, "cpN3 value:", cpN3)

    return (
        <>
            <form>
                <div className='flex w-full justify-center space-x-5 mt-20 md:space-x-10'>
                    <div className='inline-flex items-center justify-start'>
                        <label className="block mt-2">
                            <span className="text-sm md:text-base font-roboto pr-1 font-semibold text-blue-600 md:pr-2">CPN1</span>
                            <input
                                min="0"
                                max="2"
                                ref={refCP1}
                                type='number'
                                value={cpN1}
                                onChange={handleCPN1}
                                className=" w-14 h-8 md:w-16 rounded-lg focus:border-1 focus:shadow-lg" />
                        </label>
                        <button type="button" onClick={onClearCP1} className='w-2 h-2 text-red-500 pl-1 '>
                            <AiOutlineClear />
                        </button>
                    </div>
                    <div className='inline-flex items-center'>
                        <label className="block mt-2">
                            <span className="text-sm md:text-base font-roboto pr-1 font-semibold text-blue-600 md:pr-2">CPN2</span>
                            <input
                                ref={refCP2}
                                min="0"
                                max="2"
                                step="1"
                                type='number'
                                value={cpN2}
                                onChange={handleCPN2}
                                className="w-14 h-8 md:w-16  rounded-lg focus:border-1 focus:shadow-lg" />
                        </label>
                        <button type="button" onClick={onClearCP2} className='w-2 h-2 text-red-500 pl-1'>
                            <AiOutlineClear />
                        </button>
                    </div>
                    <div className='inline-flex items-center'>
                        <label className="block mt-2">
                            <span className="text-sm md:text-base font-roboto pr-1 font-semibold text-blue-600 md:pr-2">CPN3</span>
                            <input
                                ref={refCP3}
                                min="0"
                                max="2"
                                step="1"
                                type='number'
                                value={cpN3}
                                onChange={handleCPN3}

                                className=" w-14 h-8 md:w-16  rounded-lg focus:border-1 focus:shadow-lg" />
                        </label> <button type="button" onClick={onClearCP3} className='w-2 h-2 text-red-500 pl-1'>
                            <AiOutlineClear />
                        </button>
                    </div>
                </div>
            </form>
        </>

    )
}

export default ThreeIntegerInputs