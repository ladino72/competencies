import React from 'react';
import { Bar } from 'react-chartjs-2';

const GroupedBarChart = ({ gradesData, competencyLabels }) => {
  const datasets = gradesData.map((data, index) => {
    return {
      label: data.group,
      backgroundColor: `hsla(${index * 30}, 80%, 60%, 0.6)`,
      borderColor: `hsla(${index * 30}, 80%, 60%, 1)`,
      borderWidth: 1,
      hoverBackgroundColor: `hsla(${index * 30}, 80%, 50%, 0.8)`,
      hoverBorderColor: `hsla(${index * 30}, 80%, 60%, 1)`,
      data: data.grades,
    };

  });

  const data = { labels: competencyLabels, datasets };

  return (
    <div className="px-8 py-4" style={{ width: '500px', }}>
      <Bar
        data={data}
        width={100}
        height={50}
        options={{

          maintainAspectRatio: true,
        }}
      />
    </div>
  );
}




export default GroupedBarChart;