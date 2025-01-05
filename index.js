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

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// When the client is ready
client.once('ready', () => {
    console.log('Client is ready!');
});

// When the client receives a QR Code
client.on('qr', (qr) => {
    // Generate the QR code and save it as a static image
    qrcode.toFile(path.join(__dirname, 'public', 'qr.png'), qr, (err) => {
        if (err) {
            console.error('Error generating QR code:', err);
        } else {
            console.log('QR code saved as qr.png');
        }
    });
});

client.on('message_create', async (message) => {
    if (message.body.toString().toLowerCase().startsWith('ping,')) {
        // Generate a response from Google AI
        const result = await model.generateContent(message.body);
        console.log(result.response.text());
        client.sendMessage(message.from, result.response.text()); // send response to WhatsApp
    }
});

// Start the client and server
client.initialize();
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
