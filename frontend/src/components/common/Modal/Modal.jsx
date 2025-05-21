import { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import "../../../styles/components/common/Modal.css";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target))
        onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "modal-sm",
    md: "modal-md",
    lg: "modal-lg",
    xl: "modal-xl",
    full: "modal-full",
  };

  return (
    <div className="modal-overlay">
      <div ref={modalRef} className={`modal-content ${sizeClasses[size]}`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body" style={{ overflowY: 'auto', maxHeight: '70vh' }}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
