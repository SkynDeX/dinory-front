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

const books = [
  { id: 1, title: "달 위의 곰돌이", image: "/assets/intro/01.png", desc: "달 위에서 꿈꾸는 귀여운 곰돌이 이야기" },
  { id: 2, title: "바다의 인어", image: "/assets/intro/02.png", desc: "푸른 바다 속 인어의 노래" },
  { id: 3, title: "꿈나라 기차", image: "/assets/intro/03.png", desc: "밤하늘을 달리는 꿈나라 기차" },
  { id: 4, title: "마법 고양이", image: "/assets/intro/04.png", desc: "마법 지팡이를 든 고양이의 모험" },
  { id: 5, title: "무지개 유니콘", image: "/assets/intro/05.png", desc: "무지개를 달리는 유니콘의 이야기" },
];

const THEME_COLORS = ["#2fa36b", "#ff9b7a", "#87ceeb", "#ffd166"];

function BookOrbitCarousel() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { addStar } = useContext(RewardContext);
  const { selectedChild } = useChild();
  const targetRotation = useRef(0);
  const dragDistanceRef = useRef(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const handleChangeChild = () => {
    navigate("/child/select");
  };

  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return books.map((book) => loader.load(process.env.PUBLIC_URL + book.image));
  }, []);

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
  }, [textures]);

  const handleReadBook = async () => {
    try {
      await addStar();
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
                  src={
                    selectedChild.gender === "male"
                      ? `${process.env.PUBLIC_URL}/assets/icons/bkid.png`
                      : `${process.env.PUBLIC_URL}/assets/icons/gkid.png`
                  }
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
        <BookInfoModal book={selectedBook} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default BookOrbitCarousel;
