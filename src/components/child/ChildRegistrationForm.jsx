import react, { useState } from "react";

// 재사용 가능한 폼 컴포넌트
function ChildRegistrationForm() {

    const options = [
        {emoji: "", label: "낯가림"},
        {emoji: "", label: "형제 갈등"},
        {emoji: "", label: "분리불안"},
        {emoji: "", label: "수면 문제"},
        {emoji: "", label: "식사 거부"},
        {emoji: "", label: "공격성"},
        {emoji: "", label: "친구 관계"},
        {emoji: "", label: "학교 적응"},
        {emoji: "", label: "감정 표현"},
        {emoji: "", label: "집중력"},
        {emoji: "", label: "두려움"},
        {emoji: "", label: "자신감 부족"},
    ];

    const [selected, setSelected] = useState([]);
    const [showInput, setShowInput] = useState(false);
    const [etcText, setEtcText] = useState("");

    const interestSelect = (label) => {
        setSelected((prev) => {
            prev.includes(label) 
                ? prev.filter((item) => item !== label) 
                : [...prev, label]
        });
    };

    const handleEtcClick = () => setShowInput(true);

    const handleEtcSubmit = () => {
        if(etcText.trim() !== "") {
            setSelected((prev) => [...prev, etcText.trim()]);
            setEtcText("");
            setShowInput(false);
        }
    }


    return(
        <div>
            <div className="child_register_form">
                <form>
                    <h1>아이 이름</h1>
                    <input type="text" placeholder="예: 명호"/>

                    <h1>생년월일</h1>
                    <input type="date" placeholder="날짜를 선택하세요"/>

                    <h1>성별</h1>
                    <select>
                        <option value="">성별을 선택하세요</option>
                        <option value="male">남자</option>
                        <option value="female">여자</option>
                    </select>

                    <h1>특별히 신경 쓰이는 부분 (선택)</h1>
                    <p>아이의 정서 발달에 도움이 되는 맞춤 동화를 제공해요 (여러 개 선택 가능)</p>
                    <div className="child_register_card_grid">
                        {options.map((item) => (
                            <div
                                key={item.label}
                                className={`card${selected.includes(item.label)? "active" : ""}`}
                                onClick={() => interestSelect(item.label)}>
                                <span className="emoji">{item.emoji}</span>
                                <p>{item.label}</p>
                            </div>
                        ))}

                        {showInput ? (
                            <div className="card_input_card">
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
                        <button type="button" className="skip_btn">나중에 하기</button>
                        <button type="submit" className="submit_btn">등록 완료</button>
                    </div>    
                </form>
            </div>
        </div>
    );
}