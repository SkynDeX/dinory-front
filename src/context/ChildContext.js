import React, { createContext, useContext, useEffect, useState } from "react";
import { getChildren, registerChild, updateChild as updateChildApi, deleteChild as deleteChildApi, selectChild as selectChildApi, getSelectedChild } from "../services/api/childApi";

// Context 생성
const ChildContext = createContext();

// Provider 컴포넌트 (유일한 함수 컴포넌트)
export function ChildProvider({ children }) {
    const [childrenList, setChildrenList] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 자녀 목록 불러오기
    const fetchChildren = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getChildren();
            const data = response.data || response;
            setChildrenList(Array.isArray(data) ? data : []);

        } catch (e) {
            console.error("자녀 목록 조회 실패:", e);
            setError("자녀 목록을 불러오는데 실패했습니다.");
            setChildrenList([]);
        } finally {
            setLoading(false);
        }
    };

    // 초기 로드 (토큰이 있을 때만 실행)
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            fetchChildren();
            loadSelectedChild();
        } else {
            setLoading(false);
        }
    }, []);

    // 마지막 선택 자녀 불러오기
    const loadSelectedChild = async () => {
        try {
            const response = await getSelectedChild();
            const data = response.data || response;
            if (data) {
                setSelectedChild(data);
            }
        } catch (e) {
            console.error("선택 자녀 조회 실패:", e);
        }
    };

    // 자녀 추가
    const addChild = async (childData) => {
        try {
            const response = await registerChild(childData);
            const newChild = response.data || response;
            setChildrenList((prev) => [...prev, newChild]);
            return newChild;
        } catch (e) {
            console.error("자녀 추가 실패:", e);
            throw e;
        }
    };

    // 자녀 수정
    const updateChild = async (childId, updatedData) => {
        try {
            const response = await updateChildApi(childId, updatedData);
            const updated = response.data || response;
            setChildrenList((prev) => prev.map((child) => (child.id === childId ? updated : child)));
            return updated;
        } catch (e) {
            console.error("자녀 수정 실패:", e);
            throw e;
        }
    };

    // 자녀 삭제
    const deleteChild = async (childId) => {
        try {
            await deleteChildApi(childId);
            setChildrenList((prev) => prev.filter((child) => child.id !== childId));

            // 삭제된 자녀가 선택되어 있었다면 첫 번째 자녀로 변경
            if (selectedChild?.id === childId) {
                const remaining = childrenList.filter((child) => child.id !== childId);
                setSelectedChild(remaining.length > 0 ? remaining[0] : null);
            }
        } catch (e) {
            console.error("자녀 삭제 실패:", e);
            throw e;
        }
    };

    // 세션 데이터 초기화 (동화 생성 API 성공 후 호출)
    const clearSession = () => {
        setSelectedEmotion(null);
        setSelectedInterests([]);
    };

    // 자녀 선택 및 서버 저장
    const handleSelectChild = async (child) => {
        try {
            if (child && child.id) {
                await selectChildApi(child.id);
                setSelectedChild(child);
            }
        } catch (e) {
            console.error("자녀 선택 저장 실패:", e);
            setSelectedChild(child);
        }
    };

    const value = {
        childrenList,
        selectedChild,
        setSelectedChild: handleSelectChild,
        selectedEmotion,
        setSelectedEmotion,
        selectedInterests,
        setSelectedInterests,
        clearSession,
        loading,
        error,
        fetchChildren,
        addChild,
        updateChild,
        deleteChild,
    };

    return <ChildContext.Provider value={value}>{children}</ChildContext.Provider>;
}

// Hook (일반 함수)
export const useChild = () => {
    const context = useContext(ChildContext);
    if (!context) {
        throw new Error ("useChild must be used within ChildProvider");
    }

    return context;
};

export default ChildContext;