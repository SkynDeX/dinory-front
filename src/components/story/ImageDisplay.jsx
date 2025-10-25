import React, { useState } from "react";
import "./ImageDisplay.css";

function ImageDisplay({ imagePrompt, imageUrl }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
        <div className="image_display_container">
            {imageUrl ? (
                <div className="image_wrapper">
                    {!imageLoaded && !imageError && (
                        <div className="image_loading">이미지 로딩 중...</div>
                    )}
                    <img
                        src={imageUrl}
                        alt={imagePrompt}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        style={{ display: imageLoaded ? 'block' : 'none' }}
                    />
                    {imageError && (
                        <div className="image_placeholder">
                            <span>🎨</span>
                            <p>이미지를 불러올 수 없습니다</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="image_placeholder">
                    <span>🎨</span>
                    <p>이미지 준비 중...</p>
                </div>
            )}
        </div>
    );
}

export default ImageDisplay;