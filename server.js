const express = require('express');
const https = require('https');
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

// Native HTTPS helper function
function makeApiRequest(apiKey, vehicleNumber) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ vehicleNumber });

        const options = {
            hostname: 'rto-vehicle-information-india.p.rapidapi.com',
            path: '/getVehicleInfo',
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-rapidapi-host': 'rto-vehicle-information-india.p.rapidapi.com',
                'x-rapidapi-key': apiKey,
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    reject(new Error(`API Error Status: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timed out'));
        });

        req.write(postData);
        req.end();
    });
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
            const data = await makeApiRequest(apiKey, vehicleNumber);
            return res.json(data);
        } catch (error) {
            console.error(`Key attempt ${attempts} failed:`, error.message);
            lastError = error;
        }
    }

    res.status(500).json({
        error: 'Unable to fetch vehicle details at the moment. All API keys exhausted or busy.',
        details: lastError?.message || 'Unknown error'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
