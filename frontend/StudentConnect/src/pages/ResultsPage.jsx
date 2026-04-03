import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultsPage.css';

const ResultsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="results-container">
      <h1 className="page-title">Your Top Matches</h1>
      <p style={{ color: '#777', marginBottom: 24 }}>
        Matches are now available in the dashboard. Head to your dashboard to see your recommendations.
      </p>
      <button
        className="lp-btn lp-btn--primary"
        onClick={() => navigate('/dashboard')}
        style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #d44332, #ff6b5a)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
      >
        Go to Dashboard →
      </button>
    </div>
  );
};

export default ResultsPage;