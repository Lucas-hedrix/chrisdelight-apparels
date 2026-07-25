import { X } from 'lucide-react';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel"
}: ConfirmModalProps) {
  
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3>{title}</h3>
          <button className="confirm-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="confirm-modal-body">
          <p>{message}</p>
          <div className="confirm-modal-actions">
            <button className="btn-cancel" onClick={onClose}>{cancelText}</button>
            <button className="btn-confirm" onClick={() => { onConfirm(); onClose(); }}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
