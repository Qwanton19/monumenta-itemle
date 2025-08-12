import HomeButton from './homeButton';
import LanguageSelector from './languageSelector';
import TranslatableText from './translatableText';
import styles from '../styles/Header.module.css';
import React from 'react';
import InfoModal from './infoModal';

export default function Header() {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    return (
        <header className="py-2 border-bottom border-light mb-2 position-relative">
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
            }}>
                <span className="fs-4 fw-bold">Monumenta Itemle</span>
            </div>

            <div className="row mx-0">
                <div className="col-2 col-md-1 col-lg-1">
                    <HomeButton />
                </div>

                <div className="col-8 col-md-4 col-lg-4 d-inline-flex align-items-center" style={{ marginLeft: '-7rem' }}>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={styles.infoButton}
                        title="How to Play"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    </button>

                    <div className="d-inline-flex align-items-center" style={{ marginLeft: '4rem' }}>
                        <TranslatableText identifier="header.selector.language" className="me-3"></TranslatableText>
                        <LanguageSelector />
                    </div>
                </div>

                <div className="col d-inline-flex justify-content-end align-items-center">
                    <span className="py-1"><b>Want to help translate?</b> Visit the <u><a className={styles.link} rel="noopener noreferrer" href="https://crowdin.com/project/ohthemisery" target="_blank">Crowdin Project</a></u>!</span>
                </div>
            </div>

            <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2 style={{ color: '#fff', borderBottom: '1px solid #545454', paddingBottom: '0.5rem' }}>How to Play</h2>
                <p>Guess the daily Monumenta item in 6 tries or less! Use the filters to narrow down your search and make an informed guess.</p>

                <h4 style={{ color: '#fff', marginTop: '1.5rem' }}>Feedback Colors</h4>
                <ul style={{ paddingLeft: '1.5rem', listStyle: 'none' }}>
                    <li><strong style={{ color: '#28a745' }}>🟩 Green:</strong> Correct property.</li>
                    <li><strong style={{ color: '#ffc107' }}>🟨 Yellow:</strong> Partial match (e.g., correct enchant / is a tiered item, but wrong level/tier).</li>
                    <li><strong style={{ color: '#dc3545' }}>🟥 Red:</strong> Incorrect property.</li>
                    <li><strong style={{ color: '#FFFFFF' }}>⬜ White:</strong> Item did not have enough enchants for this square.</li>
                </ul>

                <h4 style={{ color: '#fff', marginTop: '1.5rem' }}>Important Notes</h4>
                <p style={{ fontStyle: 'italic' }}>
                    Only the top two enchants on an item are used for hints. Attributes (like +Health) and any enchants beyond the first two will appear at the bottom of the item and do not give feedback, to keep the game challenging.
                </p>
            </InfoModal>
        </header>
    );
}