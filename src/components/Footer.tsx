import { Link } from 'react-router-dom';
import './Footer.css';

interface FooterProps {
  onContactClick: () => void;
}

export function Footer({ onContactClick }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>CHRISDELIGHT APPARELS</h4>
            <p>Minimalist design. Maximum comfort. Elevating your everyday essentials with quality and style.</p>
          </div>
          <div className="footer-section">
            <h4>Shop</h4>
            <ul className="footer-links">
              <li><a href="#">New Arrivals</a></li>
              <li><a href="#">Best Sellers</a></li>
              <li><a href="#">Collections</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><a href="#">FAQ</a></li>
              <li><Link to="/shipping-returns">Shipping & Returns</Link></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onContactClick(); }}>Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Chrisdelight Apparels. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
