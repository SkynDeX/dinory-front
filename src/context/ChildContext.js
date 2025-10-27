import React, { createContext, useContext, useEffect, useState } from "react";
import { getChildren, registerChild, updateChild as updateChildApi, deleteChild as deleteChildApi } from "../services/api/childApi";

// Context 생성
const ChildContext = createContext();

// Provider 컴포넌트 (유일한 함수 컴포넌트)
export function ChildProvider({ children }) {
    const [childrenList, setChildrenList] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
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

            // 첫 번째 자녀 자동 선택
            if (data.length > 0 && !selectedChild) {
                setSelectedChild(data[0]);
            }

        } catch (e) {
            console.error("자녀 목록 조회 실패:", e);
            setError("자녀 목록을 불러오는데 실패했습니다.");
            setChildrenList([]);
        } finally {
            setLoading(false);
        }
    };

    // 초기 로드
    useEffect(() => {
        fetchChildren();
    }, []);

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

    const value = {
        childrenList,
        selectedChild,
        setSelectedChild,
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