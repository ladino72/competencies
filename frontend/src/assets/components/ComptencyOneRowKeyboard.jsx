import React, { useState, useRef } from "react";
import { AiOutlineClear } from "react-icons/ai";

{/** This is an optimized version of the InputCompetencyDataThird file */ }
function ComptencyOneRowKeyboard() {
    const [cpN1, setCPN1] = useState("")
    const [cpN2, setCPN2] = useState("")
    const [cpN3, setCPN3] = useState("")

    const refs = useRef([null, null, null]);

    const handleChange = (index, event) => {
        const min = 0;
        const max = 2;
        const value = Math.max(min, Math.min(max, Number(event.target.value)));

        if (index == 0) { setCPN1(value) }
        if (index == 1) { setCPN2(value) }
        if (index == 2) { setCPN3(value) }

    };

    const handleClearAll = (index) => {
        if (index == 0) { setCPN1("") }
        if (index == 1) { setCPN2("") }
        if (index == 2) { setCPN3("") }
    };

    const competencias = [cpN1, cpN2, cpN3]


    return {
        cpN1,
        cpN2,
        cpN3,
        setCPN1,
        setCPN2,
        setCPN3,
        render: (
            <div className="">
                <div className="flex w-full justify-center space-x-5 md:space-x-10 ">
                    {competencias.map((competency, index) => (
                        <div
                            key={index}
                            className="flex basis-1/3 w-full justify-between items-center"
                        >
                            <label className=" mt-2 ">
                                <div className="flex justify-between items-center space-x-1">
                                    <input
                                        min="0"
                                        max="2"
                                        ref={refs.current[index]}
                                        type="number"
                                        value={competencias[index]}
                                        onChange={(event) => handleChange(index, event)}
                                        className=" w-14 h-8 md:w-16 rounded-lg focus:border-1 focus:shadow-lg "
                                    />
                                </div>
                            </label>
                            <div className="">
                                <button
                                    type="button"
                                    value={index}
                                    onClick={() => handleClearAll(index)}
                                    className="w-2 h-2 text-blue-500 pl-1 "
                                >
                                    <AiOutlineClear />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }


}

export default ComptencyOneRowKeyboard;
