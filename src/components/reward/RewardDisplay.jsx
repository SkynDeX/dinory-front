import React, { useEffect, useState } from "react";
import "../../components/reward/RewardDisplay.css";
import { getMyReward } from "../../services/api/rewardApi";

function RewardDisplay({onRewardUpdate}) {

    // 테스트 더미 데이터
    // const [reward, setReward] = useState({
    //     stars: 3,
    //     eggs: 1
    // });

    const [reward, setReward] = useState({
        stars: 0,
        eggs: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadReward();
    }, [])

    const loadReward = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getMyReward();
            setReward(data);

            // 부모 컴포넌트에 보상 데이터 전달(필요하면 사용하세요)
            if(onRewardUpdate) {
                onRewardUpdate(data);
            }


        } catch (error) {
            console.error('보상 로드 실패:', error);
            setError('보상 정보를 불러 올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 로딩 중
    if(loading) {
        return (
            <div className="reward-display loading">
                <div className="loading-spinner">⏳</div>
                <span>로딩중...</span>
            </div>
        );
    }

    // 에러 발생
    if (error) {
        return(
            <div className="reward-display error">
                <span>⚠️ {error}</span>
            </div>
        );
    }

    return (
        <div className="reward-display">
            <div className="reward-item starts">
                <span className="reward-icon">⭐</span>
                <span reward-count>{reward.stars}</span>
                <span reward-label>별</span>
            </div>

            <div className="reward-item eggs">
                <span className="reward-icon">🥚</span>
                <span className="reward-count">{reward.eggs}</span>
                <span className="reward-icon">공룡알</span>
            </div>
        </div>
    );
}

export default RewardDisplay;