import React, { useState } from "react";
import "./ImageDisplay.css";

function ImageDisplay({ imagePrompt, imageUrl, aspectRatio = "default"  }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const wrapperClass = `image_wrapper ${aspectRatio !== "default" ? `aspect_${aspectRatio}` : ''}`;


    return (
        <div className="image_display_container">
            {imageUrl ? (
                <div className={wrapperClass}>
                    {!imageLoaded && !imageError && (
                        <div className="image_loading">이미지 로딩 중...</div>
                    )}
                    <img
                        src={imageUrl}
                        alt={imagePrompt || "동화 삽화"}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        style={{ display: imageLoaded ? 'block' : 'none' }}
                    />
                    {imageError && (
                        <div className="image_placeholder image_error">
                            <span>😞</span>
                            <p>이미지를 불러올 수 없습니다</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="image_placeholder">
                    <span>🎨</span>
                    <p>디노가 이미지를 만드는 중이에요!</p>
                </div>
            )}
        </div>
    );
}

export default ImageDisplay;