const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory cache to save API requests and cost
const vehicleCache = new Map();

// API Keys configuration
const getApiKeys = () => {
    const keysEnv = process.env.RAPIDAPI_KEYS || process.env.RAPIDAPI_KEY || '';
    return keysEnv.split(',').map(k => k.trim()).filter(Boolean);
};

let currentKeyIndex = 0;
function getNextKey(keys) {
    if (keys.length === 0) return null;
    const key = keys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    return key;
}

// Your original beautiful UI design with Google Ads integration
const htmlPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vehicle Status - Check Bank Finance & EMI</title>
    
    <!-- Google Adsense Script (Yahan aapka AdSense tag ya script hai) -->
    <!-- <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_CLIENT_ID" crossorigin="anonymous"></script> -->

    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; color: #fff; flex-direction: column; }
        .card { background: #1e293b; padding: 30px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); width: 100%; max-width: 420px; text-align: center; border: 1px solid #334155; margin-bottom: 20px; }
        .badge { display: inline-block; background: rgba(16, 185, 129, 0.1); color: #34d399; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 15px; border: 1px solid rgba(16, 185, 129, 0.2); }
        h2 { margin: 10px 0 5px 0; font-size: 24px; color: #f8fafc; }
        p.subtitle { color: #94a3b8; font-size: 13px; margin-bottom: 25px; }
        input { width: 90%; padding: 14px; margin: 10px 0 20px 0; background: #0f172a; border: 1px solid #475569; border-radius: 10px; font-size: 16px; color: #fff; text-transform: uppercase; text-align: center; font-weight: bold; letter-spacing: 1px; }
        input:focus { outline: none; border-color: #3b82f6; }
        button { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 14px 20px; width: 100%; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        button:hover { opacity: 0.9; }
        #result { margin-top: 20px; text-align: left; font-size: 13px; background: #0f172a; padding: 15px; border-radius: 10px; border: 1px solid #334155; max-height: 300px; overflow-y: auto; color: #e2e8f0; }
        .error-box { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); padding: 12px; border-radius: 10px; margin-top: 20px; font-size: 14px; }
        .ad-container { width: 100%; max-width: 420px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 10px; text-align: center; }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">🛡️ RTO Live Verifier</div>
        <h2>Vehicle Status</h2>
        <p class="subtitle">Check Bank Finance, Monthly EMI & NOC</p>
        <input type="text" id="vehicleNo" placeholder="GJ25K9202">
        <button onclick="fetchVehicle()">⚡ Fetch Vehicle Info</button>
        <div id="result" style="display:none;"></div>
    </div>

    <!-- Google Ad Space Area -->
    <div class="ad-container">
        <!-- Yahan aap apna Google Adsense ka <ins> tag laga sakte hain -->
        <p style="color: #64748b; font-size: 12px; margin: 5px;">Advertisement Space</p>
    </div>

    <script>
        async function fetchVehicle() {
            const vehicleNo = document.getElementById('vehicleNo').value.trim();
            const resultDiv = document.getElementById('result');
            if(!vehicleNo) { alert('Please enter vehicle number'); return; }
            resultDiv.style.display = 'block';
            resultDiv.className = '';
            resultDiv.innerHTML = 'Fetching vehicle details...';
            
            try {
                const res = await fetch('/fetch-vehicle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ vehicleNo })
                });
                const data = await res.json();
                if(res.ok) {
                    resultDiv.innerHTML = '<pre>' + JSON.stringify(data.data || data, null, 2) + '</pre>';
                } else {
                    resultDiv.className = 'error-box';
                    resultDiv.innerHTML = data.error || 'Monthly free quota exhausted for current API Key.';
                }
            } catch (err) {
                resultDiv.className = 'error-box';
                resultDiv.innerHTML = 'Network Error: ' + err.message;
            }
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.send(htmlPage);
});

// Fetch API Route with Memory Caching
app.post('/fetch-vehicle', async (req, res) => {
    try {
        const { vehicleNo } = req.body;
        if (!vehicleNo) {
            return res.status(400).json({ error: 'Vehicle number is required' });
        }

        const cleanNo = vehicleNo.toUpperCase().trim();

        // 1. Check if result is already in cache (0 API cost!)
        if (vehicleCache.has(cleanNo)) {
            console.log(`Serving from Cache for: ${cleanNo}`);
            return res.json({ source: 'cache', data: vehicleCache.get(cleanNo) });
        }

        const keys = getApiKeys();
        if (keys.length === 0) {
            return res.status(500).json({ error: 'No RapidAPI keys configured in environment variables.' });
        }

        const apiKey = getNextKey(keys);

        const options = {
            method: 'GET',
            url: 'https://rto-vehicle-information-verification-india.p.rapidapi.com/api/v1/rc',
            params: { vehicle_no: cleanNo },
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'rto-vehicle-information-verification-india.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        
        // 2. Save successful result to cache
        vehicleCache.set(cleanNo, response.data);

        return res.json({ source: 'api', data: response.data });

    } catch (error) {
        console.error(error.response?.data || error.message);
        return res.status(500).json({ error: error.response?.data?.message || 'Monthly free quota exhausted for current API Key.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
