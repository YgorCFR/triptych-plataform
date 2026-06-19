// components/Modal.tsx

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{
          backgroundColor: "snow",
          maxHeight: "80vh", // Set max height to limit the modal's size
          overflowY: "auto", // Enable vertical scrolling
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        {children} {/* Ensure this is rendering correctly */}
      </div>
    </div>
  );
};

export default Modal;
