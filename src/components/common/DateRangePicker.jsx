import React, { useState, useEffect } from 'react';
import './DateRangePicker.css';

function DateRangePicker({ mode = 'dashboard', period, onPeriodChange, onDateRangeChange }) {
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [showCustom, setShowCustom] = useState(false);

    // mode에 따른 기간 옵션
    const periodOptions = mode === 'dashboard'
        ? [
            { value: 'day', label: '일간' },
            { value: 'week', label: '주간' },
            { value: 'month', label: '월간' }
          ]
        : [
            { value: 'month', label: '월간' },
            { value: 'quarter', label: '분기' },
            { value: 'halfyear', label: '반기' }
          ];

    // 커스텀 날짜 변경 시 부모에게 전달
    useEffect(() => {
        if (showCustom && customStart && customEnd && onDateRangeChange) {
            onDateRangeChange(customStart, customEnd);
        }
    }, [customStart, customEnd, showCustom, onDateRangeChange]);

    const handlePeriodClick = (value) => {
        if (value === 'custom') {
            setShowCustom(true);
            return;
        }
        setShowCustom(false);
        onPeriodChange(value);
    };

    const handleApplyCustom = () => {
        if (customStart && customEnd) {
            if (new Date(customStart) > new Date(customEnd)) {
                alert('시작 날짜는 종료 날짜보다 이전이어야 합니다.');
                return;
            }
            onDateRangeChange(customStart, customEnd);
        }
    };

    const handleCancelCustom = () => {
        setShowCustom(false);
        setCustomStart('');
        setCustomEnd('');
        onPeriodChange(periodOptions[0].value);
    };

    return (
        <div className="date_range_picker">
            <div className="period_filters">
                {periodOptions.map(option => (
                    <button
                        key={option.value}
                        className={`period_btn ${period === option.value && !showCustom ? 'active' : ''}`}
                        onClick={() => handlePeriodClick(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
                <button
                    className={`period_btn ${showCustom ? 'active' : ''}`}
                    onClick={() => handlePeriodClick('custom')}
                >
                    사용자 지정
                </button>
            </div>

            {showCustom && (
                <div className="custom_date_inputs">
                    <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="date_input"
                    />
                    <span className="date_separator">~</span>
                    <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="date_input"
                    />
                    <button
                        className="date_apply_btn"
                        onClick={handleApplyCustom}
                        disabled={!customStart || !customEnd}
                    >
                        적용
                    </button>
                    <button
                        className="date_cancel_btn"
                        onClick={handleCancelCustom}
                    >
                        취소
                    </button>
                </div>
            )}
        </div>
    );
}

export default DateRangePicker;