import React from 'react';
import './MatchCard.css'; 

const MatchCard = ({ studentData }) => {
  const { name, major, year, matchPercentage, interests, avatarUrl } = studentData;

  const tagColors = [
    "#E3F2FD", 
    "#E8F5E9", 
    "#FFFDE7",
    "#FCE4EC" 
  ];

  return (
    <div className="match-card">

      <img src={avatarUrl} alt={`${name}'s avatar`} className="avatar" />
      <div className="user-info">
        <h2 className="name">{name}</h2>
        <p className="major">{major}, {year}</p>
      </div>

      <div className="match-badge">
        {matchPercentage}% Match
      </div>

      <div className="interests-section">
        <p className="interests-title">Shared Interests</p>
        <div className="tags-container">
        
          {interests.map((interest, index) => {
          
            const randomIndex = Math.floor(Math.random() * tagColors.length);
            
            const randomBgColor = tagColors[randomIndex];

            return (
              <span 
                key={index} 
                className="interest-tag"
                
                style={{ backgroundColor: randomBgColor }}
              >
                {interest}
              </span>
            );
          })}
        </div>
      </div>

      <button className="say-hi-btn">
        SAY HI 👋
      </button>
    </div>
  );
};

export default MatchCard;