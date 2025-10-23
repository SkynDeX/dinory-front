import react from "react";

// 자녀 등록 랜딩 페이지
function ChildRegistration() {
    return(
        <div>
            <h3>내 아이 등록하기</h3>
            <p>아이의 정보를 입력하면 더 맞춤화된 동화를 제공할 수 있어요</p>
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
                    
                    <button>나중에 하기</button>
                    <button>등록 완료</button>
                </form>
            </div>
        </div>
    );
}

export default ChildRegistration;