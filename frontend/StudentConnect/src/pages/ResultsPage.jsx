import React from 'react';
import MatchCard from '../components/MatchCard';
import { mockMatches } from '../mockData';
import './ResultsPage.css'; 

const ResultsPage = () => {
  return (
    <div 
      className="results-container" 
    >
      <h1 className="page-title">Your Top Matches</h1>
      
      <div className="cards-grid">
        {mockMatches.map((student) => (
          <MatchCard key={student.id} studentData={student} />
        ))}
      </div>
    </div>
  );
};

export default ResultsPage;