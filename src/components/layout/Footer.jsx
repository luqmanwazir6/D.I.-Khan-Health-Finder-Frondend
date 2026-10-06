import { Link } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaShieldAlt,
} from 'react-icons/fa';
import { APP_CONFIG } from '@/constants/config';
import { ROUTES } from '@/constants/routes';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-root">
      <div className="container footer-grid">
        {/* Brand & D.I. Khan Mission */}
        <div className="footer-col footer-col-brand">
          <Link to={ROUTES.HOME} className="footer-brand">
            <span className="footer-brand-icon" aria-hidden="true">
              <FaMapMarkerAlt />
            </span>
            <span>
              <strong>D.I. Khan</strong> Service Finder
            </span>
          </Link>
          <p className="footer-tagline">{APP_CONFIG.tagline}</p>
          <p className="footer-desc">
            Connecting homeowners, businesses, and drivers across Dera Ismail Khan with verified local electricians, plumbers, mechanics, AC technicians, and craft professionals.
          </p>
          <div className="footer-social-links" aria-label="Social media links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
          </div>
        </div>

        {/* Popular Services */}
        <div className="footer-col">
          <h4 className="footer-heading">Popular Services</h4>
          <ul className="footer-links" role="list">
            <li>
              <Link to="/services/plumber">Plumber in D.I. Khan</Link>
            </li>
            <li>
              <Link to="/services/electrician">Electrician & UPS Wiring</Link>
            </li>
            <li>
              <Link to="/services/ac-technician">DC Inverter AC Service</Link>
            </li>
            <li>
              <Link to="/services/car-mechanic">Car & Bike Mechanics</Link>
            </li>
            <li>
              <Link to="/services/solar-technician">Solar Panel Technician</Link>
            </li>
            <li>
              <Link to="/services/carpenter">Carpenter & Wood Work</Link>
            </li>
          </ul>
        </div>

        {/* Customer & Community */}
        <div className="footer-col">
          <h4 className="footer-heading">For Customers</h4>
          <ul className="footer-links" role="list">
            <li>
              <Link to={ROUTES.PROVIDERS}>Find Verified Professionals</Link>
            </li>
            <li>
              <Link to={ROUTES.SERVICES}>Browse All Categories</Link>
            </li>
            <li>
              <Link to={ROUTES.NEW_REQUEST}>Submit Service Request</Link>
            </li>
            <li>
              <Link to={ROUTES.CUSTOMER_DASHBOARD}>Track My Requests</Link>
            </li>
            <li>
              <Link to="/search?city=dera-ismail-khan">Search by Area in Dera</Link>
            </li>
          </ul>
        </div>

        {/* Service Providers & Platform */}
        <div className="footer-col">
          <h4 className="footer-heading">For Professionals</h4>
          <ul className="footer-links" role="list">
            <li>
              <Link to={ROUTES.REGISTER}>Join as a Professional</Link>
            </li>
            <li>
              <Link to={ROUTES.PROVIDER_DASHBOARD}>Provider Dashboard</Link>
            </li>
            <li>
              <Link to={ROUTES.LOGIN}>Professional Login</Link>
            </li>
            <li>
              <span className="footer-verify-badge">
                <FaShieldAlt aria-hidden="true" /> CNIC Verified Platform
              </span>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="footer-col">
          <h4 className="footer-heading">D.I. Khan Office</h4>
          <ul className="footer-contact-list" role="list">
            <li>
              <FaMapMarkerAlt className="contact-icon" aria-hidden="true" />
              <span>Circular Road near Topanwala Gate, Dera Ismail Khan, KP, Pakistan</span>
            </li>
            <li>
              <FaPhoneAlt className="contact-icon" aria-hidden="true" />
              <span>+92 (0966) 710123 / +92 300 9876543</span>
            </li>
            <li>
              <FaEnvelope className="contact-icon" aria-hidden="true" />
              <span>support@dikhanfinder.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-container">
          <p className="footer-copyright">
            © {new Date().getFullYear()} {APP_CONFIG.appName}. All rights reserved. Built for the community of Dera Ismail Khan.
          </p>
          <div className="footer-legal-links">
            <Link to="/terms">Terms of Service</Link>
            <span aria-hidden="true">•</span>
            <Link to="/privacy">Privacy Policy</Link>
            <span aria-hidden="true">•</span>
            <Link to="/help">Help & Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
