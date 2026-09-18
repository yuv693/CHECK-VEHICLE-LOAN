const express = require('express');
const axios = require('axios');
const https = require('https');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory cache & Rate Limiting tracking
const vehicleCache = new Map();
const requestTracker = new Map();

// Your API Key and correct endpoint configuration
const API_KEY = 'bab79548femsh66e05a7c56ab71bp1e6ac7jsn4a0dadaa39df';
const API_HOST = 'indian-rto-vehicle-details-mega.p.rapidapi.com';
const API_URL = 'https://indian-rto-vehicle-details-mega.p.rapidapi.com/rc_v2.php';

const htmlPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Google AdSense Verification Script -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6561716383231322" crossorigin="anonymous"></script>
    <!-- SEO Meta Tags for Google Search Visibility -->
    <title>RTO Vehicle Information & Bank Finance Status Check</title>
    <meta name="keywords" content="RTO vehicle info, vehicle RC status, check car finance, bike loan status, vehicle owner details">
    <meta name="robots" content="index, follow">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; margin: 0; padding: 20px; color: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .card { background: #1e293b; padding: 30px; border-radius: 18px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); width: 100%; max-width: 420px; box-sizing: border-box; }
        .badge { display: inline-block; background: rgba(14, 165, 233, 0.1); color: #38bdf8; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 15px; }
        h2 { margin: 10px 0 5px 0; font-size: 24px; color: #f8fafc; }
        p.subtitle { color: #94a3b8; font-size: 13px; margin-bottom: 25px; }
        input { width: 90%; padding: 14px; margin: 10px 0; background: #0f172a; border: 1px solid #475569; border-radius: 10px; color: white; font-size: 16px; outline: none; }
        input:focus { border-color: #38bdf8; }
        button { background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%); color: white; border: none; padding: 14px 20px; width: 100%; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        button:hover { opacity: 0.9; }
        #result { margin-top: 20px; text-align: left; font-size: 13px; background: #0f172a; padding: 15px; border-radius: 10px; border: 1px solid #334155; display: none; word-break: break-all; max-height: 300px; overflow-y: auto; }
        .error-box { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 12px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2); margin-top: 15px; font-size: 13px; }
        .ad-container { width: 100%; max-width: 420px; background: #1e293b; padding: 15px; border-radius: 12px; border: 1px solid #334155; margin-top: 20px; text-align: center; box-sizing: border-box; }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">⚡ RTO Live Verifier</div>
        <h2>Vehicle Status</h2>
        <p class="subtitle">Check Bank Finance, Monthly EMI & NOC</p>
        <input type="text" id="vehicleNo" placeholder="e.g. GJ25K9282">
        <button onclick="fetchVehicle()">Fetch Vehicle Info</button>
        <div id="result"></div>
    </div>

    <script>
        async function fetchVehicle() {
            const vehicleNo = document.getElementById('vehicleNo').value.trim();
            const resultDiv = document.getElementById('result');
            if (!vehicleNo) { alert('Please enter vehicle number'); return; }
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = 'Fetching vehicle details...';
            
            try {
                const res = await fetch('/fetch-vehicle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ vehicleNo })
                });
                const data = await res.json();
                if (res.ok) {
                    resultDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                } else {
                    resultDiv.innerHTML = '<div class="error-box">' + (data.error || 'Something went wrong') + '</div>';
                }
            } catch (err) {
                resultDiv.innerHTML = '<div class="error-box">Network error. Please try again.</div>';
            }
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.send(htmlPage);
});

app.post('/fetch-vehicle', async (req, res) => {
    const { vehicleNo } = req.body;
    if (!vehicleNo) {
        return res.status(400).json({ error: 'Vehicle number is required' });
    }
    
    const cleanNo = vehicleNo.trim().toUpperCase();

    if (vehicleCache.has(cleanNo)) {
        return res.json(vehicleCache.get(cleanNo));
    }

    try {
        const response = await axios({
            method: 'GET',
            url: API_URL,
            params: { registration_no: cleanNo },
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': API_HOST
            }
        });

        vehicleCache.set(cleanNo, response.data);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response?.data?.message || error.message || 'Failed to fetch details' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});
