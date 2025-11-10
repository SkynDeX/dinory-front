import React, { useEffect, useState } from "react";
import { useChild } from "../../context/ChildContext"; // ChildContext
import ChildRegistrationForm from "./ChildRegistrationForm";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import "./ChildManagement.css";
import bkid from "../../assets/icons/bkid.png";
import gkid from "../../assets/icons/gkid.png";
import shock from "../../assets/icons/shock.png";

// 자녀 관리
function ChildManagement() {
    const { childrenList, addChild, updateChild, deleteChild, fetchChildren, loading } = useChild();
    const [children, setChildren] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);

    // context에서 자녀 목록 받아오기
    useEffect(() => {
        setChildren(childrenList);
    }, [childrenList]);

    
    // 자녀 추가
    const handleAddChild = async (formData) => {
        try {
            await addChild(formData);
            setIsAddModalOpen(false);
            alert(`${formData.name} 등록이 완료되었습니다!`);
            await fetchChildren();
        } catch (e) {
            console.error("자녀 추가 실패:", e);
            alert("자녀 추가에 실패했습니다.");
        }
    };

    // 자녀 수정
    const handleEditChild = async (formData) => {
        try {
            await updateChild(selectedChild.id, formData);
            setIsEditModalOpen(false);
            setSelectedChild(null);
            alert("수정이 완료되었습니다!");
            await fetchChildren();
        } catch (e) {
            console.error("자녀 수정 실패:", e);
            alert("자녀 수정에 실패했습니다.");
        }
    };

    // 자녀 삭제
    const handleDeleteChild = async (childId) => {
        if (window.confirm("정말 삭제하시겠습니까? 모든 활동 기록이 삭제됩니다.")) {
            try {
                await deleteChild(childId);
                alert("삭제되었습니다.");
                await fetchChildren();
            } catch (e) {
                console.error("자녀 삭제 실패:", e);
                alert("자녀 삭제에 실패했습니다.");
            }
        }
    };

    // 수정 모달 열기
    const openEditModal = (child) => {
        setSelectedChild(child);
        setIsEditModalOpen(true);
    };

    // 상세 모달 열기
    const openDetailModal = (child) => {
        setSelectedChild(child);
        setIsDetailModalOpen(true);
    };

    // 나이 계산
    const calculateAge = (birthDate) => {
        if (!birthDate) return "?";
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
        }
        return age;
    };

    if (loading) {
        return <div className="child_management_loading">불러오는 중...</div>;
    }

    return (
        <div className="child_management_wrapper">
        {/* 헤더 */}
        <div className="management_header">
            <div>
            <h1 className="management_title">자녀 관리</h1>
            <p className="management_subtitle">등록된 자녀: {children.length}명</p>
            </div>
            <button className="add_child_btn" onClick={() => setIsAddModalOpen(true)}>
            + 자녀 추가
            </button>
        </div>

        {/* 자녀 카드 그리드 */}
        {children.length === 0 ? (
            <div className="empty_state">
            <div className="empty_icon">
                <img src={shock} alt="no child" className="empty_icon_img" />
            </div>
            <h3>등록된 자녀가 없습니다</h3>
            <p>첫 번째 자녀를 등록하고 DinoStory를 시작해보세요</p>
            <button className="add_child_btn" onClick={() => setIsAddModalOpen(true)}>
                + 자녀 추가하기
            </button>
            </div>
        ) : (
            <div className="child_grid">
            {children.map((child) => (
                <div key={child.id} className="child_item_card">
                {/* 카드 헤더 */}
                <div className="card_header_section">
                    <div className="child_avatar_section">
                    {/* 아바타 이미지 */}
                    <div className="child_avatar_circle">
                        <img
                            src={child.gender === "male" ? bkid : gkid}
                            alt="child avatar"
                            className="child_avatar_img_small"
                        />
                    </div>
                    <div className="child_info">
                        <h3 className="child_item_name">{child.name}</h3>
                        <p className="child_item_age">
                            {calculateAge(child.birthDate)}세 · {child.gender === "male" ? "남아" : "여아"}
                        </p>
                    </div>
                    </div>
                    <div className="card_actions">
                    <button className="action_btn" onClick={() => openDetailModal(child)}>
                        <FaEye />
                    </button>
                    <button className="action_btn" onClick={() => openEditModal(child)}>
                        <FaEdit />
                    </button>
                    <button className="action_btn_delete" onClick={() => handleDeleteChild(child.id)}>
                        <FaTrash />
                    </button>
                    </div>
                </div>

                {/* 통계 */}
                <div className="child_stats">
                    <div className="stat_item">
                    <div className="stat_value">{child.totalStories || 0}</div>
                    <div className="stat_label">완성한 동화</div>
                    </div>
                    <div className="stat_item">
                    <div className="stat_value">{child.lastActivity || "활동 없음"}</div>
                    <div className="stat_label">마지막 활동</div>
                    </div>
                    <div className="stat_item">
                    <div className="stat_value">{calculateAge(child.birthDate)}세</div>
                    <div className="stat_label">나이</div>
                    </div>
                </div>

                {/* 관심 영역 */}
                {child.concerns && child.concerns.length > 0 && (
                    <div className="concerns_section">
                    <p className="concerns_title">관심 영역</p>
                    <div className="concerns_tags">
                        {child.concerns.map((concern, idx) => (
                        <span key={idx} className="concern_tag">
                            {concern}
                        </span>
                        ))}
                    </div>
                    </div>
                )}
                </div>
            ))}
            </div>
        )}

        {/* 자녀 추가 모달 */}
        {isAddModalOpen && (
            <div className="modal_overlay" onClick={() => setIsAddModalOpen(false)}>
            <div className="modal_content" onClick={(e) => e.stopPropagation()}>
                <div className="modal_header">
                <h2>새 자녀 등록</h2>
                <button className="close_btn" onClick={() => setIsAddModalOpen(false)}>
                    ✕
                </button>
                </div>
                <ChildRegistrationForm onSubmit={handleAddChild} onCancel={() => setIsAddModalOpen(false)} mode="register" />
            </div>
            </div>
        )}

        {/* 자녀 수정 모달 */}
        {isEditModalOpen && selectedChild && (
            <div className="modal_overlay" onClick={() => setIsEditModalOpen(false)}>
            <div className="modal_content" onClick={(e) => e.stopPropagation()}>
                <div className="modal_header">
                <h2>자녀 정보 수정</h2>
                <button className="close_btn" onClick={() => setIsEditModalOpen(false)}>
                    ✕
                </button>
                </div>
                <ChildRegistrationForm
                onSubmit={handleEditChild}
                onCancel={() => setIsEditModalOpen(false)}
                initialData={selectedChild}
                mode="edit"
                />
            </div>
            </div>
        )}

        {/* 자녀 상세 모달 */}
        {isDetailModalOpen && selectedChild && (
            <div className="modal_overlay" onClick={() => setIsDetailModalOpen(false)}>
            <div className="modal_content detail_modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal_header">
                <h2>자녀 상세 프로필</h2>
                <button className="close_btn" onClick={() => setIsDetailModalOpen(false)}>
                    ✕
                </button>
                </div>
                <div className="detail_content">
                <div className="detail_profile">
                    {/* 이미지 */}
                    <div className="detail_avatar">
                        <img
                            src={selectedChild.gender === "male" ? bkid : gkid}
                            alt="child avatar"
                            className="child_avatar_img_large"
                        />
                    </div>
                    <div>
                    <h3 className="detail_name">{selectedChild.name}</h3>
                    <p className="detail_info">
                        {calculateAge(selectedChild.birthDate)}세 · {selectedChild.gender === "male" ? "남아" : "여아"}
                    </p>
                    <p className="detail_birth">생년월일: {selectedChild.birthDate}</p>
                    </div>
                </div>

                <div className="detail_stats_grid">
                    <div className="detail_stat">
                    <div className="detail_stat_value">{selectedChild.totalStories || 0}</div>
                    <div className="detail_stat_label">완성한 동화</div>
                    </div>
                    <div className="detail_stat">
                    <div className="detail_stat_value">{selectedChild.lastActivity || "활동 없음"}</div>
                    <div className="detail_stat_label">마지막 활동</div>
                    </div>
                    <div className="detail_stat">
                    <div className="detail_stat_value">{calculateAge(selectedChild.birthDate)}세</div>
                    <div className="detail_stat_label">나이</div>
                    </div>
                </div>

                {selectedChild.concerns && selectedChild.concerns.length > 0 && (
                    <div className="detail_concerns">
                    <h4>특별히 신경 쓰이는 부분</h4>
                    <div className="detail_concerns_tags">
                        {selectedChild.concerns.map((concern, idx) => (
                        <span key={idx} className="detail_concern_tag">
                            {concern}
                        </span>
                        ))}
                    </div>
                    </div>
                )}

                <div className="detail_actions">
                    <button className="detail_btn_cancel" onClick={() => setIsDetailModalOpen(false)}>
                    닫기
                    </button>
                    <button
                    className="detail_btn_edit"
                    onClick={() => {
                        setIsDetailModalOpen(false);
                        openEditModal(selectedChild);
                    }}
                    >
                    정보 수정
                    </button>
                </div>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}

export default ChildManagement;
