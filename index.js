const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
});

// Create a new client instance
const client = new Client();

// Create an Express server
const app = express();
const port = 3000;

// Serve static files (including QR code image)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html page (if needed, but it's mainly for your backend)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the QR code image
app.get('/qr.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'qr.png'));
});

// Check the status of the WhatsApp client (used by the front-end)
app.get('/status', (req, res) => {
    res.json({ status: client.ping() ? 'connected' : 'disconnected' });
});

// When the client is ready
client.once('ready', () => {
    console.log('Client is ready!');
});

// When the client receives a QR code
client.on('qr', (qr) => {
    // Generate the QR code and save it as a static image in the public folder
    qrcode.toFile(path.join(__dirname, 'public', 'qr.png'), qr, (err) => {
        if (err) {
            console.error('Error generating QR code:', err);
        } else {
            console.log('QR code saved as qr.png');
        }
    });
});

// When a message is created (not used here, but part of your logic)
client.on('message_create', async (message) => {
    if (message.body.toString().toLowerCase().startsWith('ping,')) {
        const result = await model.generateContent(message.body);
        console.log(result.response.text());
        client.sendMessage(message.from, result.response.text()); // send response to WhatsApp
    }
});

// Start the WhatsApp client and the server
client.initialize();
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
