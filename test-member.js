fetch('http://localhost:3000/api/members', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser123',
    password: 'password123',
    name: 'Test Member',
    email: 'test@example.com',
    phone: '1234567890'
  })
}).then(res => res.json().then(data => console.log('Status:', res.status, 'Data:', data)))
  .catch(err => console.error('Fetch error:', err));
