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
  const itemsPerSlide = 3; // Number of promises to show per slide
  
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
    
    // Get the current promises to display
    const currentPromises = getCurrentPromises();
    
    return (
      <>
        <div className="carousel-container">
          <button 
            className="carousel-button prev-button" 
            onClick={prevSlide}
            disabled={totalSlides <= 1}
            aria-label="Previous slide"
          >
            &laquo;
          </button>
          
          <div className="carousel-content">
            {currentPromises.map(promise => (
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
            disabled={totalSlides <= 1}
            aria-label="Next slide"
          >
            &raquo;
          </button>
        </div>
        
        {totalSlides > 1 && (
          <div className="carousel-indicators">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator ${currentSlide === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="promise-tree-container">
      <video className="background-video" autoPlay loop muted>
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="content-overlay">
        <div className="main-content">
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
        <div className="promise-details-overlay" onClick={closePromiseDetails}>
          <div className="promise-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closePromiseDetails}>×</button>
            <h2 className="modal-title">{selectedPromise.name || 'Anonymous'}</h2>
            <p className="modal-date">Pledged on {formatDate(selectedPromise.createdAt)}</p>
            <p className="modal-promise">"{selectedPromise.promise}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromiseTree; 