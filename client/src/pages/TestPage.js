import React from 'react';

const TestPage = () => {
  return (
    <div style={{ padding: '20px', background: 'lightblue' }}>
      <h1 style={{ color: 'black', fontSize: '24px' }}>TEST PAGE</h1>
      <p style={{ color: 'black' }}>This should render normally with inline styles.</p>
      <div style={{ 
        width: '100px', 
        height: '100px', 
        background: 'red',
        margin: '20px 0'
      }}>
        Red Box
      </div>
      <button style={{
        padding: '10px 20px',
        background: 'green',
        color: 'white',
        border: 'none',
        borderRadius: '5px'
      }}>
        Test Button
      </button>
    </div>
  );
};

export default TestPage;
