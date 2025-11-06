import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Tooltip 플러그인 명시적으로 등록
ChartJS.register(ArcElement, Tooltip, Legend);

function ChoicePatternChart({ data }) {
    if (!data || data.length === 0) return null;

    console.log('ChoicePatternChart data:', data);

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
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
        interaction: {
            mode: 'point',
            intersect: true
        },
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
                enabled: true,
                mode: 'point',
                intersect: true,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#2fa36b',
                borderWidth: 2,
                padding: 16,
                displayColors: true,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13,
                    lineHeight: 1.8
                },
                bodySpacing: 8,
                callbacks: {
                    title: function(tooltipItems) {
                        console.log('🎯 Tooltip title triggered!', tooltipItems);
                        return tooltipItems[0].label;
                    },
                    label: function(context) {
                        console.log('🎯 Tooltip label triggered!', context);
                        const index = context.dataIndex;
                        const item = data[index];
                        console.log('🎯 Item data:', item);

                        if (!item) return `비율: ${context.parsed}%`;

                        const lines = [];
                        lines.push(`비율: ${context.parsed}%`);

                        if (item.points !== undefined) {
                            lines.push(`총 점수: ${item.points}점`);
                        }

                        if (item.count !== undefined) {
                            lines.push(`선택 횟수: ${item.count}회`);
                        }

                        return lines;
                    }
                }
            }
        }
    };

    return <Doughnut data={chartData} options={options} />;
}

export default ChoicePatternChart;