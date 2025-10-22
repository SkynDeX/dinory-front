// DinoCharacter.jsx
import React from "react";
import Lottie from "lottie-react";
import "./DinoCharacter.css";
import dinoAnimation from "../assets/dino.json";

function DinoCharacter({ book }) {
  return (
    <div className="dino-wrapper">
      <div className="dino-lottie">
        
        <Lottie
          animationData={dinoAnimation}
          loop
          autoplay
          style={{ width: 150, 
                   height: 150 }}
        />
      </div>

      <div className="speech-bubble">
        <p>
          <strong>{book.title}</strong> <br />
          {book.desc}
        </p>
      </div>
    </div>
  );
};

export default DinoCharacter;
