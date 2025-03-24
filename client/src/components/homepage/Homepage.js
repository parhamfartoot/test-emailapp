import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './homepage.css';
import '../mobile-optimizations.css';
import backgroundVideo from '../../assets/Sun_Bright_Nature_Park_Walking_uhd_1907853.mp4';
// Use the static image that exists in the assets folder
import staticBackground from '../../assets/Sun_Bright_Nature_Park_Walking_static.jpg';

function AppHome() {
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // Function to handle scrolling when arrows are clicked
  const handleScroll = useCallback((direction) => {
    if (contentRef.current) {
      const scrollAmount = direction === 'down' ? 300 : -300;
      contentRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  // Function to check scroll position and update arrow visibility
  const checkScrollPosition = useCallback(() => {
    if (!contentRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    
    // Always show down arrow if content is larger than view area
    const hasMoreContent = scrollHeight > clientHeight;
    // Only hide down arrow when we're very close to the bottom
    setShowScrollDown(hasMoreContent && scrollTop < scrollHeight - clientHeight - 5);
    
    // Show up arrow as soon as we scroll a little
    setShowScrollUp(scrollTop > 5);
  }, []);

  // Function to check device capability/connection speed
  const checkDeviceCapability = useCallback(() => {
    // Check if battery API is available
    if ('getBattery' in navigator) {
      navigator.getBattery().then(batteryManager => {
        // If battery level is below 15% or in power saving mode, switch to static image
        if (batteryManager.level < 0.15 || batteryManager.charging === false) {
          setIsLowPowerMode(true);
        }
      }).catch(() => {
        // If can't access battery API, use connection check
        checkConnectionSpeed();
      });
    } else {
      // Fallback to connection check
      checkConnectionSpeed();
    }
  }, []);

  // Check connection speed
  const checkConnectionSpeed = useCallback(() => {
    // Use Network Information API if available
    if ('connection' in navigator) {
      const connection = navigator.connection;
      if (connection.saveData || 
          connection.effectiveType === 'slow-2g' || 
          connection.effectiveType === '2g') {
        setIsLowPowerMode(true);
      }
    }
  }, []);

  // Function to handle window resize
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Function to handle video loaded
  const handleVideoLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      // Check initial scroll position
      checkScrollPosition();
      
      // Add scroll event listener
      content.addEventListener('scroll', checkScrollPosition);
      
      // Check device capabilities for video playback
      checkDeviceCapability();
      
      // Add resize listener
      window.addEventListener('resize', handleResize);
      
      // Clean up event listeners on unmount
      return () => {
        content.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [checkScrollPosition, checkDeviceCapability, handleResize]);

  return (
    <div className="home-container earth-theme" ref={containerRef}>
      {isLoading && isMobile && (
        <div className="mobile-loading">
          <p>Loading green experience...</p>
        </div>
      )}
      
      <video 
        ref={videoRef}
        autoPlay 
        muted 
        loop 
        className={`video-background ${isLowPowerMode ? 'low-power' : ''}`}
        playsInline 
        disablePictureInPicture 
        controlsList="nodownload nofullscreen noremoteplayback" 
        style={{ pointerEvents: 'none' }}
        onCanPlay={handleVideoLoaded}
      >
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Static image fallback for low power mode */}
      {isLowPowerMode && (
        <img 
          src={staticBackground} 
          alt="Nature background" 
          className="static-background" 
        />
      )}
      
      <div className="video-overlay"></div>
      
      <div className="home-content mobile-scroll-container" ref={contentRef}>
        <h1 className="handwritten-title">A Promise to the Earth</h1>
        <p className="subtitle">The First Supper - A Digital Time Capsule</p>
        
        <div className="earth-promise-prompt">
          <p>"What is your promise to the Earth for 2050?"</p>
          <p>The First Supper represents the inaugural meal of our aspirational future—a world where 
             food systems are sustainable, just, and equitable. What habit, action, or initiative will you 
             commit to today to make that future a reality?</p>
        </div>
        
        <div className="action-buttons">
          <Link to="/email-form" className="btn-primary">
            Make Your Promise
          </Link>
          <Link to="/promise-tree" className="btn-secondary">
            View Pledges Made
          </Link>
        </div>
        
        <div className="app-description">
          <h2>About the Digital Time Capsule</h2>
          <p>
            This promise is more than just words—it's a commitment to the future. We will reach out to you 
            in five years to remind you of the role you chose to play in shaping the food systems of tomorrow.
          </p>
          <p>
            Each promise you make will be visualized as a leaf on our collective tree, symbolizing the growth 
            of our sustainable community. Together, our individual actions create a forest of change.
          </p>
        </div>
        
        <div className="earth-examples">
          <h3>Examples of Promises:</h3>
          <ul>
            <li>"I will compost my food scraps instead of sending them to landfill."</li>
            <li>"I will support local farmers and buy more seasonal foods."</li>
            <li>"I will advocate for a free, sustainable meal program for all students."</li>
          </ul>
        </div>
        
        <div className="privacy-notice">
          <p>
            By submitting a promise, you agree that your submission may be displayed publicly as part of 
            the Students' First Supper Digital Time Capsule. If you provide an email, you consent to 
            receiving a one-time reminder in 2029. Submissions that contain hate speech, defamatory 
            content, or unlawful material will be removed at our discretion.
          </p>
        </div>
      </div>
      
      {/* Scroll Indicators - moved outside of home-content */}
      <div 
        className={`scroll-indicator scroll-down ${showScrollDown ? 'visible' : ''}`} 
        onClick={() => handleScroll('down')}
        aria-label="Scroll down"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </div>
      
      <div 
        className={`scroll-indicator scroll-up ${showScrollUp ? 'visible' : ''}`} 
        onClick={() => handleScroll('up')}
        aria-label="Scroll up"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
        </svg>
      </div>
    </div>
  );
}

export default AppHome;