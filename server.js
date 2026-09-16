const express = require('express');
const https = require('https');
const app = express();

app.use(express.json());

const keysEnv = process.env.RAPIDAPI_KEYS || '';
const apiKeys = keysEnv.split(',').map(k => k.trim()).filter(Boolean);

let currentKeyIndex = 0;

function getNextKey() {
    if (apiKeys.length === 0) return null;
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return key;
}

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

// Inline HTML Frontend (Prevents Not Found errors)
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RTO Vehicle Information Check</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f7f6; padding: 20px; display: flex; justify-content: center; }
            .card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%; max-width: 450px; }
            h2 { text-align: center; color: #333; margin-bottom: 20px; }
            input { width: 100%; padding: 12px; margin-bottom: 12px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; font-size: 16px; text-transform: uppercase; }
            button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; }
            button:hover { background: #0056b3; }
            #result { margin-top: 20px; background: #eef2f5; padding: 15px; border-radius: 6px; font-size: 14px; word-wrap: break-word; white-space: pre-wrap; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>RTO Vehicle Info</h2>
            <input type="text" id="vehicleNumber" placeholder="Enter Vehicle No (e.g. GJ03XX1234)">
            <button onclick="checkVehicle()">Search Details</button>
            <div id="result" style="display:none;"></div>
        </div>

        <script>
            async function checkVehicle() {
                const vehicleNumber = document.getElementById('vehicleNumber').value.trim();
                const resultDiv = document.getElementById('result');
                if(!vehicleNumber) { alert('Please enter a vehicle number'); return; }
                
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = 'Fetching details...';

                try {
                    const res = await fetch('/api/vehicle-info', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ vehicleNumber })
                    });
                    const data = await res.json();
                    resultDiv.innerHTML = JSON.stringify(data, null, 2);
                } catch(e) {
                    resultDiv.innerHTML = 'Error fetching details. Please try again.';
                }
            }
        </script>
    </body>
    </html>
    `);
});

// API Endpoint
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
