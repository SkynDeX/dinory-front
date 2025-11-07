import React from "react";
import "./ChoiceButton.css";

function ChoiceButton({choice, onSelect}) {

    return (
        <button 
            className="choice_button"
            onClick={()=> onSelect(choice)}>
                {/* {console.log('Choice 전체:', JSON.stringify(choice, null, 2))} */}
                {console.log('Choice:', choice.choiceText, 'abilityScore:', choice.abilityScore, 'abilityPoints:', choice.abilityPoints)}
                <div className="choice_content">
                    <span className="choice_text">{choice.choiceText || choice.label || choice.text}</span>
                </div>
        </button>
    )
}

export default ChoiceButton;