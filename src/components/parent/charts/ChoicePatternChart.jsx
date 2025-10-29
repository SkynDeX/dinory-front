import React from "react";
import { Chart as ChartJS, ArcElement,Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register( ArcElement, Tooltip, Legend );

function ChoicePatternChart({ data }) {
    if (!data) return null;

    const chartData = {
        labels: data.map(p => p.name),
        datasets: [{
            data: data.map(p => p.value),
            backgroundColor: data.map(p => p.color),
            borderWidth: 3,
            borderColor: '#fff',
            hoverOffset: 8
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.label + ': ' + context.parsed + '%';
                    }
                }
            }
        }
    };

    return <Doughnut data={chartData} options={options} />;
}

export default ChoicePatternChart;