import React, { useState, useEffect } from 'react';
import Header from './component/header';
import Footer from './component/footer';
import * as tf from '@tensorflow/tfjs'; // Import TensorFlow.js
import './css/cost.css';

const MAX_HEIGHT = 17;
const MAX_WIDTH = 6;
const MAX_WEIGHT = 4128;

function Cost() {
    const [model, setModel] = useState(null);
    const [cityFrom, setCityFrom] = useState('Pune');
    const [cityTo, setCityTo] = useState('Delhi');
    const [height, setHeight] = useState(17);
    const [width, setWidth] = useState(6);
    const [weight, setWeight] = useState(4128);
    const [material, setMaterial] = useState('Brass');
    const [transportMethod, setTransportMethod] = useState('Airways');
    const [predictedCost, setPredictedCost] = useState(null);
    const [error, setError] = useState('');
    const [isModelTrained, setIsModelTrained] = useState(false);

    useEffect(() => {
        const loadDataAndTrainModel = async () => {
            try {
                console.log('Loading data...');
                const data = await loadData('http://localhost:8000/testdata');
                console.log('Data loaded:', data);

                console.log('Training model...');
                const trainedModel = await trainModel(data);
                console.log('Model trained:', trainedModel);

                setModel(trainedModel);
                setIsModelTrained(true);
            } catch (error) {
                console.error('Error loading data or training model:', error);
                setError('Error loading data or training model. Please try again later.');
            }
        };

        loadDataAndTrainModel();
    }, []);

    const loadData = async (apiUrl) => {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Network error: ${response.statusText}`);
        return await response.json();
    };

    const normalizeData = (data) => {
        data = data.filter(row => row.Height !== undefined && row.Width !== undefined && row.Weight !== undefined && row.Cost !== undefined);
        if (data.length === 0) throw new Error('No valid data for normalization');

        const maxValues = {
            Height: Math.max(...data.map(row => row.Height)) || 1,
            Width: Math.max(...data.map(row => row.Width)) || 1,
            Weight: Math.max(...data.map(row => row.Weight)) || 1,
        };

        return data.map(row => ({
            Height: row.Height / maxValues.Height,
            Width: row.Width / maxValues.Width,
            Weight: row.Weight / maxValues.Weight,
            Cost: row.Cost
        }));
    };

    const trainModel = async (data) => {
        const normalizedData = normalizeData(data);
        if (normalizedData.length === 0) throw new Error('No data available for training');

        const xs = normalizedData.map(({ Height, Width, Weight }) => [Height, Width, Weight]);
        const ys = normalizedData.map(({ Cost }) => Cost);
        const xsTensor = tf.tensor2d(xs);
        const ysTensor = tf.tensor1d(ys);

        const [trainXs, testXs] = tf.split(xsTensor, [Math.floor(xs.length * 0.8), xs.length - Math.floor(xs.length * 0.8)]);
        const [trainYs, testYs] = tf.split(ysTensor, [Math.floor(ys.length * 0.8), ys.length - Math.floor(ys.length * 0.8)]);

        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 1, inputShape: [3] }));
        model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

        await model.fit(trainXs, trainYs, { epochs: 100 });
        return model;
    };

    const predictCost = async (model, height, width, weight) => {
        if (isNaN(height) || isNaN(width) || isNaN(weight)) throw new Error('Invalid input values');

        const normalizedInput = [
            height / MAX_HEIGHT,
            width / MAX_WIDTH,
            weight / MAX_WEIGHT
        ];

        const inputData = tf.tensor2d([normalizedInput]);
        const predictedCost = model.predict(inputData);
        const cost = predictedCost.dataSync()[0];

        if (isNaN(cost)) throw new Error('Predicted cost is NaN');
        return Math.round(cost / 100) * 100;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (!model) {
                throw new Error('Model is not trained yet.');
            }

            const predictedCost = await predictCost(model, height, width, weight);
            console.log('Predicted Cost:', predictedCost); // Log the predicted cost for debugging
            alert("Predicted Cost:"+predictedCost);
        } catch (error) {
            console.error('Error during cost prediction:', error); // Log the specific error
            setError('An error occurred during cost prediction. Please try again.');
        }
    };

    return (
        <div className='main'>
            <Header />
            <div className="page-container">
                {error && <div id="error-message" style={{ color: 'red' }}>{error}</div>}
                <div id="costResult" className="cost-result">
                    {predictedCost && <p>Predicted Cost: {predictedCost}</p>}
                </div>
                <form id="costCalculationForm" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="cityFrom">City 1:</label>
                            <input type="text" id="cityFrom" value={cityFrom} onChange={(e) => setCityFrom(e.target.value)} required aria-label="City 1" autoComplete="off" />
                            <label htmlFor="itemHeight">Height (cm):</label>
                            <input type="number" id="itemHeight" value={height} onChange={(e) => setHeight(e.target.value)} required aria-label="Height" />
                            <label htmlFor="itemMaterial">Material Type:</label>
                            <select id="itemMaterial" value={material} onChange={(e) => setMaterial(e.target.value)} required aria-label="Material Type">
                                <option value="Brass">Brass</option>
                                <option value="Clay">Clay</option>
                                <option value="Aluminium">Aluminium</option>
                                <option value="Wood">Wood</option>
                                <option value="Bronze">Bronze</option>
                                <option value="Stone">Stone</option>
                                <option value="Marble">Marble</option>
                            </select>
                            <label htmlFor="itemWidth">Width (cm):</label>
                            <input type="number" id="itemWidth" value={width} onChange={(e) => setWidth(e.target.value)} required aria-label="Width" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cityTo">City 2:</label>
                            <input type="text" id="cityTo" value={cityTo} onChange={(e) => setCityTo(e.target.value)} required aria-label="City 2" autoComplete="off" />
                            <label htmlFor="itemWeight">Weight (kg):</label>
                            <input type="number" id="itemWeight" value={weight} onChange={(e) => setWeight(e.target.value)} required aria-label="Weight" />
                            <label htmlFor="transportMethod">Transport Method:</label>
                            <select id="transportMethod" value={transportMethod} onChange={(e) => setTransportMethod(e.target.value)} required aria-label="Transport Method">
                                <option value="Airways">Airways</option>
                                <option value="Roadways">Roadways</option>
                            </select>
                        </div>
                    </div>
                    <div className="button-group">
                        <input type="submit" value="Calculate Cost" className={`calculate-button ${isModelTrained ? 'trained' : ''}`} disabled={!isModelTrained} />
                        <input type="reset" value="Clear" className="clear-button" />
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}

export default Cost;
