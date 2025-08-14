import React from 'react';

const Home = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Welcome to Somers Classroom Newsletter Generator</h2>
      <p>Create dynamic, beautiful newsletters for your classroom!</p>
      <div style={{ marginTop: '2rem' }}>
        <a href="/login" style={{ 
          padding: '1rem 2rem', 
          backgroundColor: '#3B82F6', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '0.5rem'
        }}>
          Get Started
        </a>
      </div>
    </div>
  );
};

export default Home;
