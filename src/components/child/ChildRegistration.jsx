import React from "react";
import ChildRegistrationForm from "./ChildRegistrationForm";
import { useNavigate } from "react-router-dom";
import { registerChild } from "../../services/api/childApi";
import { useChild } from "../../context/ChildContext";
import './ChildRegistration.css';
import baby from '../../assets/baby.png'

// 자녀 등록 랜딩 페이지
function ChildRegistration() {
    const navigate = useNavigate();
    const { fetchChildren } = useChild();

    // 등록 완료 핸들러
    const handleRegister = async (formData) => {
        try {
            // 🔥 임시: 더미 응답 (백엔드 구현 전까지)
            console.log('자녀 등록 데이터:', formData);
            alert(`${formData.name} 등록이 완료되었습니다!`);
            navigate('/child/select');
            
            /* 백엔드 준비되면 아래 주석 해제
            const response = await registerChild({
                name: formData.name,
                birthDate: formData.birthDate,
                gender: formData.gender,
                concerns: formData.concerns
            });
            console.log('자녀 등록 성공:', response);
            alert(`${formData.name} 등록이 완료되었습니다!`);
            await fetchChildren();
            navigate('/child/select');
            */
        } catch (e) {
            console.error('등록 실패:', e);
            alert('등록에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 나중에 하기 핸들러
    const handleSkip = () => {
        // 나중에 하기 클릭 시 대시보드로 이동
        navigate('/parent/dashboard');
    };
    
    return(
        <div className="child_registration_wrapper">
            <div className="registration_header">
                <img src={baby} alt="baby" width={100} height={100} />
                <h3>내 아이 등록하기</h3>
                <p>아이의 정보를 입력하면 더 맞춤화된 동화를 제공할 수 있어요</p>
            </div>

            <div className="registration_form_container">
                <ChildRegistrationForm 
                    onSubmit={handleRegister}
                    onCancel={handleSkip}
                    mode="register"
                />
            </div>   
        </div>
    );
}

export default ChildRegistration;