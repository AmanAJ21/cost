import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import '../css/footer.css'; // Import your CSS file

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-copyright">&copy; 2024 Company. All rights reserved.</div>
                <nav className="footer-nav">
                    <ul>
                        <li><Link to="/">Home</Link></li> {/* Use Link instead of a */}
                        <li><Link to="/about">About</Link></li> {/* Update href to to */}
                        <li><Link to="/contact">Contact</Link></li>
                        <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                    </ul>
                </nav>
            </div>
        </footer>
    );
}

export default Footer;