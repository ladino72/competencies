import React, { useState, useEffect } from 'react';
import BarChart from './BarChart'

import api from "../../../../utils/AxiosInterceptos/interceptors"

function HistogramsCourse({ courseId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [charts, setCharts] = useState([]);
    const [titleCharts, setTitleCharts] = useState([]);
    const [participants, setParticipants] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`http://localhost:3500/statistics/histogram/courseId/${courseId}/competency`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setData(response.data.activities);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchData();
    }, [courseId, token]);

    useEffect(() => {
        if (data && data.length) {
            buildHistograms();
        }
    }, [data]);

    function buildHistograms() {
        const newCharts = [];
        const newTitleCharts = [];
        const newparticipants = [];


        data.forEach(item => {
            newCharts.push([
                item.histogramN1.map(({ bucket, count }) => ({ label: bucket, value: count })),
                item.histogramN2.map(({ bucket, count }) => ({ label: bucket, value: count })),
                item.histogramN3.map(({ bucket, count }) => ({ label: bucket, value: count }))
            ]);
            newTitleCharts.push(item._id.competencia);
            newparticipants.push(item.participantsN1, item.participantsN2, item.participantsN3)
        });

        setCharts(newCharts);
        setTitleCharts(newTitleCharts);
        setParticipants(newparticipants);
    }

    return (
        <div className='flex flex-col justify-center items-center mx-4 '>
            {loading ? (
                <p>Loading data...</p>
            ) : (
                <>
                    <div className='text-blue-600  mt-4 mb-4 px-4'>
                        <p> Histograma: % estudiantes por rangos de notas, competencias DCN por nivel.</p>
                    </div>
                    {charts.map((chartData, index) => (
                        <div key={index}>
                            <span className='self-start text-normal px-4'>Total participantes: {participants[index]}</span>
                            <div className="grid sm:grid-cols-1 gap-6 lg:grid-cols-3 mt-1 px-4 pb-2 ">
                                {chartData.map((data, dataIndex) => (
                                    <div key={dataIndex} style={{ width: '350px' }}>
                                        <BarChart data={data} title={`${titleCharts[index]} N${dataIndex + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
export default HistogramsCourse;