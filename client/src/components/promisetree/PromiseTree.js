// Promise display component
import React, { useState, useEffect } from 'react';
import './promisetree.css';
import backgroundVideo from '../../assets/Sun_Bright_Nature_Park_Walking_uhd_1907853.mp4';
import axios from 'axios';
import { API_BASE_URL, APP_CONFIG } from '../../config';

const PromiseTree = () => {
  // State variables
  const [promises, setPromises] = useState([]);
  const [filteredPromises, setFilteredPromises] = useState([]);
  const [selectedPromise, setSelectedPromise] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Responsive carousel settings
  const getItemsPerSlide = () => {
    if (windowWidth <= 576) return 1;
    if (windowWidth <= 992) return 2;
    return 3;
  };

  // Handle mobile browser chrome (address bar) height changes
  useEffect(() => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    const handleResize = () => {
      // Reset viewport height variable on resize
      vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Update window width for carousel
      setWindowWidth(window.innerWidth);
      // Reset to first slide when resizing to avoid empty slides
      setCurrentSlide(0);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Improve iOS scroll behavior for address bar
    const handleTouchMove = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    
    window.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Load promises data from the API
  const fetchPromises = async () => {
    try {
      setLoading(true);
      
      // Fetch pledges from the database with correct server URL
      const response = await axios.get(`${API_BASE_URL}/api/pledges`);
      // Extract the data from the response.data.data (the server returns { success: true, data: [...] })
      const pledges = response.data.data || [];
      
      // Map the pledges to a consistent format in case API returns different field names
      const formattedPledges = pledges.map(pledge => ({
        _id: pledge._id,
        name: pledge.name || pledge.user || 'Anonymous',
        promise: pledge.promise || pledge.details || pledge.text || pledge.pledge || '',
        createdAt: pledge.createdAt || pledge.date || new Date().toISOString(),
        email: pledge.email,
        reminderConsent: pledge.reminderConsent || pledge.consent || false
      }));
      
      // Sort pledges by date (newest first)
      const sortedPledges = formattedPledges.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setPromises(sortedPledges);
      setFilteredPromises(sortedPledges);
      setError(null);
    } catch (err) {
      setError('Failed to load pledges. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPromises();
    
    // Set up polling to check for new pledges every 30 seconds
    const intervalId = setInterval(() => {
      fetchPromises();
    }, APP_CONFIG.updateInterval);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Filter promises based on search term
  useEffect(() => {
    if (!promises.length) return;
    
    if (searchQuery === '') {
      setFilteredPromises(promises);
    } else {
      const filtered = promises.filter(
        promise => 
          promise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          promise.promise.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPromises(filtered);
    }
    
    // Reset carousel to first slide when search changes
    setCurrentSlide(0);
  }, [searchQuery, promises]);
  
  // Calculate total number of slides
  const itemsPerSlide = getItemsPerSlide();
  const totalSlides = Math.ceil(filteredPromises.length / itemsPerSlide);
  
  // Navigate to previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  // Navigate to next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  // Format the date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle click on a promise
  const handlePromiseClick = (promise) => {
    setSelectedPromise(promise);
  };

  // Close the promise details modal
  const closePromiseDetails = () => {
    setSelectedPromise(null);
  };
  
  // Get current visible promises
  const getCurrentPromises = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return filteredPromises.slice(startIndex, startIndex + itemsPerSlide);
  };

  // Render the carousel content
  const renderCarousel = () => {
    const isMobile = windowWidth <= 576;
    
    // Check if there are no promises at all
    if (promises.length === 0) {
      return (
        <div className="no-promises">
          <p>No pledges have been made yet. Be the first to make a pledge!</p>
          <div className="empty-state-icon">
            <span role="img" aria-label="Growing plant">🌱</span>
          </div>
          <p className="empty-state-subtext">
            Your pledge will help grow our community of environmental commitments.
          </p>
        </div>
      );
    }
    
    // If no promises found after filtering
    if (filteredPromises.length === 0) {
      return (
        <div className="no-promises">
          <p>No pledges found matching your search.</p>
        </div>
      );
    }
    
    return (
      <div className="carousel-container">
        {!isMobile ? (
          // Desktop view with content wrapper
          <div className="carousel-content-wrapper">
            <button 
              className="carousel-button prev-button" 
              onClick={prevSlide} 
              disabled={currentSlide === 0}
              aria-label="Previous slide"
            >
              &lt;
            </button>
            
            <div className="carousel-content">
              {getCurrentPromises().map((promise) => (
                <div 
                  key={promise._id} 
                  className="promise-card"
                  onClick={() => handlePromiseClick(promise)}
                >
                  <div className="card-header">
                    <h3>{promise.name || 'Anonymous'}</h3>
                    <small>{formatDate(promise.createdAt)}</small>
                  </div>
                  <div className="card-content">
                    <p>{promise.promise || 'No details available'}</p>
                  </div>
                  <div className="card-footer">
                    <span className="read-more">Read more</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className="carousel-button next-button" 
              onClick={nextSlide} 
              disabled={currentSlide === totalSlides - 1}
              aria-label="Next slide"
            >
              &gt;
            </button>
          </div>
        ) : (
          // Mobile view remains unchanged
          <>
            <div className="carousel-content">
              {getCurrentPromises().map((promise) => (
                <div 
                  key={promise._id} 
                  className="promise-card mobile-card"
                  onClick={() => handlePromiseClick(promise)}
                >
                  <div className="card-header">
                    <h3>{promise.name || 'Anonymous'}</h3>
                    <small>{formatDate(promise.createdAt)}</small>
                  </div>
                  <div className="card-content">
                    <p>{promise.promise || 'No details available'}</p>
                  </div>
                  <div className="card-footer">
                    <span className="read-more">Read more</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mobile-carousel-controls">
              <button 
                className="carousel-button prev-button" 
                onClick={prevSlide} 
                disabled={currentSlide === 0}
                aria-label="Previous slide"
              >
                &lt;
              </button>
              <button 
                className="carousel-button next-button" 
                onClick={nextSlide} 
                disabled={currentSlide === totalSlides - 1}
                aria-label="Next slide"
              >
                &gt;
              </button>
            </div>
          </>
        )}
        
        {renderCarouselIndicators()}
      </div>
    );
  };

  // Render the carousel indicators
  const renderCarouselIndicators = () => {
    const isMobile = windowWidth <= 576;
    
    if (isMobile) {
      // For mobile devices, just show 3 dots (previous, current, next)
      return (
        <div className="carousel-indicators mobile-indicators">
          {/* Previous slide indicator */}
          <div
            className={`carousel-indicator ${currentSlide > 0 ? 'available' : 'disabled'}`}
            onClick={() => currentSlide > 0 && setCurrentSlide(currentSlide - 1)}
            aria-label="Previous slide"
          />
          
          {/* Current slide indicator */}
          <div
            className="carousel-indicator active"
            aria-label={`Current slide ${currentSlide + 1} of ${totalSlides}`}
          />
          
          {/* Next slide indicator */}
          <div
            className={`carousel-indicator ${currentSlide < totalSlides - 1 ? 'available' : 'disabled'}`}
            onClick={() => currentSlide < totalSlides - 1 && setCurrentSlide(currentSlide + 1)}
            aria-label="Next slide"
          />
        </div>
      );
    }
    
    // For desktop, show all indicators (one per slide)
    return (
      <div className="carousel-indicators">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <div
            key={index}
            className={`carousel-indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="promise-tree-container">
      <video 
        autoPlay 
        muted 
        loop 
        className="background-video" 
        playsInline 
        disablePictureInPicture 
        controlsList="nodownload nofullscreen noremoteplayback" 
        style={{ pointerEvents: 'none' }}
      >
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="content-overlay">
        <div className="main-content mobile-scroll-container">
          <h1 className="page-title">Promises for the Earth</h1>
          <p className="page-description">
            Each promise represents a commitment to create a more sustainable food future.
            Browse through the carousel or search for specific promises.
          </p>
        
          <div className="search-container">
            <input
              type="text"
              placeholder="Search promises..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
        
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading promises...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
            </div>
          ) : (
            <div className="carousel-section">
              {renderCarousel()}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal for displaying promise details */}
      {selectedPromise && (
        <div className="promise-details-modal">
          <div className="modal-content">
            <button className="close-button" onClick={closePromiseDetails}>&times;</button>
            <h2>Promise Details</h2>
            
            <div className="detail-item">
              <strong>Name:</strong>
              <span>{selectedPromise.name || 'Anonymous'}</span>
            </div>
            
            <div className="detail-item">
              <strong>Date:</strong>
              <span>{formatDate(selectedPromise.createdAt)}</span>
            </div>
            
            <div className="detail-item">
              <strong>Promise:</strong>
              <span>{selectedPromise.promise}</span>
            </div>
            
            {selectedPromise.reminderConsent !== undefined && (
              <div className="detail-item">
                <strong>Reminder Consent:</strong>
                <div className="reminder-consent">
                  {selectedPromise.reminderConsent 
                    ? 'This user has agreed to receive reminders about their promise.' 
                    : 'This user has opted out of receiving reminders.'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromiseTree; 