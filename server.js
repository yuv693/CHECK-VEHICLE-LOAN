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

// Complete Dark UI Embedded directly
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RTO Information Portal</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { background: linear-gradient(135deg, #0f0c20 0%, #15102a 50%, #060212 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; color: #fff; }
            .card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 30px 24px; width: 100%; max-width: 420px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            .icon-box { font-size: 40px; margin-bottom: 10px; color: #38ef7d; }
            .badge { display: inline-block; background: rgba(56, 239, 125, 0.15); color: #38ef7d; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; margin-bottom: 15px; border: 1px solid rgba(56, 239, 125, 0.3); }
            h2 { font-size: 26px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.5px; }
            p.sub { color: #8a8d9b; font-size: 13px; margin-bottom: 25px; }
            input { width: 100%; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 14px; color: #fff; font-size: 16px; font-weight: 600; text-transform: uppercase; text-align: center; margin-bottom: 16px; outline: none; transition: 0.3s; }
            input:focus { border-color: #11998e; box-shadow: 0 0 10px rgba(17, 153, 142, 0.3); }
            button { width: 100%; background: linear-gradient(90deg, #11998e, #38ef7d); border: none; border-radius: 12px; padding: 14px; color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; transition: 0.3s; box-shadow: 0 8px 20px rgba(56, 239, 125, 0.25); }
            button:active { transform: scale(0.98); }
            .result-area { margin-top: 20px; text-align: left; background: rgba(0,0,0,0.4); border-radius: 12px; padding: 15px; border: 1px solid rgba(255,255,255,0.08); display: none; max-height: 250px; overflow-y: auto; }
            .info-row { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 8px 0; font-size: 13px; }
            .info-row:last-child { border-bottom: none; }
            .key { color: #8a8d9b; font-weight: 500; }
            .val { color: #fff; font-weight: 600; }
            .error-box { background: rgba(255, 75, 75, 0.15); color: #ff6b6b; padding: 12px; border-radius: 8px; font-size: 13px; border: 1px solid rgba(255, 75, 75, 0.3); text-align: center; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon-box">🏛️</div>
            <div class="badge">🛡️ RTO Live Verifier</div>
            <h2>Vehicle Status</h2>
            <p class="sub">Check Bank Finance, Monthly EMI & NOC</p>

            <input type="text" id="vehicleNumber" placeholder="ENTER REGISTRATION NO">
            <button onclick="checkVehicle()">⚡ Fetch Vehicle Info</button>

            <div id="result" class="result-area"></div>
        </div>

        <script>
            async function checkVehicle() {
                const vehicleNumber = document.getElementById('vehicleNumber').value.trim();
                const resultDiv = document.getElementById('result');
                if(!vehicleNumber) { alert('Please enter registration number'); return; }

                resultDiv.style.display = 'block';
                resultDiv.innerHTML = '<p style="text-align:center; color:#8a8d9b;">Fetching info...</p>';

                try {
                    const res = await fetch('/api/vehicle-info', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ vehicleNumber })
                    });
                    const data = await res.json();

                    if(data.error || data.status === false) {
                        resultDiv.innerHTML = \`<div class="error-box">\${data.error || data.message || 'Vehicle details not found.'}</div>\`;
                        return;
                    }

                    let html = '';
                    const details = data.result || data;
                    for (const [key, value] of Object.entries(details)) {
                        if (typeof value !== 'object' && value) {
                            const formattedKey = key.replace(/_/g, ' ').toUpperCase();
                            html += \`<div class="info-row"><span class="key">\${formattedKey}</span><span class="val">\${value}</span></div>\`;
                        }
                    }
                    resultDiv.innerHTML = html || '<div class="error-box">No data found</div>';

                } catch(e) {
                    resultDiv.innerHTML = '<div class="error-box">Error connecting to server.</div>';
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
        error: 'Monthly free quota exhausted for current API Key. Please add fresh keys in Render.',
        details: lastError?.message || 'Unknown error'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
