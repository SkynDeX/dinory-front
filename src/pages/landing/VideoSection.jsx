import React from "react";
import "./VideoSection.css";

function VideoSection() {
  return (
    <section className="video-section">
      <h2 className="video-title">Dinory, 이렇게 경험해요!</h2>

      <div className="video-wrapper">
        <video
          className="promo-video"
          src="/videos/dinory.mp4"
          controls
          preload="metadata"
        />
      </div>
    </section>
  );
}

export default VideoSection;
