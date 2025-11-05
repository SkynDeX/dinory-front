import React from "react";
import "../../components/story/NegativeModal.css";

function NegativeModal({isOpen, onClose, title, message, type = 'info'}) {
    if(!isOpen) {
        return null;
    }

    return (
        <div className="modal_overlay" onClick={onClose}>
            <div className="modal_container" onClick={(e) => e.stopPropagation()}>
                <div className={`modal_header modal_${type}`}>
                    <span className="modal_icon">
                        {type === 'warning' && '⚠️'}
                        {type === 'error' && '❌'}
                        {type === 'success' && '✅'}
                        {type === 'info' && 'ℹ️'}
                    </span>
                    <h2 className="modal_title">{title}</h2>
                </div>

                <div className="modal_body">
                    <p className="modal_message">{message}</p>
                </div>

                <div className="modal_footer">
                    <button className="modal_button" onClick={onClose}>
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NegativeModal;