import React, { useState } from 'react';
import './css/distance.css'; // Import your CSS file
import Header from './component/header';
import Footer from './component/footer';
function Distance() {
    const [cityA, setCityA] = useState('');
    const [cityB, setCityB] = useState('');
    const [mode, setMode] = useState('driving');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        const url = 'http://localhost:8000/getDistance'; // URL to your server's endpoint

        console.log(`Requesting distance from ${cityA} to ${cityB} with mode ${mode}`); // Log the request

        try {
            const response = await fetch(url, {
                method: 'POST', // Use POST method as defined in your server
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ // Send data in JSON format
                    origin: cityA,
                    destination: cityB,
                    mode: mode
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data); // Log the entire response data (should be JSON)

            if (data.distance) {
                setResult(`Distance from ${cityA} to ${cityB}: ${data.distance}`);
                setError(''); // Clear any previous errors
            } else {
                throw new Error('Distance not found in response');
            }
        } catch (error) {
            console.error('Error fetching distance:', error);
            setError('Error fetching distance. Please try again.'); // Set error message
            setResult(''); // Clear distance on error
        }
    };

    return (<div className="main">
        <Header />
        <main className="container">
            <p id="result">{result}</p>
            <p id="error" className="error">{error}</p>
            <form id="distanceForm" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="cityA">Origin City:</label>
                    <input
                        type="text"
                        id="cityA"
                        name="cityA"
                        required
                        aria-label="Origin City"
                        value={cityA}
                        onChange={(e) => setCityA(e.target.value)} // Update state on input change
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="cityB">Destination City:</label>
                    <input
                        type="text"
                        id="cityB"
                        name="cityB"
                        required
                        aria-label="Destination City"
                        value={cityB}
                        onChange={(e) => setCityB(e.target.value)} // Update state on input change
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="mode">Mode of Transportation:</label>
                    <select
                        id="mode"
                        name="mode"
                        required
                        aria-label="Mode of Transportation"
                        value={mode}
                        onChange={(e) => setMode(e.target.value)} // Update state on select change
                    >
                        <option value="driving">Driving</option>
                        <option value="walking">Walking</option>
                        <option value="bicycling">Bicycling</option>
                        <option value="transit">Transit</option>
                    </select>
                </div>

                <div className="button-container">
                    <button type="submit">Calculate Distance</button>
                    <button type="reset" onClick={() => { setCityA(''); setCityB(''); setResult(''); setError(''); }}>Clear</button>
                </div>
            </form>
        </main>
        <Footer />
    </div>
    );
}

export default Distance;