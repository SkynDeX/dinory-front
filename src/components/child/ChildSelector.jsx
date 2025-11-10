import React, { useEffect, useState } from "react";
import { getChildren } from "../../services/api/childApi";
import "./ChildSelector.css";
import bkid from "../../assets/icons/bkid.png";
import gkid from "../../assets/icons/gkid.png";

// 자녀 선택 드롭다운(대시보드용)
function ChildSelector({onSelectChild, selectedChildId}) {

    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    // 자녀 목록 불러오기
    useEffect(() => {
        const fetchChildren = async () => {
            try {
                setLoading(true);
                const response = await getChildren();
                const childrenData = response.data || response;
                setChildren(Array.isArray(childrenData) ? childrenData : []);

                // 첫 번째 자녀 자동 선택 (seletcedChildId가 없을 경우)
                if (!selectedChildId && childrenData.length > 0) {
                    onSelectChild?.(childrenData[0]);
                }
            } catch (e) {
                console.error('자녀 목록 조회 실패:', e);
                setError('자녀 목록을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchChildren();
    }, [selectedChildId, onSelectChild]);

    // 자녀 선택 핸들러
    const handleSelectChild = (child) => {
        onSelectChild?.(child);
        setIsOpen(false);
    };

    // 나이 계산
    const calculateAge = (birthDate) => {
        if (!birthDate) return '?';

        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    // 선택된 자녀 찾기
    const currentChild = Array.isArray(children) ? children.find(child => child.id === selectedChildId) : null;

    // 로딩 중
    if (loading) {
        return (
            <div className="child_selector">
                <div className="child_selector_button_disabled">
                    <span>불러오는 중...</span>
                </div>
            </div>
        );
    }

    // 에러 발생
    if (error) {
        return(
            <div className="child_selector">
                <div className="child_selector_error">
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    // 자녀 없음
    if (children.length === 0) {
        return (
            <div className="child_selector">
                <div className="child_selector_button_disabled">
                    <span>등록된 자녀가 없습니다</span>
                </div>
            </div>
        );
    }

    return(
        <div className="child_selector">
            {/* 선택 버튼 */}
            <button
                className="child_selector_button"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <div className="selector_current">
                    {currentChild ? (
                        <>
                            <img
                                src={currentChild.gender === "male" ? bkid : gkid}
                                alt="child avatar"
                                className="child_avatar_small_img"
                            />
                            <span className="child_name">{currentChild.name}</span>
                            <span className="child_age">
                                &nbsp;({calculateAge(currentChild.birthDate)}세)
                            </span>
                        </>
                    ) : (
                        <span>자녀를 선택하세요</span>
                    )}
                    <span className="selector_arrow">{isOpen ? " ▲" : " ▼"}</span>
                </div>
            </button>

            {/* 드롭다운 메뉴 */}
            {isOpen && (
                <div className="child_selector_dropdown">
                    <ul className="child_selector_list">
                        {children.map((child) => (
                            <li
                                key={child.id}
                                className={`child_selector_item ${selectedChildId === child.id ? 'active' : ''}`}
                                onClick={() => handleSelectChild(child)}
                            >
                                <div className="child_item_content">
                                    {/* 아바타 */}
                                    <img
                                        src={child.gender === "male" ? bkid : gkid}
                                        alt="child avatar"
                                        className="child_avatar_small_img"
                                    />

                                    {/* 정보 */}
                                    <span className="child_name">{child.name}</span>
                                    <span className="child_age">
                                        &nbsp;({calculateAge(child.birthDate)}세)
                                    </span>  
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 외부 클릭 시 닫기 */}
            {isOpen && (
                <div 
                    className="selector_overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}

export default ChildSelector;
