import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import "./BookOrbitCarousel.css";
import DinoCharacter from "./DinoCharacter";

// 일단 예시로 달아둔 도서 데이터
const books = [
  { id: 1, title: "달 위의 곰돌이", 
           image: "/assets/intro/01.png", 
           desc: "달 위에서 꿈꾸는 귀여운 곰돌이 이야기" },

  { id: 2, title: "바다의 인어", 
           image: "/assets/intro/02.png", 
           desc: "푸른 바다 속 인어의 노래" },

  { id: 3, title: "꿈나라 기차", 
           image: "/assets/intro/03.png", 
           desc: "밤하늘을 달리는 꿈나라 기차" },

  { id: 4, title: "마법 고양이", 
           image: "/assets/intro/04.png", 
           desc: "마법 지팡이를 든 고양이의 모험" },

  { id: 5, title: "무지개 유니콘", 
           image: "/assets/intro/05.png", 
           desc: "무지개를 달리는 유니콘의 이야기" },

  { id: 6, title: "요정의 숲", 
           image: "/assets/intro/06.png", 
           desc: "요정들이 사는 신비한 숲속 이야기" },

  { id: 7, title: "별빛 토끼", 
           image: "/assets/intro/07.png", 
           desc: "별빛을 따라 떠나는 토끼의 여행" },

  { id: 8, title: "하늘의 펭귄", 
           image: "/assets/intro/08.png", 
           desc: "하늘을 나는 펭귄의 모험" },
];

// 테마 색상
const THEME_COLORS = ["#2fa36b", "#ff9b7a", "#87ceeb", "#ffd166"];

function BookOrbitCarousel() {
  const containerRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 기존에 있는 캔버스를 초기화
    while (container.firstChild) container.removeChild(container.firstChild);

    // 3D 장면 생성
    const scene = new THREE.Scene();

    // 배경 그라데이션 설정
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

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.5, 13);

    // 렌더 설정
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 조명 추가
    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    const light = new THREE.DirectionalLight(0xffffff, 1.8);
    light.position.set(5, 10, 10);
    scene.add(ambient, light);

    // 블룸 효과 설정
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.6,
      0.4,
      0.85
    );
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    // 책 모델 생성하기
    const radius = 7;
    const loader = new THREE.TextureLoader();
    const bookGeom = new THREE.BoxGeometry(2.0, 2.6, 0.12);
    const meshes = [];

    books.forEach((book, i) => {
      const tex = loader.load(process.env.PUBLIC_URL + book.image);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        emissive: new THREE.Color(THEME_COLORS[i % 4]),
        emissiveIntensity: 0.25,
        roughness: 0.25,
        metalness: 0.15,
      });
      const mesh = new THREE.Mesh(bookGeom, mat);
      mesh.userData = { index: i };
      mesh.position.y = 0.2;
      scene.add(mesh);
      meshes.push(mesh);
    });

    // 회전하는 캐러셀 애니메이션
    let rotation = 0;
    const targetRotation = { value: 0 };

    const animate = () => {
      requestAnimationFrame(animate);
      rotation += (targetRotation.value - rotation) * 0.05;

      meshes.forEach((mesh, i) => {
        const angle = (i / books.length) * Math.PI * 2 + rotation;
        mesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        mesh.lookAt(camera.position);

        const dist = Math.abs(angle % (Math.PI * 2) - Math.PI);
        const glow = 1 - Math.min(1, dist / Math.PI);
        mesh.scale.setScalar(1 + glow * 0.5);

        if (glow > 0.9) setSelectedIndex(i);
      });

      composer.render();
    };
    animate();

    // 마우스 휠로 회전 제어하기
    let wheelLocked = false;
    const onWheel = (e) => {
      if (wheelLocked) return;
      wheelLocked = true;
      e.deltaY > 0
        ? (targetRotation.value -= (Math.PI * 2) / books.length)
        : (targetRotation.value += (Math.PI * 2) / books.length);
      setTimeout(() => (wheelLocked = false), 800);
    };
    container.addEventListener("wheel", onWheel, { passive: true });

    // 화면 크기 변경 대응
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      composer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // 정리
    return () => {
      window.removeEventListener("resize", onResize);
      container.removeEventListener("wheel", onWheel);
      while (container.firstChild) container.removeChild(container.firstChild);
      renderer.dispose();
    };
  }, []);

  // UI 렌더
  return (
    <div className="carousel-wrapper">
      <div ref={containerRef} className="three-container" />

      <div className="carousel-controls">
        <div className="carousel-title">{books[selectedIndex].title}</div>
        <div className="carousel-index">
          {selectedIndex + 1} / {books.length}
        </div>
      </div>

      <DinoCharacter book={books[selectedIndex]} />
    </div>
  );
};

export default BookOrbitCarousel;
