import React, { useState } from 'react'
import BarChart from '../components/BarChart';
import { UserData } from "./../../../src/Data"

function NoPage() {

    const options = {
        responsive: true,
        maintainAspectRatio: true,

    }

    const userData = {
        labels: UserData.map((data) => data.year),
        datasets: [
            {
                label: "N1",
                data: UserData.map((data) => data.userGain),
                backgroundColor: [
                    "rgba(75,192,192,1)",
                    "#fffff1",
                    "#50AF95",
                    "#f3ba2f",
                    "#2a71d0",
                ],
                borderColor: "black",
                borderWidth: 2,
            },
            {
                label: "N2",
                data: UserData.map((data) => data.userLost),
                backgroundColor: [
                    "rgba(75,192,192,1)",
                    "#eff0f1",
                    "#50Af9f",
                    "#f3ba2f",
                    "#2a71ff",
                ],
                borderColor: "black",
                borderWidth: 2,
            },
            {
                label: "N3",
                data: UserData.map((data) => data.rob),
                backgroundColor: [
                    "rgba(75,192,192,1)",
                    "#fffff1",
                    "#50AF95",
                    "#f3ba2f",
                    "#2a71d0",
                ],
                borderColor: "black",
                borderWidth: 2,
            },
            {
                label: "Ref",
                data: UserData.map((data) => data.ref),
                backgroundColor: [
                    "rgba(75,192,192,1)",
                    "#fffff1",
                    "#50AF95",
                    "#f3ba2f",
                    "#2a71d0",
                ],
                borderColor: "black",
                borderWidth: 2,
            },
        ],
    }

    return (
        <div className='flex flex-col justify-center items-center w-full md:flex-row m-1 md:space-x-2'>


            <div className='flex justify-center basis-1/3 mt-20 w-full h-fit'>
                <BarChart chartData={userData} />
            </div>



            <div className='flex justify-center basis-1/3 mt-20 w-full h-fit'>
                <BarChart chartData={userData} options={options} />
            </div>

            <div className='flex justify-center basis-1/3 mt-20 w-full h-fit'>
                <BarChart chartData={userData} options={options} />
            </div>

        </div>


    )
}

export default NoPage