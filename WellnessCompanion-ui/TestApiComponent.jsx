import React, { useState } from 'react';

const TestApiComponent = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const testAdvisorApi = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetch('http://localhost:5000/api/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'I just got a promotion at work!',
          emotion: 'happy',
          advisorPerspective: 'friend',
          intensity: 4
        }),
      });
      
      if (!result.ok) {
        throw new Error(`API error: ${result.status}`);
      }
      
      const data = await result.json();
      setResponse(data.response || 'No response data');
    } catch (err) {
      console.error('Error testing API:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h2>API Test Component</h2>
      <button 
        onClick={testAdvisorApi} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: 16,
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Loading...' : 'Test API'}
      </button>
      
      {error && (
        <div style={{ marginTop: 20, padding: 15, backgroundColor: '#fee', border: '1px solid #f99', borderRadius: 4 }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {response && (
        <div style={{ marginTop: 20, padding: 15, backgroundColor: '#efe', border: '1px solid #9f9', borderRadius: 4 }}>
          <strong>Response:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>{response}</pre>
        </div>
      )}
    </div>
  );
};

export default TestApiComponent; 