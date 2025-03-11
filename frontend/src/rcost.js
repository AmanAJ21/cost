import React, { useEffect, useState } from 'react';
import Header from './component/header';
import Footer from './component/footer';
import './css/rcost.css';
import * as tf from '@tensorflow/tfjs'; // Import TensorFlow.js

const RCost = () => {
    const [model, setModel] = useState(null);
    const [maxValues, setMaxValues] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [result, setResult] = useState('');
    const [formData, setFormData] = useState({
        distance: '',
        length: 10,
        width: 10,
        height: 10,
        weight: 100,
    });

    // Load and train model
    useEffect(() => {
        const loadData = async (apiUrl) => {
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`Network error: ${response.statusText}`);
                return await response.json();
            } catch (error) {
                console.error('Data load error:', error);
                setErrorMessage('Error loading data. Please try again later.');
                throw error;
            }
        };

        const normalizeData = (data) => {
            const filteredData = data.filter(row =>
                Object.values(row).every(value => value !== null && value !== undefined && value !== '')
            );

            if (filteredData.length === 0) {
                throw new Error('No valid data for normalization');
            }

            const maxValues = {
                Distance: Math.max(...filteredData.map(row => row.Distance)) || 1,
                Length: Math.max(...filteredData.map(row => row.Length)) || 1,
                Width: Math.max(...filteredData.map(row => row.Width)) || 1,
                Height: Math.max(...filteredData.map(row => row.Height)) || 1,
                Weight: Math.max(...filteredData.map(row => row.Weight)) || 1,
            };

            setMaxValues(maxValues);

            return filteredData.map(row => ({
                Distance: row.Distance / maxValues.Distance,
                Length: row.Length / maxValues.Length,
                Width: row.Width / maxValues.Width,
                Height: row.Height / maxValues.Height,
                Weight: row.Weight / maxValues.Weight,
                Rate: row.Rate
            }));
        };

        const trainModel = async (data) => {
            const normalizedData = normalizeData(data);
            if (normalizedData.length === 0) throw new Error('No data available for training');

            const xs = tf.tensor2d(normalizedData.map(({ Distance, Length, Width, Height, Weight }) => [Distance, Length, Width, Height, Weight]));
            const ys = tf.tensor1d(normalizedData.map(({ Rate }) => Rate));

            const splitIndex = Math.floor(xs.shape[0] * 0.8);
            const [trainXs, testXs] = tf.split(xs, [splitIndex, xs.shape[0] - splitIndex]);
            const [trainYs, testYs] = tf.split(ys, [splitIndex, ys.shape[0] - splitIndex]);

            const newModel = tf.sequential();
            newModel.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [5] }));
            newModel.add(tf.layers.dense({ units: 32, activation: 'relu' }));
            newModel.add(tf.layers.dense({ units: 1 }));

            newModel.compile({
                loss: 'meanSquaredError',
                optimizer: tf.train.adam(0.001)
            });

            await newModel.fit(trainXs, trainYs, {
                epochs: 400,
                validationData: [testXs, testYs],
            });

            return newModel;
        };

        const initializeModel = async () => {
            try {
                const data = await loadData('http://localhost:8000/realdata');
                const trainedModel = await trainModel(data);
                setModel(trainedModel);
            } catch (error) {
                console.error('Model training failed:', error);
                setErrorMessage('Model training failed. Please try again.');
            }
        };

        initializeModel();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const fetchDistance = async (city1, city2, mode) => {
        const url = 'http://localhost:8000/getDistance';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ origin: city1, destination: city2, mode })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching distance:', error);
            setErrorMessage('Error fetching distance. Please try again later.');
            return null;
        }
    };

    const handleCalculateDistance = async (e) => {
        e.preventDefault();
        const city1 = formData.city_from.trim();
        const city2 = formData.city_to.trim();
        const mode = formData.mode || 'driving'; // Default mode is driving

        if (city1 && city2) {
            const data = await fetchDistance(city1, city2, mode);
            if (data && data.distance) {
                const caldis = parseInt(data.distance.replace(" km", "").replace(/,/g, ''));
                setFormData(prevData => ({ ...prevData, distance: caldis }));
                setResult(`Distance from ${city1} to ${city2}: ${data.distance}`);
            } else {
                setResult('Could not calculate distance. Please check the city names.');
            }
        } else {
            setResult('Please enter both city names.');
        }
    };

    const predictCost = async () => {
        if (!model) return;

        const { length, width, height, weight } = formData;
        if ([length, width, height, weight].some(val => isNaN(val))) {
            setErrorMessage('Invalid input values');
            return;
        }

        const normalizedInput = [
            formData.distance / maxValues.Distance,
            length / maxValues.Length,
            width / maxValues.Width,
            height / maxValues.Height,
            weight / maxValues.Weight
        ];

        const inputData = tf.tensor2d([normalizedInput]);
        const predictedCost = model.predict(inputData);
        let cost = predictedCost.dataSync()[0];

        if (isNaN(cost)) {
            console.log('Predicted cost is NaN. Input data:', normalizedInput);
            cost = 0;
        }
        console.log('Predicted cost:', cost);
        setResult(`Predicted Cost: ${Math.round(cost)}`);
    };

    const handleSubmitCost = (e) => {
        e.preventDefault();
        predictCost();
    };
    return (
        <div className='main'>
            <Header />
            <div className='container'> {/* Corrected class name */}
                {errorMessage && <div id="error-message">{errorMessage}</div>}
                {result && <div id="result" className="result">{result}</div>}
    
                {/* Distance Form */}
                <div id='form-container' style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                    <form id="distance-form" onSubmit={handleCalculateDistance}>
                        <section className="form-container">
                            <div className="form-group">
                                <label htmlFor="distance_city1">City 1:</label>
                                <input type="text" id="distance_city1" name="city_from" required aria-label="City 1" autoComplete="off" onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="distance_city2">City 2:</label>
                                <input type="text" id="distance_city2" name="city_to" required aria-label="City 2" autoComplete="off" onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="distance">Distance (km):</label>
                                <input type="number" id="distance" name="distance" required aria-label="Distance" value={formData.distance} readOnly />
                            </div>
                            <div className="form-group">
                                <button type="submit" id="calculate-distance">Calculate Distance</button>
                            </div>
                        </section>
                    </form>
    
                    {/* Cost Calculation Form */}
                    <form id="cost-form" onSubmit={handleSubmitCost}>
                        <section className="form-container">
                            <div className="form-group">
                                <label htmlFor="height">Height (cm):</label>
                                <input type="number" id="height" name="height" value={formData.height} required aria-label="Height" onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="length">Length (cm):</label>
                                <input type="number" id="length" name="length" value={formData.length} required aria-label="Length" onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="width">Width (cm):</label>
                                <input type="number" id="width" name="width" value={formData.width} required aria-label="Width" onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="weight">Weight (kg):</label>
                                <input type="number" id="weight" name="weight" value={formData.weight} required aria-label="Weight" onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="transport">Transport Method:</label>
                                <select id="transport" name="mode" required aria-label="Transport Method" onChange={handleChange}>
                                    <option value="Roadways">Roadways</option>
                                    <option value="Railways">Railways</option>
                                    <option value="Airways">Airways</option>
                                </select>
                            </div>
                            <div className="button-container">
                                <input type="submit" value="Calculate Cost" />
                                <input type="reset" value="Clear" />
                            </div>
                        </section>
                    </form>
                </div>
            </div>                <Footer />

        </div>
    );
};

export default RCost;