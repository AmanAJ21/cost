import React from 'react';
import './css/home.css'; // Import your CSS file
import Header from './component/header'
import Footer from './component/footer'
function Home() {
    return (
        <div>
            <Header />

            <main>
                <h2>Welcome to the Application</h2>
                <p>This is a simple Node.js application demonstrating how to structure your HTML and CSS.</p>
            </main>
            <Footer />
        </div>
    );
}

export default Home;