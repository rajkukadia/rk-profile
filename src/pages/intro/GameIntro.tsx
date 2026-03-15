import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./intro.css";

const GameIntro: React.FC = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsLoading(false);
            setTimeout(() => setShowContent(true), 100);
          }, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(progressInterval);
  }, []);

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate("/home");
    }, 500);
  };

  return (
    <div className="game-intro">
      {isTransitioning && (
        <div className="screen-transition-overlay" />
      )}

      {isLoading && (
        <div className="loading-screen">
          <div className="loading-text">LOADING...</div>
          <div className="progress-bar-container">
            <div className="progress-bar-border">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
          <div className="loading-percentage">{loadingProgress}%</div>
        </div>
      )}

      {!isLoading && (
        <div className="intro-content">
          <div className={`title-container-wrapper ${showContent ? 'show' : ''}`}>
            <h1 className="pixel-title">RAJ KUKADIA</h1>
          </div>

          {showContent && (
            <button
              onClick={handleStart}
              className="start-button-pulse"
            >
              ▶ PRESS START
            </button>
          )}
        </div>
      )}

      <div className="pixel-border-top"></div>
      <div className="pixel-border-bottom"></div>
      <div className="pixel-border-left"></div>
      <div className="pixel-border-right"></div>

      <div className="pixel-stars">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="pixel-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default GameIntro;
