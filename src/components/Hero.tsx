import './Hero.css';
import { ArrowUpRight, MessageSquare } from 'lucide-react';
import heroImage from '../assets/hero_bg.jpg';

interface HeroProps {
  onContactClick: () => void;
}

export function Hero({ onContactClick }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-campaign" style={{ backgroundImage: `url(${heroImage})` }}>
        
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
