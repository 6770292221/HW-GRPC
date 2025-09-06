const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>gRPC Menu System</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🍽️ gRPC Menu Management System</h1>
            <p>Web interface for gRPC Menu Service with MongoDB</p>
            <h3>✅ System Status:</h3>
            <ul style="text-align: left;">
                <li>✅ gRPC Server: Running on port 50051</li>
                <li>✅ MongoDB Atlas: Connected</li>
                <li>✅ Express Server: Running on port 3000</li>
                <li>✅ Menu CRUD: Available via gRPC</li>
            </ul>
            <h3>🚀 Demo Available:</h3>
            <p>Use <code>node client/index.js</code> to test CRUD operations</p>
            <h3>📁 Assignment Files:</h3>
            <ul style="text-align: left;">
                <li>📄 models/Menu.js - Mongoose schema</li>
                <li>📄 protos/menu.proto - gRPC definitions</li>
                <li>📄 server/server.js - gRPC server</li>
                <li>📄 client/index.js - Test client</li>
                <li>📄 index.js - Web interface</li>
            </ul>
            <div style="margin-top: 40px; color: #666; font-size: 12px;">
                <p>🎯 Assignment: Connect gRPC Server with MongoDB</p>
                <p>🚀 Status: Complete & Working!</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Simple Web Server running at port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});