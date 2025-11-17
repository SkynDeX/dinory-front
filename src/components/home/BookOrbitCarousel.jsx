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
import {getRecommendedStories, getRandomStories} from '../../services/api/storyApi.js';
import { useAuth } from "../../context/AuthContext.js";
import LoadingScreen from '../common/LoadingScreen';

const books = [
  { id: 1, 
    title: "달 위의 곰돌이", 
    image: "/assets/intro/01.png", 
    desc: "달 위에서 꿈꾸는 귀여운 곰돌이 이야기" },

  { id: 2, 
    title: "바다의 인어", 
    image: "/assets/intro/02.png", 
    desc: "푸른 바다 속 인어의 노래" },

  { id: 3, 
    title: "꿈나라 기차", 
    image: "/assets/intro/03.png", 
    desc: "밤하늘을 달리는 꿈나라 기차" },

  { id: 4, 
    title: "마법 고양이", 
    image: "/assets/intro/04.png", 
    desc: "마법 지팡이를 든 고양이의 모험" },

  { id: 5, 
    title: "무지개 유니콘", 
    image: "/assets/intro/05.png", 
    desc: "무지개를 달리는 유니콘의 이야기" },
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

  // [2025-11-12 김광현] 동화추천 state 추가
  // [2025-11-17 수정] 초기에 placeholder 책들을 바로 표시 (Progressive Loading)
  const [books, setBooks] = useState([
    { id: 1, title: "동화를 불러오는 중...", image: "/assets/intro/01.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
    { id: 2, title: "동화를 불러오는 중...", image: "/assets/intro/02.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
    { id: 3, title: "동화를 불러오는 중...", image: "/assets/intro/03.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
    { id: 4, title: "동화를 불러오는 중...", image: "/assets/intro/04.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
    { id: 5, title: "동화를 불러오는 중...", image: "/assets/intro/05.png", desc: "잠시만 기다려주세요", storyId: null, isLoading: true },
  ]);
  const [loading, setLoading] = useState(false); // [2025-11-17 수정] false로 변경 - 화면 즉시 표시
  const [isLoadingStories, setIsLoadingStories] = useState(true); // 동화 로딩 상태
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false); // [2025-11-17 추가] 한 번이라도 로드했는지
  // Context
  const {user} = useAuth();

  // [2025-11-17 추가] 캐시 키 생성 함수
  const getCacheKey = () => {
    if (user && selectedChild && selectedEmotion && selectedInterests?.length > 0) {
      return `stories_${selectedChild.id}_${selectedEmotion.id}_${selectedInterests.join('_')}`;
    }
    return 'stories_random';
  };

  // [2025-11-17 수정] 캐시 확인 후 Progressive Loading
  useEffect(() => {
    const fetchStoriesProgressively = async (forceRefresh = false) => {
      // [2025-11-17 추가] 캐시 확인
      const cacheKey = getCacheKey();

      if (!forceRefresh) {
        try {
          const cachedData = sessionStorage.getItem(cacheKey);
          if (cachedData) {
            const cachedBooks = JSON.parse(cachedData);
            console.log("💾 캐시에서 동화 불러옴:", cachedBooks.length, "개");
            setBooks(cachedBooks);
            setIsLoadingStories(false);
            setHasLoadedOnce(true);
            return; // 캐시가 있으면 API 요청 안 함
          }
        } catch (e) {
          console.warn("캐시 로드 실패:", e);
        }
      }

      // 캐시가 없거나 강제 새로고침이면 API 요청
      console.log(forceRefresh ? "🔄 동화 다시 추천받기..." : "📡 새로운 동화 불러오기...");
      setIsLoadingStories(true);

      try {
        const totalBooks = 5;
        const fetchPromises = [];

        // 5개의 동화를 병렬로 개별 요청
        for (let i = 0; i < totalBooks; i++) {
          const fetchPromise = (async (index) => {
            try {
              let stories = [];

              // 로그인 여부에 따라 추천 또는 랜덤 동화 요청
              if (user && selectedChild && selectedEmotion && selectedInterests?.length > 0) {
                console.log(`📚 [${index + 1}/5] 추천동화 요청 중...`);
                stories = await getRecommendedStories(
                  selectedEmotion.id,
                  selectedInterests,
                  selectedChild.id,
                  1 // ⭐ 1개씩만 요청
                );
              } else {
                console.log(`📚 [${index + 1}/5] 랜덤동화 요청 중...`);
                stories = await getRandomStories(1); // ⭐ 1개씩만 요청
              }

              if (stories && stories.length > 0) {
                const story = stories[0];
                const transformedBook = {
                  id: index + 1,
                  storyId: story.storyId,
                  title: story.title,
                  image: `/assets/intro/0${(index % 5) + 1}.png`,
                  desc: story.description,
                  themes: story.themes || [],
                  matchingScore: story.matchingScore || 50,
                  isLoading: false, // 로딩 완료
                };

                // ⭐ 받는 즉시 해당 인덱스의 책을 업데이트
                setBooks(prevBooks => {
                  const newBooks = [...prevBooks];
                  newBooks[index] = transformedBook;
                  return newBooks;
                });

                console.log(`✅ [${index + 1}/5] 동화 로드 완료: ${story.title}`);
              }
            } catch (error) {
              console.error(`❌ [${index + 1}/5] 동화 로드 실패:`, error);

              // 실패한 책은 기본값으로 대체
              const defaultBook = {
                id: index + 1,
                title: ["달 위의 곰돌이", "바다의 인어", "숲 속 요정", "우주 탐험", "공룡 친구"][index],
                image: `/assets/intro/0${(index % 5) + 1}.png`,
                desc: "동화를 불러오는데 실패했습니다",
                storyId: `default_${index + 1}`,
                isLoading: false,
              };

              setBooks(prevBooks => {
                const newBooks = [...prevBooks];
                newBooks[index] = defaultBook;
                return newBooks;
              });
            }
          })(i);

          fetchPromises.push(fetchPromise);
        }

        // 모든 요청이 완료될 때까지 대기 (병렬 처리)
        await Promise.all(fetchPromises);
        console.log("🎉 모든 동화 로드 완료!");

        // [2025-11-17 추가] 로드 완료 후 캐시에 저장
        setBooks(prevBooks => {
          const completedBooks = prevBooks.filter(b => !b.isLoading);
          if (completedBooks.length === totalBooks) {
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
      }
    };

    fetchStoriesProgressively();

    // [2025-11-17 추가] 다시 추천받기 함수를 window에 노출
    window.refreshStories = () => {
      // placeholder로 초기화
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
      delete window.refreshStories;
    };
  }, [user, selectedChild, selectedEmotion, selectedInterests]);


  const handleChangeChild = () => {
    navigate("/child/select");
  };

  // [2025-11-17 추가] 동화 다시 추천받기
  const handleRefreshStories = () => {
    if (window.refreshStories) {
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
      const mat = new THREE.MeshStandardMaterial({
        map: textures[i],
        emissive: new THREE.Color(THEME_COLORS[i % 4]),
        emissiveIntensity: 0.25,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.userData = { index: i, title: book.title };
      mesh.position.y = 0.2;
      scene.add(mesh);
      meshes.push(mesh);
    });

    // [2025-11-17 수정] 씬 재생성 시 현재 회전 위치 유지
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

  // [2025-11-12 김광현] 책 읽기 핸들러 수정
  const handleReadBook = async () => {
    // [2025-11-17 추가] 로딩 중인 책은 클릭 불가
    if (books[selectedIndex].isLoading || !books[selectedIndex].storyId) {
      console.log("⏳ 동화가 아직 로딩 중입니다. 잠시만 기다려주세요.");
      return;
    }

    try {
      // await addStar(); - 동화 완료 후에만 별 추가
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

  // [2025-11-17 수정] loading 체크 제거 - 항상 화면 표시
  // Progressive Loading으로 인해 LoadingScreen 불필요

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

        {/* [2025-11-17 추가] 동화 다시 추천받기 버튼 */}
        {hasLoadedOnce && !isLoadingStories && (
          <button
            className="refresh-stories-btn"
            onClick={handleRefreshStories}
            title="새로운 동화 추천받기"
          >
            🔄 다시 추천받기
          </button>
        )}
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

        {/* [2025-11-17 수정] 로딩 중인 책은 버튼 비활성화 */}
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
