import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import '../css/header.css'; // Import your CSS file

function Header() {
    return (
        <header className="header">
            <div className="header-title">Cost Prediction</div>
            <nav className="header-nav">
                <ul>
                    <li><Link to="/">Home</Link></li> {/* Use Link instead of a */}
                    <li><Link to="/distance">Distance</Link></li>
                    <li><Link to="/cost">Cost</Link></li>
                    <li><Link to="/rcost">rCost</Link></li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;