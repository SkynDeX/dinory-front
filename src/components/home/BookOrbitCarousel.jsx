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
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  // Context
  const {user} = useAuth();

  // [2025-11-12 김광현] 동화 로드 - 로그인에 따라서 진행
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);

      try {
        let fetchedStories = [];

        // 로그인 여부
        if(user && selectedChild && selectedEmotion && selectedInterests?.length > 0) {
          // 로그인 되면 자녀/감정/관심사 선택하고 추천동화 시작
          console.log("추천동화 가져오기 :", {
            emotion: selectedEmotion.id,
            interests: selectedInterests,
            childId: selectedChild.id
          });

          fetchedStories = await getRecommendedStories(
            selectedEmotion.id,
            selectedInterests,
            selectedChild.id,
            5
          );
        } else {
          // 로그인이 안되거나 자녀/감정/관심사 선택이 안되면
          console.log("랜덤동화 가져오기 (로그인 전 or 선택 전 입니다.");

          fetchedStories = await getRandomStories(5);
        }

        // [2025-11-14 김광현] 동화 추천 다양성 개선
        // Fisher-Yates Shuffle 알고리즘
        const storiesArry = Array.isArray(fetchedStories) ? fetchedStories : [];
        const suffled = [...storiesArry];
        
        for(let i = suffled.length -1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [suffled[i], suffled[j]] = [suffled[j], suffled[i]];
        }

        // 책 데이터 파이콘에서 가져오기
        const transformedBooks = suffled.map((story, index) => ({
          id: index + 1,
          storyId: story.storyId,
          title: story.title,
          image: `/assets/intro/0${(index % 5) + 1}.png`,
          desc: story.description,
          themes: story.themes || [],
          matchingScore: story.matchingScore || 50,
        }));

        setBooks(transformedBooks);
        console.log("동화 완료 로드 :", transformedBooks.length, "개");

      } catch (error) {
        console.error("동화 로드 실패: ", error);

        // 실패하면 하드코딩 사용
        setBooks([
          { id: 1, title: "달 위의 곰돌이", image: "/assets/intro/01.png", desc: "달나라에서 펼쳐지는 따뜻한 모험", storyId: "default_1" },
          { id: 2, title: "바다의 인어", image: "/assets/intro/02.png", desc: "바다 속 친구들과의 우정 이야기", storyId: "default_2" },
          { id: 3, title: "숲 속 요정", image: "/assets/intro/03.png", desc: "마법의 숲에서 만난 친구들", storyId: "default_3" },
          { id: 4, title: "우주 탐험", image: "/assets/intro/04.png", desc: "별들 사이를 여행하는 모험", storyId: "default_4" },
          { id: 5, title: "공룡 친구", image: "/assets/intro/05.png", desc: "용감한 공룡들의 이야기", storyId: "default_5" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, [user, selectedChild, selectedEmotion, selectedInterests]);


  const handleChangeChild = () => {
    navigate("/child/select");
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

    let rotation = 0;
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

  if (loading) {
    return <LoadingScreen message="동화를 불러오는 중이에요..."/>;
  }

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
        <div className="carousel-title">{books[selectedIndex].title}</div>
        <div className="carousel-index">
          {selectedIndex + 1} / {books.length}
        </div>

        <button className="book-read-btn" onClick={handleReadBook}>
          책 읽기
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
