import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'; // Import Routes
import Home from './home.js';
import Distance from './distance.js';
import Cost from './cost.js';
import RCost from './rcost.js';
function App() {
  return (
    <Router>
      <Routes> 
        <Route path="/" element={<Home />} />
        <Route path="/distance" element={<Distance />} />
        <Route path="/cost" element={<Cost />} />
        <Route path="/rcost" element={<RCost />} />

      </Routes>
    </Router>
  );
}

export default App;