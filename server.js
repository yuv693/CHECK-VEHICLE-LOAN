const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const keysEnv = process.env.RAPIDAPI_KEYS || '';
const apiKeys = keysEnv.split(',').map(k => k.trim()).filter(Boolean);

let currentKeyIndex = 0;

function getNextKey() {
    if (apiKeys.length === 0) return null;
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return key;
}

app.post('/api/vehicle-info', async (req, res) => {
    const { vehicleNumber } = req.body;

    if (!vehicleNumber) {
        return res.status(400).json({ error: 'Vehicle number is required' });
    }

    if (apiKeys.length === 0) {
        return res.status(500).json({ error: 'No RapidAPI keys configured on server.' });
    }

    let attempts = 0;
    let success = false;
    let lastError = null;

    while (attempts < apiKeys.length && !success) {
        const apiKey = getNextKey();
        attempts++;

        try {
            const response = await axios.post(
                'https://rto-vehicle-information-india.p.rapidapi.com/getVehicleInfo',
                { vehicleNumber },
                {
                    headers: {
                        'content-type': 'application/json',
                        'x-rapidapi-host': 'rto-vehicle-information-india.p.rapidapi.com',
                        'x-rapidapi-key': apiKey
                    },
                    timeout: 10000
                }
            );

            return res.json(response.data);
        } catch (error) {
            console.error(`Key attempt ${attempts} failed:`, error.response?.data || error.message);
            lastError = error;
        }
    }

    res.status(500).json({
        error: 'Unable to fetch vehicle details at the moment. All API keys exhausted or busy.',
        details: lastError?.response?.data || lastError?.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
