import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Results from './pages/Results';
import Recommendations from './pages/Recommendations';
import HealthBot from './pages/HealthBot';
import Resources from './pages/Resources';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App gradient-mesh">
        <Navigation />
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/results/:diseaseType" element={<Results />} />
          <Route path="/recommendations/:disease" element={<Recommendations />} />
          <Route path="/health-bot" element={<HealthBot />} />
          <Route path="/resources" element={<Resources />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;