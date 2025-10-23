import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import dinoLoading from "../../assets/lottie/dinosaurs-loading-repeat.json";
import "./LoadingScreen.css";

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <Player autoplay loop src={dinoLoading} className="loading-lottie" />
      <p className="loading-text">공룡 친구들을 불러오는 중이에요...</p>
    </div>
  );
}
