import { useState, useEffect } from 'react';
import './Hero.css';
import { ArrowUpRight, MessageSquare } from 'lucide-react';
import bg1 from '../assets/Tshirts/hero_bg.jpg';
import bg2 from '../assets/Tshirts/Tshirts.jpg';
import bg3 from '../assets/Tshirts/cargo_15.jpg';
import bg4 from '../assets/Tshirts/tshirt_10.jpg';

const backgroundImages = [bg1, bg2, bg3, bg4];

interface HeroProps {
  onContactClick: () => void;
}

export function Hero({ onContactClick }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero">
      {backgroundImages.map((img, index) => (
        <div
          key={index}
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      <div className="hero-overlay" />
      
      <div className="hero-campaign">
        {/* Big Watermark behind */}
        <h1 className="hero-watermark">CHRISDELIGHT</h1>
        
        {/* Accent text overlapping */}
        <h2 className="hero-accent">Everyday Fits</h2>

        <div className="hero-content">
          <div className="hero-content-left">
            <p className="hero-eyebrow-text">CREATED FOR YOU</p>
            <p className="hero-subtitle-text">Clean fits, easy layers, and the everyday essentials you reach for first.</p>
            <div className="hero-buttons">
              <a href="#shop" className="hero-button">Explore collection <ArrowUpRight size={17} /></a>
              <button onClick={onContactClick} className="hero-button hero-button-secondary">
                Contact Us <MessageSquare size={15} />
              </button>
            </div>
          </div>
          
          <div className="hero-content-right">
            <div className="hero-exclusive">
              <h3>THIS MONTH'S EXCLUSIVE</h3>
              <p>Own the next-generation apparel engineered for your daily routine.</p>
              <a href="#shop" className="exclusive-link">See more info <ArrowUpRight size={14} /></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
