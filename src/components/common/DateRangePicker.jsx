import React, { useState, useEffect, useRef } from 'react';
import './DateRangePicker.css';

function DateRangePicker({ mode = 'dashboard', period, onPeriodChange, onDateRangeChange, initialStart = '', initialEnd = '' }) {
    const [customStart, setCustomStart] = useState(initialStart);
    const [customEnd, setCustomEnd] = useState(initialEnd);
    const [showCustom, setShowCustom] = useState(false);
    const [customSelected, setCustomSelected] = useState(!!(initialStart && initialEnd));
    const popupRef = useRef(null);

    // initialStart/initialEnd가 바뀌면 선택 상태 동기화
    useEffect(() => {
        setCustomSelected(!!(initialStart && initialEnd));
    }, [initialStart, initialEnd]);

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

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowCustom(false);
            }
        };

        if (showCustom) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCustom]);

    const handlePeriodClick = (value) => {
        if (value === 'custom') {
            // 토글 기능: 이미 열려있으면 닫고, 닫혀있으면 열기
            setShowCustom((prev) => !prev);
            setCustomSelected(true);
            return;
        }
        // 다른 기간 선택 시 팝업 닫고 해당 기간으로 변경
        setShowCustom(false);
        setCustomSelected(false);
        onPeriodChange(value);
    };

    const handleApplyCustom = () => {
        if (customStart && customEnd) {
            if (new Date(customStart) > new Date(customEnd)) {
                alert('시작 날짜는 종료 날짜보다 이전이어야 합니다.');
                return;
            }
            onDateRangeChange(customStart, customEnd);
            setCustomSelected(true);
            setShowCustom(false);
        }
    };

    const handleCancelCustom = () => {
        // 사용자 지정 팝업만 닫기 (period는 변경하지 않음)
        setShowCustom(false);
    };

    return (
        <div className="date_range_picker">
            <div className="period_filters">
                {periodOptions.map(option => (
                    <button
                        key={option.value}
                        className={`period_btn ${period === option.value && !customSelected ? 'active' : ''}`}
                        onClick={() => handlePeriodClick(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
                <div className="custom_btn_wrapper" ref={popupRef}>
                    <button
                        className={`period_btn ${customSelected ? 'active' : ''}`}
                        onClick={() => handlePeriodClick('custom')}
                    >
                        사용자 지정
                    </button>

                    {showCustom && (
                        <div className="custom_date_popup">
                            <div className="popup_arrow"></div>
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
                                <div className="popup_buttons">
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
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DateRangePicker;