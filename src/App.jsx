import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MealPlanner from './pages/MealPlanner';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MealPlanner />} />
          {/* Add more routes here as your app grows */}
          {/* Example routes for future expansion:
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;