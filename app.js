#!/usr/bin/env node

// Simple interactive Node.js web app with UI
const http = require('http');
const PORT = process.env.PORT || 3000;

// HTML template with interactive elements
const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>Node.js Web UI Demo</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .container { background: #f5f5f5; padding: 20px; border-radius: 8px; }
    button { padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #45a049; }
    #result { margin-top: 20px; padding: 10px; background: white; border-radius: 4px; }
    .api-section { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Node.js Web UI Demo</h1>
    
    <h2>Interactive Demo</h2>
    <button id="greetBtn">Click Me!</button>
    <div id="result">Waiting for interaction...</div>
    
    <div class="api-section">
      <h2>API Testing</h2>
      <button id="fetchApiBtn">Test API Endpoint</button>
      <div id="apiResult"></div>
    </div>
    
    <div class="api-section">
      <h2>Send Data to Server</h2>
      <input type="text" id="nameInput" placeholder="Enter your name">
      <button id="sendDataBtn">Send to Server</button>
      <div id="serverResponse"></div>
    </div>
  </div>

  <script>
    // Client-side JavaScript
    document.getElementById('greetBtn').addEventListener('click', () => {
      document.getElementById('result').textContent = 'Hello from the browser! Button clicked at: ' + new Date().toLocaleTimeString();
    });

    document.getElementById('fetchApiBtn').addEventListener('click', async () => {
      try {
        const response = await fetch('/api/data');
        const data = await response.json();
        document.getElementById('apiResult').innerHTML = 
          '<strong>API Response:</strong> ' + data.message + '<br>' +
          '<small>Server time: ' + data.timestamp + '</small>';
      } catch (error) {
        document.getElementById('apiResult').textContent = 'Error fetching API: ' + error;
      }
    });

    document.getElementById('sendDataBtn').addEventListener('click', async () => {
      const name = document.getElementById('nameInput').value.trim();
      if (!name) {
        document.getElementById('serverResponse').textContent = 'Please enter a name';
        return;
      }

      try {
        const response = await fetch('/api/greet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        const data = await response.json();
        document.getElementById('serverResponse').textContent = data.greeting;
      } catch (error) {
        document.getElementById('serverResponse').textContent = 'Error: ' + error;
      }
    });
  </script>
</body>
</html>
`;

// Create HTTP server
const server = http.createServer((req, res) => {
  // API endpoints
  if (req.url === '/api/data' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      message: 'Hello from the Node.js server!',
      timestamp: new Date().toISOString()
    }));
  }

  if (req.url === '/api/greet' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { name } = JSON.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          greeting: `Hello, ${name}! The server received your name at ${new Date().toLocaleTimeString()}`
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // Serve HTML for all other routes
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(htmlTemplate);
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Try these endpoints in your browser:');
  console.log(`- http://localhost:${PORT}/ (Main UI)`);
  console.log(`- http://localhost:${PORT}/api/data (API endpoint)`);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => process.exit(0));
});
