import React from "react";
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function AbilityRadarChart({ data }) {
    if (!data || !data.abilities) {
        return <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>데이터가 없습니다.</p>;
    }

    const labels = [
        "정서 인식 및 조절",
        "사회적 상호작용",
        "자아 개념",
        "도전 및 적응력",
        "공감 및 친사회성"
    ];

    const values = labels.map(label => data.abilities[label] || 0);

    const chartData = {
        labels: labels,
        datasets: [{
            label: '점수',
            data: values,
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
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        layout: {
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10
            }
        },
        scales: {
            r: {
                beginAtZero: true,
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20,
                    font: { size: 10 },
                    backdropColor: 'transparent'
                },
                pointLabels: {
                    font: { size: 11, weight: '500' },
                    color: '#444'
                },
                grid: {
                    color: '#e0e0e0'
                },
                angleLines: {
                    color: '#e0e0e0'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 12,
                displayColors: true,
                callbacks: {
                    title: function(tooltipItems) {
                        return tooltipItems[0].label;
                    },
                    label: function(context) {
                        return Math.round(context.parsed.r) + '점';
                    }
                }
            }
        }
    };

    return (
        <div style={{ width: '100%', height: '350px' }}>
            <Radar data={chartData} options={options} />
        </div>
    );
}

export default AbilityRadarChart;