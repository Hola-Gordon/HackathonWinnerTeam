// Simple script to test direct API calls with fetch
// Run this in the browser console or as a separate script

// Test advisor perspective with friend
async function testAdvisorPerspective() {
  console.log('Testing advisor perspective with friend...');
  
  try {
    const response = await fetch('http://localhost:5000/api/respond', {
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
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Response from advisor call:', data);
    return data;
  } catch (error) {
    console.error('Error testing advisor perspective:', error);
  }
}

// Test recipient sharing with friend
async function testRecipientSharing() {
  console.log('Testing recipient sharing with friend...');
  
  try {
    const response = await fetch('http://localhost:5000/api/respond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'I just got a promotion at work!',
        emotion: 'happy',
        recipient: 'friend',
        intensity: 4
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Response from recipient call:', data);
    return data;
  } catch (error) {
    console.error('Error testing recipient sharing:', error);
  }
}

// Run the tests and print results
async function runTests() {
  console.log('----- API TEST RESULTS -----');
  
  const advisorResult = await testAdvisorPerspective();
  console.log('\nAdvisor Response:', advisorResult?.response || 'No response');
  
  const recipientResult = await testRecipientSharing();
  console.log('\nRecipient Response:', recipientResult?.response || 'No response');
  
  console.log('----- TEST COMPLETE -----');
}

// Execute the tests
runTests(); 