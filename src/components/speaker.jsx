import React from 'react';
import '../styles/speaker.css';

const Speaker = ({ color }) => {
  return (
    <div className="speaker-container" style={{ borderColor: color }}>
      <div className="left-speaker" style={{ color, borderColor: color }}>
        <h2>0</h2>
        <p className='amp-1'>Amp</p>
      </div>
      <div className="right-speaker" style={{ color, borderColor: color }}>
        <h3>0</h3>
        <p className='amp-2'>Amp</p>
      </div>
    </div>
  );
};

export default Speaker;