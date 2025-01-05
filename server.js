const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// CORS middleware to allow requests from your front-end
app.use(cors());

// Initialize WhatsApp Web Client
const client = new Client();

let connectionStatus = 'disconnected';

// When the client is ready, set status to connected
client.once('ready', () => {
    console.log('Client is ready!');
    connectionStatus = 'connected';
});

// When QR code is generated, send it to the frontend
client.on('qr', (qr) => {
    // Here, you can generate the QR code in your terminal
    qrcode.generate(qr, { small: true });

    // The QR code URL will be provided to the front-end
    app.get('/qr.png', (req, res) => {
        res.setHeader('Content-Type', 'image/png');
        qrcode.toFileStream(res, qr); // Generate QR code as PNG image
    });
});

// Handle status endpoint
app.get('/status', (req, res) => {
    res.json({ status: connectionStatus });
});

// Start WhatsApp client
client.initialize();

// Start express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
