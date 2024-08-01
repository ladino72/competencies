import React from 'react';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ data, title }) => {
    if (!Array.isArray(data) || data.some((item) => typeof item !== 'object')) {
        return (
            <div className="error-message">
                Invalid data prop: Please provide an array of objects with 'label' and 'value' properties.
            </div>
        );
    }

    const chartData = {
        labels: data.map((item) => item.label),
        datasets: [
            {
                // label: data.label || 'Data',
                label: title || 'Data',
                data: data.map((item) => item.value),

                borderColor: 'rgba(255, 99, 132, 0.7)', // Adjusted border color (accent with lower opacity)
                borderWidth: 1,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',  // Accent color (light salmon)
                    'rgba(255, 204, 204, 0.2)', // Complementary color (light pink)
                    'rgba(239, 225, 215, 0.2)', // Neutral tone (light beige)
                    'rgba(225, 245, 254, 0.2)', // Light blue variation
                    'rgba(153, 204, 255, 0.2)', // Lighter blue variation
                ],
            },
        ],
        // Add a new options object for chart customization
        options: {
            scales: {
                x: {
                    grid: { // Gridlines
                        color: 'rgba(221, 221, 221, 0.7)', // Light gray gridlines
                        borderColor: 'rgba(221, 221, 221, 1)', // Light gray gridline borders
                    },
                    ticks: { // Axis labels (x-axis)
                        fontColor: 'rgba(0, 0, 0, 0.8)', // Darker gray text
                    },
                },
                y: {
                    grid: { // Gridlines
                        color: 'rgba(221, 221, 221, 0.7)', // Light gray gridlines
                        borderColor: 'rgba(221, 221, 221, 1)', // Light gray gridline borders
                    },
                    ticks: { // Axis labels (y-axis)
                        fontColor: 'rgba(0, 0, 0, 0.8)', // Darker gray text
                    },
                },
            },
        },
    };



    const chartOptions = {

        scales: {
            y: {
                ticks: {
                    beginAtZero: true,
                },
            },
        },
    };

    return <Bar data={chartData} options={chartOptions} />;
};

export default BarChart;