import React, { useEffect, useState } from "react";
import "../../components/reward/RewardPopup.css";


function RewardPopup({show, onClose, reward}) {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if(show) {
            setAnimate(true);
            // 3초 후 닫기
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if(!show) {
        return null;
    } 

    return (
        <div className="reward-popup-overlay">
            <div className={`reward-popup ${animate ? 'animate' : ''}`}>
                <div className="popup-header">
                <h2>🎉 동화 완료!</h2>
                </div>
                
                <div className="popup-body">
                <div className="star-reward">
                    <div className="star-big">⭐</div>
                    <p className="reward-text">별 1개 획득!</p>
                </div>
                
                <div className="current-status">
                    <div className="status-item">
                    <span>현재 별:</span>
                    <span className="status-value">{reward.stars} / 5</span>
                    </div>
                    
                    {reward.stars >= 5 && (
                    <div className="egg-earned">
                        <div className="egg-animation">🥚</div>
                        <p>공룡알 1개 획득!</p>
                    </div>
                    )}
                    
                    <div className="status-item">
                    <span>보유 알:</span>
                    <span className="status-value">{reward.eggs}개</span>
                    </div>
                </div>
                
                {reward.eggs > 0 && (
                    <div className="hatch-hint">
                    <p>💡 공룡알을 부화시켜보세요!</p>
                    </div>
                )}
                </div>
                
                <button className="close-btn" onClick={onClose}>
                확인
                </button>
            </div>
        </div>
    );

}

export default RewardPopup;