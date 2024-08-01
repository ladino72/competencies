import React, { useState } from 'react';
import GModal from './GModal';
import Tooltip from './ToolTip';

export const GComparison = ({ data, courseName, loading }) => {


    const [modalOpen, setModalOpen] = useState(false);
    const [contentModal, setContentModal] = useState("");


    const openModal = (content) => {
        console.log('Opening modal with content:', content);
        setContentModal(content);
        setModalOpen(true);
    };

    const closeModal = () => {
        console.log('Closing modal');
        setModalOpen(false);
    };

    console.log("data:::::>", data[0].info[0]._id.group.g_Id)

    return (
        <div className='flex flex-col justify-center items-center mx-4 overflow-x-auto max-w-full max-h-full overflow-y-auto pb-10'>
            {loading ? (
                <p>Loading data...</p>
            ) : (
                <div className='w-full'>
                    {data.map((competency, index) => (
                        <div key={Math.random()}>
                            <h2 className='py-2'>{competency._id}</h2>
                            <div className="overflow-x-auto max-w-full">
                                <div className="overflow-y-auto max-h-full">
                                    <table className="table-auto bg-slate-100 ">
                                        <thead>
                                            <tr>
                                                <th className="border px-4 py-2 text-center">Grupo</th>
                                                <th className="border px-4 py-2 text-center">#Actividades</th>
                                                <th className="border px-4 py-2 text-center">Realizada(s) en</th>
                                                <th className="border px-4 py-2 text-center">#{">"}UN1 </th>
                                                <th className="border px-4 py-2 text-center">#{">"}UN2 </th>
                                                <th className="border px-4 py-2 text-center">#{">"}UN3 </th>
                                                <th className="border px-4 py-2 text-center">#RN1</th>
                                                <th className="border px-4 py-2 text-center">#RN2</th>
                                                <th className="border px-4 py-2 text-center">#RN3</th>
                                                <th className="border px-4 py-2 text-center">%PGN1</th>
                                                <th className="border px-4 py-2 text-center">%PGN2</th>
                                                <th className="border px-4 py-2 text-center">%PGN3</th>
                                                <th className="border px-4 py-2 text-center">%PCN1</th>
                                                <th className="border px-4 py-2 text-center">%PCN2</th>
                                                <th className="border px-4 py-2 text-center">%PCN3</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {competency.info.sort((a, b) => a._id.group.g_Id.localeCompare(b._id.group.g_Id)).map((info) => (
                                                // <tr key={info._id.course}>
                                                <tr key={Math.random()}>

                                                    <td className="border px-4 py-2 text-center hover:text-blue-600 hover:font-semibold">
                                                        <Tooltip text={`${info.teacherName}`}>
                                                            {info._id.group.g_Id.slice(-2)}
                                                        </Tooltip>
                                                    </td>
                                                    <td className="border px-4 py-2 text-center">{info.totalActivities}</td>
                                                    <td className="border px-4 py-2 text-center">
                                                        <div className="flex justify-between items-center space-x-1 sm:w-full md:w-48">
                                                            <span className="whitespace-nowrap">T1: {info.numOfactivitiesPerformedInTerm.T1}</span>
                                                            <span className="whitespace-nowrap">T2: {info.numOfactivitiesPerformedInTerm.T2}</span>
                                                            <span className="whitespace-nowrap">T3: {info.numOfactivitiesPerformedInTerm.T3}</span>
                                                        </div>
                                                    </td>
                                                    <td className="border px-4 py-2 text-center">{info.countStudentsAboveThresholdForN1}</td>
                                                    <td className="border px-4 py-2 text-center">{info.countStudentsAboveThresholdForN2}</td>
                                                    <td className="border px-4 py-2 text-center">{info.countStudentsAboveThresholdForN3}</td>
                                                    <td className="border px-4 py-2 text-center">{info.numTakersN1}</td>
                                                    <td className="border px-4 py-2 text-center">{info.numTakersN2}</td>
                                                    <td className="border px-4 py-2 text-center">{info.numTakersN3}</td>
                                                    <td className="border px-4 py-2 text-center">{parseFloat(info.passsedPercentN1_RelativeToGroup).toFixed(1)}</td>
                                                    <td className="border px-4 py-2 text-center">{parseFloat(info.passsedPercentN2_RelativeToGroup).toFixed(1)}</td>
                                                    <td className="border px-4 py-2 text-center">{parseFloat(info.passsedPercentN3_RelativeToGroup).toFixed(1)}</td>
                                                    <td className="border px-4 py-2 text-center">{parseFloat(info.passsedPercentN1_RelativeToCourse).toFixed(1)}</td>
                                                    <td className="border px-4 py-2 text-center">{parseFloat(info.passsedPercentN2_RelativeToCourse).toFixed(1)}</td>
                                                    <td className="border px-4 py-2 text-center">{parseFloat(info.passsedPercentN3_RelativeToCourse).toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default GComparison;
