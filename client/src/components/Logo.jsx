// src/components/Logo.jsx
import './Logo.css';

export default function Logo() {
    return (
      <div className="logo-container">
        <svg className="logo-icon" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="url(#logoGradient)"/>
          <circle cx="20" cy="20" r="12" fill="white"/>
          <circle cx="20" cy="20" r="6" fill="#FFCC00"/>
        </svg>
        <span className="logo-text">uizTime</span>
      </div>
    );
  }