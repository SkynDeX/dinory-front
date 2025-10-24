import React from "react";
import "./BookInfoModal.css"; 

export default function BookInfoModal({ book, onClose }) {
  if (!book) return null;

  return (
    <div className="book-modal-overlay" onClick={onClose}>
      <div className="book-modal" onClick={(e) => e.stopPropagation()}>
        <img src={book.image} alt={book.title} className="book-modal-img" />
        <h2 className="book-modal-title">{book.title}</h2>
        <p className="book-modal-desc">{book.desc}</p>
        <button className="book-modal-close" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
