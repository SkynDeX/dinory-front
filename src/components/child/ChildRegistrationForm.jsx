import React, { useEffect, useState, useRef } from "react";
import './ChildRegistrationForm.css';

// 재사용 가능한 폼 컴포넌트
function ChildRegistrationForm({
    onSubmit,   // 등록 완료 핸들러
    onCancel,   // 나중에 하기 핸들러
    initialData,    // 수정 모드용 초기 데이터
    mode = "register"
}) {

    const options = [
        { emoji: "😳", label: "낯가림" },
        { emoji: "🧍‍♂️🧍‍♀️", label: "형제 갈등" },
        { emoji: "🥺", label: "분리불안" },
        { emoji: "😴", label: "수면 문제" },
        { emoji: "🍽️🚫", label: "식사 거부" },
        { emoji: "💢", label: "공격성" },
        { emoji: "👭", label: "친구 관계" },
        { emoji: "🏫", label: "학교 적응" },
        { emoji: "🎭", label: "감정 표현" },
        { emoji: "🎯", label: "집중력" },
        { emoji: "😨", label: "두려움" },
        { emoji: "😔", label: "자신감 부족" },
    ];

    // 폼 데이터 상태
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        birthDate: initialData?.birthDate || "",
        gender: initialData?.gender || "",
        concerns: initialData?.concerns || []
    });

    const [showInput, setShowInput] = useState(false);
    const [etcText, setEtcText] = useState("");
    const inputCardRef = useRef(null);

    // 입력 필드 변경 핸들러
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 우려사항 선택/해제
    const selectConcern = (label) => {
        setFormData(prev => ({
            ...prev,
            concerns: prev.concerns.includes(label)
            ? prev.concerns.filter((item) => item !== label)
            : [...prev.concerns, label]
        }));
    };

    const handleEtcClick = () => setShowInput(true);

    const handleEtcSubmit = () => {
        if(etcText.trim() !== "") {
            setFormData((prev) => ({
                ...prev,
                concerns: [...prev.concerns, etcText.trim()]
            }));
            setEtcText(""); // 입력 내용 초기화
            setShowInput(false);
        }
    };

    // 바깥 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputCardRef.current && !inputCardRef.current.contains(event.target)) {
                setShowInput(false);
                setEtcText("");
            }
        };

        if (showInput) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showInput]);


    // 기존 우려사항에 기타로 등록된 항목 필터링
    const customConcerns = formData.concerns.filter(
        concern => !options.find(opt => opt.label === concern)  
    );


    // 폼 제출
    const handleSubmit = (e) => {
        e.preventDefault();

        // 유효성 검사
        if (!formData.name.trim()) {
            alert("아이 이름을 입력해주세요");
            return;
        }

        if (!formData.birthDate) {
            alert("생년월일을 선택해주세요");
            return;
        }

        if (!formData.gender) {
            alert("성별을 입력해주세요");
            return;
        }

        // 부모 컴포넌트로 데이터 전달
        onSubmit?.(formData);
    };

    // 나중에 하기
    const handleSkip = () => {
        onCancel?.();
    };


    return(
        <div>
            <div className="child_register_form">
                <form onSubmit={handleSubmit}>
                    <h3>아이 이름</h3>
                    <input 
                        type="text" 
                        placeholder="예: 명호"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                    />

                    <h3>생년월일</h3>
                    <input 
                        type="date" 
                        placeholder="날짜를 선택하세요"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    />

                    <h3>성별</h3>
                    <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                    >
                        <option value="">성별을 선택하세요</option>
                        <option value="male">남자</option>
                        <option value="female">여자</option>
                    </select>

                    <h3>특별히 신경 쓰이는 부분 (선택)</h3>
                    <p>아이의 정서 발달에 도움이 되는 맞춤 동화를 제공해요 (여러 개 선택 가능)</p>
                    <div className="child_register_card_grid">
                        {options.map((item) => (
                            <div
                                key={item.label}
                                className={`card ${formData.concerns.includes(item.label) ? "active" : ""}`}
                                onClick={() => selectConcern(item.label)}
                            >
                                <span className="emoji">{item.emoji}</span>
                                <p>{item.label}</p>
                            </div>
                        ))}

                        {/* 직접 입력으로 추가된 우려사항 카드 표시 */}
                        {customConcerns.map((concern) => (
                            <div
                                key={concern}
                                className="card active"
                                onClick={() => selectConcern(concern)}
                            >
                                <span className="emoji">✏️</span>
                                <p>{concern}</p>
                            </div>
                        ))}

                        {showInput ? (
                            <div className="card_input_card" ref={inputCardRef}>
                                <input 
                                    type="text"
                                    placeholder="직접 입력"
                                    value={etcText}
                                    onChange={(e) => setEtcText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleEtcSubmit()}
                                    autoFocus
                                />
                                <button type="button" onClick={handleEtcSubmit}>
                                    등록
                                </button>
                            </div>
                        ) : (
                            <div className="card_etc" onClick={handleEtcClick}>
                                + 기타
                            </div>
                        )}
                    </div>
                    <div className="button_area">
                        <button type="button" className="skip_btn" onClick={handleSkip}>
                            {mode === "edit" ? "취소" : "나중에 하기"}
                        </button>
                        <button type="submit" className="submit_btn">
                            {mode === "edit" ? "수정 완료" : "등록 완료"}
                        </button>
                    </div>    
                </form>
            </div>
        </div>
    );
}

export default ChildRegistrationForm;