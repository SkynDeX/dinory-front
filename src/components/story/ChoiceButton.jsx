import React from "react";
import "./ChoiceButton.css";

function ChoiceButton({choice, onSelect}) {
    
    const getAbilityColor = (abilityType) => {
        const colors = {
            "친절": "#ffd166",
            "용기": "#ff6b6b",
            "공감": "#87ceeb",
            "우정": "#ffb6c1",
            "자존감": "#2fa36b",
            "default": "#c0c0c0"
        };
        return colors[abilityType] || colors.default;
    };

    return (
        <button 
            className="choice_button"
            onClick={()=> onSelect(choice)}>
                <div className="choice_content">
                    <span className="choice_text">{choice.choiceText}</span>
                    <div className="choice_meta">
                        <span 
                            className="ability_badge"
                            style={{
                                backgroundColor: getAbilityColor(choice.abilityType),
                                color: "white"
                            }}>
                                {choice.abilityType} + {choice.abilityScore}
                            </span>
                    </div>
                </div>
        </button>
    )
}

export default ChoiceButton;