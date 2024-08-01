import React, { useState, useEffect } from 'react';
import { AiOutlineClear } from 'react-icons/ai';

const ModalCompetencyGrades = ({ initialData, onRowCheck, onChange, onClear }) => {
    const [tableData, setTableData] = useState(initialData);

    const labels = ['CLF', 'UTF', 'UCM', 'PRC', 'ULC'];

    const handleInputChange = (rowIndex, colIndex, value) => {
        // Restrict input to 0, 1, or 2
        const validValue = value !== '' && [0, 1, 2].includes(Number(value)) ? value : 0;
        const updatedData = [...tableData];
        updatedData[rowIndex][colIndex] = validValue;;
        setTableData(updatedData);
        onChange(updatedData);
    };

    const handleClear = (rowIndex, colIndex) => {
        handleInputChange(rowIndex, colIndex, 0);
        onClear(rowIndex, colIndex);
    };

    const handleRowCheck = (rowIndex, checked) => {
        onRowCheck(rowIndex, checked);
    };


    useEffect(() => {
        setTableData(initialData);
    }, [initialData]);

    return (
        <div className="flex flex-col justify-center items-center w-auto">
            <table className="border-collapse border bg-blue-200">
                <thead>
                    <tr className="text-center">
                        <th className="border p-2 w-16 text-blue-600">Nivel 1</th>
                        <th className="border p-2 w-16 text-blue-600">Nivel 2</th>
                        <th className="border p-2 w-16 text-blue-600">Nivel 3</th>
                        <th className="border p-2 w-14"></th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="text-center">
                            <td className="border p-2 w-16">
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        min="0"
                                        max="2"
                                        value={row[0]}
                                        onChange={(e) =>
                                            handleInputChange(rowIndex, 0, e.target.value)
                                        }
                                        className="w-16 bg-blue-200 h-8"
                                        disabled={!row[3]}
                                    />
                                    <button
                                        className="ml-2 p-1 text-blue-600 ring-1 hover:text-navy-800 hover:ring-offset-2 hover:ring-2"
                                        onClick={(e) => handleClear(rowIndex, 0, e.preventDefault())}
                                        disabled={!row[3]}
                                    >
                                        <AiOutlineClear />
                                    </button>
                                </div>
                            </td>
                            <td className="border p-2 w-16">
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        min="0"
                                        max="2"
                                        value={row[1]}
                                        onChange={(e) =>
                                            handleInputChange(rowIndex, 1, e.target.value)
                                        }
                                        className="w-16 bg-blue-200 h-8"
                                        disabled={!row[3]}
                                    />
                                    <button
                                        className="ml-2 p-1 text-blue-600 ring-1 hover:text-navy-800 hover:ring-offset-2 hover:ring-2"
                                        onClick={(e) => handleClear(rowIndex, 1, e.preventDefault())}
                                        disabled={!row[3]}
                                    >
                                        <AiOutlineClear />
                                    </button>
                                </div>
                            </td>
                            <td className="border p-2 w-16">
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        min="0"
                                        max="2"
                                        value={row[2]}
                                        onChange={(e) =>
                                            handleInputChange(rowIndex, 2, e.target.value)
                                        }
                                        className="w-16 bg-blue-200 h-8"
                                        disabled={!row[3]}
                                    />
                                    <button
                                        className="ml-2 p-1 text-blue-600 ring-1 hover:text-navy-800 hover:ring-offset-2 hover:ring-2"
                                        onClick={(e) => handleClear(rowIndex, 2, e.preventDefault())}
                                        disabled={!row[3]}
                                    >
                                        <AiOutlineClear />
                                    </button>
                                </div>
                            </td>
                            <td className="border p-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={row[3]}
                                        onChange={(e) => handleRowCheck(rowIndex, e.target.checked)}
                                        className="w-5 h-5"
                                    />
                                    <label className="ml-2">{labels[rowIndex]}</label>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ModalCompetencyGrades;