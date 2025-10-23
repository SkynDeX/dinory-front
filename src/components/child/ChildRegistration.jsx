import react from "react";
import ChildRegistrationForm from "./ChildRegistrationForm";
import { useNavigate } from "react-router-dom";
import { registerChild } from "../../services/api/childApi";

// 자녀 등록 랜딩 페이지
function ChildRegistration() {
    const navigate = useNavigate();

    // 등록 완료 핸들러
    const handleRegister = async (formData) => {
        try {
            // API 호출
            const response = await registerChild({
                name: formData.name,
                birthDate: formData.birthDate,
                genter: formData.gender,
                concerns: formData.concerns
            });

            console.log('자녀 등록 성공:', response);
            alert(`${formData.name} 등록이 완료되었습니다!`);
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
        <div>
            <h3>내 아이 등록하기</h3>
            <p>아이의 정보를 입력하면 더 맞춤화된 동화를 제공할 수 있어요</p>

            <ChildRegistrationForm 
                onSubmit={handleRegister}
                onCancel={handleSkip}
                moade="register"
            />
        </div>
    );
}

export default ChildRegistration;