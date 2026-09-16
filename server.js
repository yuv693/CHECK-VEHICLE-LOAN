const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// इन-मेमोरी कैश (ताकि एक बार सर्च किया हुआ डेटा सेव रहे और API लिमिट खर्च न हो)
const vehicleCache = new Map();

// API Keys list (आपकी पुरानी या मौजूदा keys)
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

// होम पेज / UI
const htmlPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RTO Vehicle Information Portal</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f7f6; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; height: 100vh; }
        .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; }
        input { width: 90%; padding: 12px; margin: 15px 0; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; text-transform: uppercase; }
        button { background: #007bff; color: white; border: none; padding: 12px 20px; width: 100%; border-radius: 5px; font-size: 16px; cursor: pointer; }
        button:hover { background: #0056b3; }
        #result { margin-top: 20px; text-align: left; font-size: 14px; background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; }
    </style>
</head>
<body>
    <div class="card">
        <h2>Vehicle Info Portal</h2>
        <input type="text" id="vehicleNo" placeholder="Enter Vehicle No (e.g. GJ03AB1234)">
        <button onclick="fetchVehicle()">Check Details</button>
        <div id="result" style="display:none;"></div>
    </div>
    <script>
        async function fetchVehicle() {
            const vehicleNo = document.getElementById('vehicleNo').value.trim();
            const resultDiv = document.getElementById('result');
            if(!vehicleNo) { alert('Please enter vehicle number'); return; }
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = 'Fetching real data...';
            
            try {
                const res = await fetch('/fetch-vehicle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ vehicleNo })
                });
                const data = await res.json();
                if(res.ok) {
                    resultDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                } else {
                    resultDiv.innerHTML = 'Error: ' + (data.error || 'Something went wrong');
                }
            } catch (err) {
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

// Fetch API Route with Caching
app.post('/fetch-vehicle', async (req, res) => {
    try {
        const { vehicleNo } = req.body;
        if (!vehicleNo) {
            return res.status(400).json({ error: 'Vehicle number is required' });
        }

        const cleanNo = vehicleNo.toUpperCase().trim();

        // 1. Check if data is already cached (No API call needed, 0 cost!)
        if (vehicleCache.has(cleanNo)) {
            console.log(`Serving from Cache for: ${cleanNo}`);
            return res.json({ source: 'cache', data: vehicleCache.get(cleanNo) });
        }

        const keys = getApiKeys();
        if (keys.length === 0) {
            return res.status(500).json({ error: 'No RapidAPI keys configured in environment variables.' });
        }

        const apiKey = getNextKey(keys);

        // RapidAPI call for real data
        const options = {
            method: 'GET',
            url: 'https://rto-vehicle-information-verification-india.p.rapidapi.com/api/v1/rc', // Apni API ka URL yahan check kar lena
            params: { vehicle_no: cleanNo },
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'rto-vehicle-information-verification-india.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        
        // 2. Save real data to cache
        vehicleCache.set(cleanNo, response.data);

        return res.json({ source: 'api', data: response.data });

    } catch (error) {
        console.error(error.response?.data || error.message);
        return res.status(500).json({ error: error.response?.data?.message || 'Failed to fetch vehicle details' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
