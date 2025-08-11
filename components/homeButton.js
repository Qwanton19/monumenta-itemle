import React from 'react';
import styles from '../styles/HomeButton.module.css';

export default function HomeButton() {
  return (
    <a
      href="https://odetomisery.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.homebutton}
      title="Go to Ode to Misery"
    >
      <img
        src="/favicon.ico"
        alt="Ode to Misery Home"
      />
    </a>
  );
}