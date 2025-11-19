import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { MdSwapHoriz } from "react-icons/md";
import "./BookOrbitCarousel.css";
import DinoCharacter from "../dino/DinoCharacter";
import RewardProgress from "./RewardProgress";
import { RewardContext } from "../../context/RewardContext";
import { useChild } from "../../context/ChildContext";
import BookInfoModal from "../dino/BookInfoModal";
import bkid from "../../assets/icons/bkid.png";
import gkid from "../../assets/icons/gkid.png";
import { getRecommendedStories, getRandomStories } from '../../services/api/storyApi.js';
import { useAuth } from "../../context/AuthContext.js";
import reloadIcon from "../../assets/icons/reload.png";
import LoadingScreen from '../common/LoadingScreen';

const books = [
    {
        id: 1,
        title: "달 위의 곰돌이",
        image: "/assets/intro/01.png",
        desc: "달 위에서 꿈꾸는 귀여운 곰돌이 이야기"
    },

    {
        id: 2,
        title: "바다의 인어",
        image: "/assets/intro/02.png",
        desc: "푸른 바다 속 인어의 노래"
    },

    {
        id: 3,
        title: "꿈나라 기차",
        image: "/assets/intro/03.png",
        desc: "밤하늘을 달리는 꿈나라 기차"
    },

    {
        id: 4,
        title: "마법 고양이",
        image: "/assets/intro/04.png",
        desc: "마법 지팡이를 든 고양이의 모험"
    },

    {
        id: 5,
        title: "무지개 유니콘",
        image: "/assets/intro/05.png",
        desc: "무지개를 달리는 유니콘의 이야기"
    },
];

const THEME_COLORS = ["#2fa36b", "#ff9b7a", "#87ceeb", "#ffd166"];

function BookOrbitCarousel() {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { addStar } = useContext(RewardContext);
    const { selectedChild, selectedEmotion, selectedInterests } = useChild();
    const targetRotation = useRef(0);
    const dragDistanceRef = useRef(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    const [books, setBooks] = useState([
        { id: 1, title: "동화를 불러오는 중...", image: "/assets/intro/01.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
        { id: 2, title: "동화를 불러오는 중...", image: "/assets/intro/02.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
        { id: 3, title: "동화를 불러오는 중...", image: "/assets/intro/03.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
        { id: 4, title: "동화를 불러오는 중...", image: "/assets/intro/04.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
        { id: 5, title: "동화를 불러오는 중...", image: "/assets/intro/05.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
    ]);
    const [loading, setLoading] = useState(false);
    const [isLoadingStories, setIsLoadingStories] = useState(true);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { user } = useAuth();

    const getCacheKey = () => {
        if (user && selectedChild && selectedEmotion && selectedInterests?.length > 0) {
            return `stories_${selectedChild.id}_${selectedEmotion.id}_${selectedInterests.join('_')}`;
        }
        return 'stories_random';
    };

    useEffect(() => {
        const fetchStoriesProgressively = async (forceRefresh = false) => {
            const cacheKey = getCacheKey();

            console.log("🔑 현재 캐시 키:", cacheKey);
            console.log("📊 현재 상태:", {
                childId: selectedChild?.id,
                emotion: selectedEmotion?.id,
                interests: selectedInterests
            });

            if (!forceRefresh) {
                try {
                    const cachedData = sessionStorage.getItem(cacheKey);
                    if (cachedData) {
                        const cachedBooks = JSON.parse(cachedData);
                        console.log("💾 캐시에서 동화 불러옴:", cachedBooks.length, "개");
                        setBooks(cachedBooks);
                        setIsLoadingStories(false);
                        setHasLoadedOnce(true);
                        return;
                    }
                } catch (e) {
                    console.warn("캐시 로드 실패:", e);
                }
            } else {
                console.log("🔄 강제 새로고침 - 캐시 무시하고 새 동화 로드");
            }

            console.log(forceRefresh ? "🔄 동화 다시 추천받기..." : "📡 새로운 동화 불러오기...");
            setIsLoadingStories(true);

            try {
                const totalBooks = 5;
                let stories = [];

                if (user && selectedChild && selectedEmotion && selectedInterests?.length > 0) {
                    console.log(`📚 추천동화 ${totalBooks}개 요청 중...`);
                    stories = await getRecommendedStories(
                        selectedEmotion.id,
                        selectedInterests,
                        selectedChild.id,
                        totalBooks
                    );
                } else {
                    console.log(`📚 랜덤동화 ${totalBooks}개 요청 중...`);
                    stories = await getRandomStories(totalBooks);
                }

                if (stories && stories.length > 0) {
                    const transformedBooks = stories.map((story, index) => ({
                        id: index + 1,
                        storyId: story.storyId,
                        title: story.title,
                        image: `/assets/intro/0${(index % 5) + 1}.png`,
                        desc: story.description,
                        themes: story.themes || [],
                        matchingScore: story.matchingScore || 50,
                        isLoading: false,
                    }));

                    while (transformedBooks.length < totalBooks) {
                        const index = transformedBooks.length;
                        transformedBooks.push({
                            id: index + 1,
                            title: ["달 위의 곰돌이", "바다의 인어", "숲 속 요정", "우주 탐험", "공룡 친구"][index],
                            image: `/assets/intro/0${(index % 5) + 1}.png`,
                            desc: "동화를 불러오는데 실패했습니다",
                            storyId: `default_${index + 1}`,
                            isLoading: false,
                        });
                    }

                    setBooks(transformedBooks);
                    console.log(`✅ 동화 ${transformedBooks.length}개 로드 완료`);
                } else {
                    console.warn("⚠️ 동화를 받지 못함 - 기본값 사용");
                    const defaultBooks = [
                        { id: 1, title: "달 위의 곰돌이", image: "/assets/intro/01.png", desc: "기본 동화", storyId: "default_1", isLoading: false },
                        { id: 2, title: "바다의 인어", image: "/assets/intro/02.png", desc: "기본 동화", storyId: "default_2", isLoading: false },
                        { id: 3, title: "숲 속 요정", image: "/assets/intro/03.png", desc: "기본 동화", storyId: "default_3", isLoading: false },
                        { id: 4, title: "우주 탐험", image: "/assets/intro/04.png", desc: "기본 동화", storyId: "default_4", isLoading: false },
                        { id: 5, title: "공룡 친구", image: "/assets/intro/05.png", desc: "기본 동화", storyId: "default_5", isLoading: false },
                    ];
                    setBooks(defaultBooks);
                }

                console.log("🎉 모든 동화 로드 완료!");

                setBooks(prevBooks => {
                    const completedBooks = prevBooks.filter(b => !b.isLoading);
                    if (completedBooks.length === 5) {
                        sessionStorage.setItem(cacheKey, JSON.stringify(completedBooks));
                        console.log("💾 동화 데이터 캐시에 저장 완료");
                    }
                    return prevBooks;
                });

            } catch (error) {
                console.error("❌ 전체 동화 로드 실패:", error);
            } finally {
                setIsLoadingStories(false);
                setHasLoadedOnce(true);
                setIsRefreshing(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchStoriesProgressively();
        }, 300);

        window.refreshStories = () => {
            setBooks([
                { id: 1, title: "동화를 불러오는 중...", image: "/assets/intro/01.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
                { id: 2, title: "동화를 불러오는 중...", image: "/assets/intro/02.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
                { id: 3, title: "동화를 불러오는 중...", image: "/assets/intro/03.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
                { id: 4, title: "동화를 불러오는 중...", image: "/assets/intro/04.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
                { id: 5, title: "동화를 불러오는 중...", image: "/assets/intro/05.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
            ]);
            fetchStoriesProgressively(true);
        };

        return () => {
            clearTimeout(debounceTimer);
            delete window.refreshStories;
        };
    }, [user, selectedChild, selectedEmotion, selectedInterests]);

    const handleChangeChild = () => {
        navigate("/child/select");
    };

    const handleRefreshStories = () => {
        if (isRefreshing) {
            console.log("⚠️ 이미 동화를 불러오는 중입니다.");
            return;
        }

        if (window.refreshStories) {
            setIsRefreshing(true);
            window.refreshStories();
        }
    };

    const textures = useMemo(() => {
        const loader = new THREE.TextureLoader();
        return books.map((book) => loader.load(process.env.PUBLIC_URL + book.image));
    }, [books]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        while (container.firstChild) container.removeChild(container.firstChild);

        const scene = new THREE.Scene();

        const gradientCanvas = document.createElement("canvas");
        gradientCanvas.width = 32;
        gradientCanvas.height = 32;
        const ctx = gradientCanvas.getContext("2d");
        const grad = ctx.createLinearGradient(0, 0, 32, 32);
        grad.addColorStop(0, "#87ceeb");
        grad.addColorStop(0.33, "#ffd166");
        grad.addColorStop(0.66, "#ff9b7a");
        grad.addColorStop(1, "#2fa36b");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
        scene.background = new THREE.CanvasTexture(gradientCanvas);

        const camera = new THREE.PerspectiveCamera(
            50,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0.5, 13);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff, 1.2);
        const light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.set(5, 10, 10);
        scene.add(ambient, light);

        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(container.clientWidth, container.clientHeight),
            0.15,
            0.1,
            0.85
        );
        composer.addPass(renderPass);
        composer.addPass(bloomPass);

        const radius = 7;
        const geom = new THREE.BoxGeometry(2.0, 2.6, 0.25);
        const meshes = [];
        books.forEach((book, i) => {
            const materials = [
                new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
                new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
                new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
                new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
                new THREE.MeshBasicMaterial({ map: textures[i], transparent: true }),
                new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
            ];

            const mesh = new THREE.Mesh(geom, materials);
            mesh.userData = { index: i, title: book.title };
            mesh.position.y = 0.2;
            scene.add(mesh);
            meshes.push(mesh);
        });

        let rotation = targetRotation.current;
        const step = (Math.PI * 2) / books.length;
        const offset = Math.PI / books.length / 2;

        const animate = () => {
            requestAnimationFrame(animate);
            rotation += (targetRotation.current - rotation) * 0.08;

            let minDist = Infinity;
            let centerIndex = 0;

            meshes.forEach((mesh, i) => {
                const angle = (i / books.length) * Math.PI * 2 + rotation + offset;
                mesh.position.set(Math.sin(angle - Math.PI / 2) * radius, 0, Math.cos(angle - Math.PI / 2) * radius);
                mesh.lookAt(camera.position);

                const dist = Math.abs(mesh.position.z - camera.position.z);
                if (dist < minDist) {
                    minDist = dist;
                    centerIndex = i;
                }

                const glow = 1 - Math.min(1, Math.abs(angle % (Math.PI * 2) - Math.PI) / Math.PI);
                mesh.scale.setScalar(1 + glow * 0.45);
            });

            if (selectedIndex !== centerIndex) setSelectedIndex(centerIndex);

            composer.render();
        };
        animate();

        let isDragging = false;
        let prevX = 0;
        const onMouseDown = (e) => {
            isDragging = true;
            prevX = e.clientX;
            dragDistanceRef.current = 0;
        };
        const onMouseMove = (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - prevX;
            dragDistanceRef.current += Math.abs(deltaX);
            if (dragDistanceRef.current > 5)
                targetRotation.current += deltaX * 0.002;
            prevX = e.clientX;
        };

        const onMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            if (dragDistanceRef.current < 5) return;
            const snapped = Math.round(targetRotation.current / step) * step;
            targetRotation.current = snapped;
        };

        container.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        const onWheel = (e) => {
            e.preventDefault();
            targetRotation.current += e.deltaY > 0 ? -step : step;
            const snapped = Math.round(targetRotation.current / step) * step;
            targetRotation.current = snapped;
        };
        container.addEventListener("wheel", onWheel, { passive: false });

        const onResize = () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
            composer.setSize(container.clientWidth, container.clientHeight);
        };
        
window.addEventListener("resize", onResize);

return () => {
    container.removeEventListener("wheel", onWheel);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    container.removeEventListener("mousedown", onMouseDown);
    while (container.firstChild) container.removeChild(container.firstChild);
    renderer.dispose();
};
}, [textures, books]);

const handleReadBook = async () => {
if (books[selectedIndex].isLoading || !books[selectedIndex].storyId) {
    console.log("⏳ 동화가 아직 로딩 중입니다. 잠시만 기다려주세요.");
    return;
}

try {
    setSelectedBook(books[selectedIndex]);
    setIsModalOpen(true);
} catch (err) {
    console.error("별 추가 실패:", err);
}
};

const handlePrev = () => {
targetRotation.current += (Math.PI * 2) / books.length;
const step = (Math.PI * 2) / books.length;
const snapped = Math.round(targetRotation.current / step) * step;
targetRotation.current = snapped;
};
const handleNext = () => {
targetRotation.current -= (Math.PI * 2) / books.length;
const step = (Math.PI * 2) / books.length;
const snapped = Math.round(targetRotation.current / step) * step;
targetRotation.current = snapped;
};

    return (
        <div className="carousel-wrapper">
            <div ref={containerRef} className="three-container" />

            <div className="carousel-logo">
                <h1 className="logo">
                    <span className="green">Din</span>
                    <span className="coral">o</span>
                    <span className="sky">r</span>
                    <span className="yellow">y</span>
                </h1>
            </div>

            <div className="top-right-section">
                <div className="selected-child-info" onClick={handleChangeChild}>
                    {selectedChild ? (
                        <>
                            <span className="child-avatar">
                                <img
                                    src={selectedChild.gender === "male" ? bkid : gkid}
                                    alt={selectedChild.gender === "male" ? "남자 아이" : "여자 아이"}
                                    className="child-avatar-img"
                                />
                            </span>
                            <span className="child-name-display">{selectedChild.name}</span>
                        </>
                    ) : (
                        <span className="child-name-display">자녀 선택</span>
                    )}
                    <MdSwapHoriz className="change-icon" />
                </div>

                <div className="reward-progress-wrapper">
                    <RewardProgress />
                </div>
            </div>

            <div className="carousel-controls">
                {/* [2025-11-17 추가] 로딩 상태 표시 */}
                <div className="carousel-title">
                    {books[selectedIndex].title}
                    {isLoadingStories && books[selectedIndex].isLoading && (
                        <span style={{ fontSize: '0.8em', opacity: 0.7, marginLeft: '8px' }}>⏳</span>
                    )}
                </div>

                <div className="carousel-index">
                    {selectedIndex + 1} / {books.length}
                </div>

                {/* 책 읽기랑 다시 추천 버튼 한 줄 배치함 */}
                <div className="carousel-action-row">

                    {/* 책 읽기 버튼 */}
                    <button
                        className="book-read-btn"
                        onClick={handleReadBook}
                        disabled={books[selectedIndex].isLoading || !books[selectedIndex].storyId}
                        style={{
                            opacity: books[selectedIndex].isLoading || !books[selectedIndex].storyId ? 0.5 : 1,
                            cursor: books[selectedIndex].isLoading || !books[selectedIndex].storyId ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {books[selectedIndex].isLoading ? '로딩 중...' : '책 읽기'}
                    </button>

                    {/* 동화 다시 추천 버튼 */}
                    {hasLoadedOnce && !isLoadingStories && (
                        <button
                            className="refresh-stories-inline-btn"
                            onClick={handleRefreshStories}
                            disabled={isRefreshing}
                        >
                            <img src={reloadIcon} alt="다시 추천받기" className="refresh-inline-icon" />
                        </button>
                    )}
                </div>
            </div>

            <button className="nav-btn prev-btn" onClick={handlePrev}>
                &#10094;
            </button>
            <button className="nav-btn next-btn" onClick={handleNext}>
                &#10095;
            </button>

            <DinoCharacter book={books[selectedIndex]} />

            {isModalOpen && selectedBook && (
                <BookInfoModal book={{
                    ...selectedBook,
                    storyId: selectedBook.storyId
                }}
                    onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
}

export default BookOrbitCarousel;
