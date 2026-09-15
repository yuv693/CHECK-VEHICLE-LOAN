const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const API_KEY = process.env.RAPIDAPI_KEY;
const API_HOST = "rto-vehicle-information-india.p.rapidapi.com";

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running ✅' });
});

// Vehicle check endpoint
app.post('/api/check-vehicle', async (req, res) => {
    try {
        const { vehicle_no, consent, consent_text } = req.body;

        // Validate input
        if (!vehicle_no) {
            return res.status(400).json({ error: 'Vehicle number is required' });
        }

        if (!API_KEY) {
            console.error('❌ RAPIDAPI_KEY not found in environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Call RapidAPI
        const response = await fetch(`https://${API_HOST}/getVehicleChallan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': API_HOST,
                'x-rapidapi-key': API_KEY
            },
            body: JSON.stringify({
                vehicle_no: vehicle_no.toUpperCase(),
                consent: consent || 'Y',
                consent_text: consent_text || 'I hereby give my consent for the API to fetch my information'
            })
        });

        if (!response.ok) {
            console.error(`❌ RapidAPI Error: ${response.status}`);
            return res.status(response.status).json({ 
                error: `API Error: ${response.status}`,
                details: 'कृपया गाड़ी नंबर सत्यापित करें या बाद में पुनः प्रयास करें।'
            });
        }

        const data = await response.json();
        
        // Return the data to frontend
        res.json(data);

    } catch (error) {
        console.error('❌ Server Error:', error.message);
        res.status(500).json({ 
            error: 'Internal server error',
            details: 'डेटा लोड करने में समस्या आई। कृपया बाद में पुनः प्रयास करें।'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Unhandled Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`✅ API Key: ${API_KEY ? 'Loaded from .env' : '❌ NOT FOUND'}`);
});
