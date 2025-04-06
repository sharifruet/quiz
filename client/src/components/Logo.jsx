// src/components/Logo.jsx
import './Logo.css';

export default function Logo() {
    return (
      <div className="logo-container">
        <img className="logo-icon" src = "/logo.png"/>
        <span className="logo-text">QuizTime</span>
      </div>
    );
  }