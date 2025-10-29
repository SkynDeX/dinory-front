import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function EmotionLineChart({ data, period }) {
    if (!data) return null;

    const chartData = {
        labels: data.map(e => e.label),
        datasets: [
            {
                label: '긍정 감정',
                data: data.map(e => e.positive),
                borderColor: '#2fa36b',
                backgroundColor: 'rgba(47, 163, 107, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            },
            {
                label: '부정 감정',
                data: data.map(e => e.negative),
                borderColor: '#ff9b7a',
                backgroundColor: 'rgba(255, 155, 122, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
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
                        return context.dataset.label + ': ' + context.parsed.y + '%';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20,
                    callback: function(value) {
                        return value + '%';
                    }
                }
            }
        }
    };


    return <Line data={chartData} options={options} />;
}

export default EmotionLineChart;