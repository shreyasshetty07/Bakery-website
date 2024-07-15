const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://shreyas-bakery:shreyas07@shreyas-ds.hgsdftc.mongodb.net/?retryWrites=true&w=majority&appName=Shreyas-DS';
const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });

let db;

client.connect((err) => {
  if (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit the process with failure
  }
  
  db = client.db('bakery-website');
  console.log('Connected to MongoDB');

  const serveFile = (res, filePath, contentType) => {
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  };

  const server = http.createServer((req, res) => {
    console.log(`Received ${req.method} request for ${req.url}`);

    if (req.method === 'GET') {
      if (req.url === '/') {
        serveFile(res, './views/index.html', 'text/html');
      } else if (req.url === '/menu') {
        serveFile(res, './views/menu.html', 'text/html');
      } else if (req.url === '/order') {
        serveFile(res, './views/order.html', 'text/html');
      } else if (req.url === '/success') {
        serveFile(res, './views/success.html', 'text/html');
      } else if (req.url.startsWith('/css/')) {
        serveFile(res, `.${req.url}`, 'text/css');
      } else if (req.url.startsWith('/js/')) {
        serveFile(res, `.${req.url}`, 'application/javascript');
      } else if (req.url.startsWith('/images/')) {
        serveFile(res, path.join(__dirname, 'public', req.url), 'image/jpeg');
      } else {
        res.writeHead(404);
        res.end('Page Not Found');
      }
    } else if (req.method === 'POST' && req.url === '/submit-order') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        console.log('Order data received:', body);
        try {
          const order = JSON.parse(body);
          db.collection('orderdata').insertOne(order, (err, result) => {
            if (err) {
              console.error('Database insertion error:', err);
              res.writeHead(500);
              res.end('Database Error');
            } else {
              console.log('Order saved:', result);
              res.writeHead(302, { Location: '/success' });
              res.end();
            }
          });
        } catch (error) {
          console.error('Error parsing order data:', error);
          res.writeHead(400);
          res.end('Bad Request');
        }
      });
    } else {
      res.writeHead(404);
      res.end('Page Not Found');
    }
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
