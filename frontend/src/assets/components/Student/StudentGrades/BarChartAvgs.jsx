import React from 'react';
import { Bar } from 'react-chartjs-2';

const BarChartAvgs = ({ InfoBarChart }) => {
    // Sample data
    const data = {
        labels: ['CLFN1', 'CLFN2', 'CLFN3', "PRC1", "PRC2", "PRC3", "UCM1", "UCM2", "UCM3", "ULC1", "ULC2", "ULC3", "UTF1", "UTF2", "UTF3"],
        datasets: [
            {
                label: 'Avg. Estudiante',
                data: InfoBarChart.statsByStudent,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                stack: 'stack'
            },
            {
                label: 'Avg. Grupo',
                data: InfoBarChart.statsByGroup,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                stack: 'stack'
            },
            {
                label: 'Avg. Curso',
                data: InfoBarChart.statsByCourse,
                backgroundColor: 'rgba(255, 206, 86, 0.5)',
                stack: 'stack'
            },

        ]
    };

    // Options object to control the width of the columns
    const options = {
        indexAxis: 'x',
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                beginAtZero: true,
            },
        },
        // layout: {
        //     padding: {
        //         left: 40, // Adjust padding if needed
        //         right: 40, // Adjust padding if needed
        //         top: 5, // Adjust padding if needed
        //         bottom: 10, // Adjust padding if needed
        //     },
        // },
        responsive: true,
        barPercentage: 0.6, // Adjust the width of the bars
        categoryPercentage: 0.8, // Adjust the width of the bars
    };

    return (
        <div className="px-4" style={{ width: '550px' }}> {/* Adjust width and height as needed */}

            <Bar data={data} options={options} />
        </div>
    );



};

export default BarChartAvgs;
