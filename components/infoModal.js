// components/infoModal.js

import React from 'react';
import styles from '../styles/InfoModal.module.css';

export default function InfoModal({ isOpen, onClose, children }) {
    if (!isOpen) {
        return null;
    }

    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={handleModalContentClick}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
}