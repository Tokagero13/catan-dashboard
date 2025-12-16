import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Generator from './pages/Generator';
import Leaderboard from './pages/Leaderboard';
import Groups from './pages/Groups';
import Achievements from './pages/Achievements';
import Rules from './pages/Rules';
import Strategies from './pages/Strategies';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generator" element={<Generator />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/strategies" element={<Strategies />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;