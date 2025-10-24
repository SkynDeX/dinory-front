import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getChildren } from "../../services/api/childApi";
import LoadingScreen from "../common/LoadingScreen";
import DinoCharacter from "../dino/DinoCharacter";


function ChildSelectPage() {

    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            // 🔥 임시 더미 데이터 (백엔드 구현 전까지)
            const dummyData = [
                {
                    id: 1,
                    name: "서연",
                    birthDate: "2018-03-15",
                    gender: "female",
                    avatar: "👧"
                },
                {
                    id: 2,
                    name: "명호",
                    birthDate: "2019-06-20",
                    gender: "male",
                    avatar: "👦"
                }
            ];
            setChildren(dummyData);
            setLoading(false);
        
            /* 백엔드 준비되면 아래 주석 해제
            const response = await getChildren();
            const data = response.data || response;
            setChildren(Array.isArray(data) ? data : []);
            */
            
        } catch (e) {
            console.error("자녀 목록 조회 실패:", e);
            setChildren([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChild = (child) => {
        localStorage.setItem("selectedChildForSession", JSON.stringify(child));
        navigate("/child/emotion");
    }

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
    return <LoadingScreen />;
    }

    return(
        <div className="child_select_page">
            <div className="select_header">
                <h2>오늘은 누가 동화를 만들어볼까?</h2>
                <p>동화를 만들고 싶은 친구를 선택해줘!</p>
            </div>

            <div className="child_card_grid">
                {children.map((child) => (
                    <div
                        key={child.id}
                        className="child_card"
                        onClick={() => handleSelectChild(child)}
                    >
                        <div className="child_avatar_large">
                            {child.avatar || (child.gender === "male" ? "👦" : "👧")}
                        </div>
                        <h3>{child.name}</h3>
                        <p className="child_card_age">{calculateAge(child.birthDate)}세</p>
                    </div>
                ))}
            </div>

            <DinoCharacter />
        </div>
    );
}

export default ChildSelectPage;

