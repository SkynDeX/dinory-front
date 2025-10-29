import React from "react";
import { Chart as ChartJS, RadialLinearScale, PointElement,LineElement,Filler,Tooltip, Legend} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement,LineElement,Filler,Tooltip, Legend);

function AbilityRadarChart({ data }) {
    if (!data) return null;

    const chartData = {
        labels: Object.keys(data),
        datasets: [{
            label: '능력 발달',
            data: Object.values(data),
            backgroundColor: 'rgba(47, 163, 107, 0.2)',
            borderColor: '#2fa36b',
            borderWidth: 2,
            pointBackgroundColor: '#2fa36b',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#2fa36b',
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    const options = {
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20,
                    font: {
                        size: 11
                    }
                },
                pointLabels: {
                    font: {
                        size: 13,
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.label + ': ' + context.parsed.r + '점';
                    }
                }
            }
        },
        maintainAspectRatio: false
    };


    return <Radar data={chartData} options={options} />

}

export default AbilityRadarChart;