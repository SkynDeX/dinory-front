import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function EmotionLineChart({ data, period }) {
    if (!data) return null;

    // 비율(%) 계산
    const calculatePercentage = (item) => {
        const total = item.positive + item.negative;
        if (total === 0) return { positivePercent: 0, negativePercent: 0 };

        const positivePercent = Math.round((item.positive / total) * 100);
        const negativePercent = Math.round((item.negative / total) * 100);

        return { positivePercent, negativePercent };
    };

    const chartData = {
        labels: data.map(e => e.label),
        datasets: [
            {
                label: '긍정 감정',
                data: data.map(e => {
                    const { positivePercent } = calculatePercentage(e);
                    return positivePercent;
                }),
                borderColor: '#2fa36b',
                backgroundColor: '#2fa36b',
                tension: 0.4,
                fill: false,
                pointRadius: 5,
                pointHoverRadius: 5,
                borderWidth: 3,
                borderDash: []  // 실선
            },
            {
                label: '부정 감정',
                data: data.map(e => {
                    const { negativePercent } = calculatePercentage(e);
                    // 겹침 방지: 같은 값이면 살짝 아래로 (0.5% 차이)
                    const { positivePercent } = calculatePercentage(e);
                    return negativePercent === positivePercent ? negativePercent - 0.5 : negativePercent;
                }),
                borderColor: '#ff9b7a',
                backgroundColor: '#ff9b7a',
                tension: 0.4,
                fill: false,
                pointRadius: 5,
                pointHoverRadius: 5,
                borderWidth: 3,
                borderDash: [5, 5],  // 점선 (5px 선, 5px 간격)
                pointStyle: 'rectRot'  // 포인트를 다이아몬드 모양으로
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        elements: {
            point: {
                hoverRadius: 5,
                hoverBorderWidth: 3
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    boxHeight: 8,
                },

                padding: {
                    top: 10
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 12, weight: '500' },
                bodyFont: { size: 11 },
                padding: 10,
                callbacks: {
                    label: function(context) {
                        const dataIndex = context.dataIndex;
                        const dataPoint = data[dataIndex];
                        const emotionType = context.dataset.label === '긍정 감정' ? 'positive' : 'negative';
                        const count = dataPoint[emotionType];
                        const percent = context.parsed.y;

                        return context.dataset.label + ': ' + percent + '% (' + count + '회)';
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
                    font: { size: 10 },
                    callback: function(value) {
                        return value + '%';
                    }
                }
            },
            x: {
                ticks: {
                    font: { size: 10 }
                }
            }
        }
    }


    return <Line data={chartData} options={options} />;
}

export default EmotionLineChart;