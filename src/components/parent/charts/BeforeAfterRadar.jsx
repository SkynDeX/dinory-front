import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function BeforeAfterRadar({ data }) {
    if (!data || !data.start || !data.end) {
        return <p>데이터가 없습니다.</p>;
    }

    const labels = Object.keys(data.start);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: '이전',
                data: Object.values(data.start),
                backgroundColor: 'rgba(135, 206, 235, 0.2)',
                borderColor: '#87ceeb',
                borderWidth: 2,
                pointBackgroundColor: '#87ceeb',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#87ceeb'
            },
            {
                label: '현재',
                data: Object.values(data.end),
                backgroundColor: 'rgba(47, 163, 107, 0.2)',
                borderColor: '#2fa36b',
                borderWidth: 2,
                pointBackgroundColor: '#2fa36b',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#2fa36b'
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            r: {
                beginAtZero: true,
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20,
                    font: { size: 12 }
                },
                pointLabels: {
                    font: { size: 14, weight: '600' }
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: { size: 14, weight: '600' },
                    padding: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ' + context.parsed.r + '점';
                    }
                }
            }
        }
    };

    return <Radar data={chartData} options={options} />;
}

export default BeforeAfterRadar;
