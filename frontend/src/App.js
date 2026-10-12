import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Trade from './pages/Trade';
import StocksToWatchPage from './pages/StocksToWatchPage';
import PopularPortfolios from './pages/PopularPortfolios';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/stocks-to-watch" element={<StocksToWatchPage />} />
        <Route path="/popular-portfolios" element={<PopularPortfolios />} />
      </Routes>
    </Router>
  );
}

export default App;