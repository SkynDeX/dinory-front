import React, { useState } from 'react';
import axiosInstance from '../services/utils/axiosInstance';
import './ImageTest.css';

function ImageTest() {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('photographic');
    const [loading, setLoading] = useState(false);
    const [imageData, setImageData] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            alert('프롬프트를 입력해주세요!');
            return;
        }

        setLoading(true);
        setError(null);
        setImageData(null);

        try {
            const response = await axiosInstance.post('/api/image/generate', {
                prompt: prompt,
                style: style,
                sceneId: null
            });

            console.log('Response:', response.data);
            setImageData(response.data);
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="image-test-container">
            <div className="image-test-content">
                <h1>Stability AI 이미지 생성 테스트</h1>

                <div className="form-group">
                    <label>프롬프트:</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="생성하고 싶은 이미지를 설명해주세요... (예: A beautiful sunset over mountains)"
                        rows="4"
                    />
                </div>

                <div className="form-group">
                    <label>스타일:</label>
                    <select value={style} onChange={(e) => setStyle(e.target.value)}>
                        <option value="photographic">Photographic</option>
                        <option value="digital-art">Digital Art</option>
                        <option value="anime">Anime</option>
                        <option value="cinematic">Cinematic</option>
                        <option value="fantasy-art">Fantasy Art</option>
                        <option value="default">Default</option>
                    </select>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="generate-btn"
                >
                    {loading ? '생성 중...' : '이미지 생성'}
                </button>

                {error && (
                    <div className="error-box">
                        <h3>에러 발생:</h3>
                        <p>{error}</p>
                    </div>
                )}

                {imageData && (
                    <div className="result-box">
                        <h2>생성 결과</h2>
                        <div className="status-info">
                            <p><strong>상태:</strong> {imageData.status}</p>
                            <p><strong>ID:</strong> {imageData.id}</p>
                            <p><strong>프롬프트:</strong> {imageData.prompt}</p>
                            <p><strong>스타일:</strong> {imageData.style}</p>
                        </div>

                        {imageData.status === 'completed' && imageData.imageUrl && (
                            <div className="image-display">
                                <h3>생성된 이미지:</h3>
                                <img
                                    src={imageData.imageUrl}
                                    alt="Generated"
                                    className="generated-image"
                                />
                            </div>
                        )}

                        {imageData.status === 'failed' && (
                            <div className="error-box">
                                <h3>생성 실패:</h3>
                                <p>{imageData.errorMessage}</p>
                            </div>
                        )}

                        {imageData.status === 'pending' && (
                            <div className="pending-box">
                                <p>이미지 생성 대기 중...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImageTest;