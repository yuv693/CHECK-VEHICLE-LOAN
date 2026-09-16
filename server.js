const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// RapidAPI Keys Multi-Rotation Logic
const getApiKeys = () => {
    const keysEnv = process.env.RAPIDAPI_KEYS || "";
    return keysEnv.split(',').map(k => k.trim()).filter(k => k.length > 0);
};

let currentKeyIndex = 0;

function getNextKey(keys) {
    if (!keys || keys.length === 0) return null;
    const key = keys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    return key;
}

// Route for Home Page
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RTO Vehicle Information Portal</title>
    
    <!-- Google AdSense Meta Tag & Script -->
    <meta name="google-adsense-account" content="ca-pub-6561716383231322">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6561716383231322" crossorigin="anonymous"></script>

    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background: #0a0a16; color: #fff; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 20px 10px; }
        .container { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 30px 20px; width: 100%; max-width: 420px; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.5); margin-top: 20px; }
        .logo { font-size: 40px; margin-bottom: 10px; }
        .badge { background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.3); display: inline-block; margin-bottom: 15px; }
        h1 { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
        p.subtitle { font-size: 12px; color: #a0a0ab; margin-bottom: 25px; }
        input { width: 100%; padding: 15px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.15); background: rgba(0, 0, 0, 0.3); color: #fff; font-size: 16px; text-transform: uppercase; text-align: center; font-weight: 600; letter-spacing: 1px; outline: none; margin-bottom: 15px; }
        input::placeholder { color: #6b6b7b; text-transform: none; font-weight: 400; letter-spacing: normal; }
        button { width: 100%; padding: 15px; border-radius: 12px; border: none; background: linear-gradient(135deg, #00c6ff, #0072ff); color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(0, 114, 255, 0.4); }
        button:hover { opacity: 0.9; transform: translateY(-2px); }
        #result { margin-top: 20px; text-align: left; }
        .error-box { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 15px; border-radius: 12px; font-size: 13px; line-height: 1.4; text-align: center; }
        .info-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 15px; margin-top: 10px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #8f8f9d; }
        .info-val { color: #fff; font-weight: 600; text-align: right; }
        footer { margin-top: 30px; font-size: 12px; color: #6b6b7b; text-align: center; }
        footer a { color: #00c6ff; text-decoration: none; margin: 0 8px; }
        footer a:hover { text-decoration: underline; }
    </style>
</head>
<body>

    <div class="container">
        <div class="logo">🏛️</div>
        <div class="badge">🛡️ RTO Live Verifier</div>
        <h1>Vehicle Status</h1>
        <p class="subtitle">Check Bank Finance, Monthly EMI & NOC</p>
        
        <form id="vehicleForm">
            <input type="text" id="vehicleNo" placeholder="ENTER REGISTRATION NO" required>
            <button type="submit" id="submitBtn">⚡ Fetch Vehicle Info</button>
        </form>

        <div id="result"></div>
    </div>

    <footer>
        <p>© 2026 RTO Info Portal | All Rights Reserved</p>
        <p style="margin-top: 8px;">
            <a href="/privacy-policy">Privacy Policy</a> | 
            <a href="/terms">Terms of Service</a> | 
            <a href="/contact">Contact Us</a>
        </p>
    </footer>

    <script>
        document.getElementById('vehicleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const vehicleNo = document.getElementById('vehicleNo').value.trim();
            const resultDiv = document.getElementById('result');
            const submitBtn = document.getElementById('submitBtn');

            if (!vehicleNo) return;

            submitBtn.innerText = 'Searching...';
            submitBtn.disabled = true;
            resultDiv.innerHTML = '';

            try {
                const res = await fetch('/fetch-vehicle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ vehicleNo })
                });

                const data = await res.json();

                if (res.status !== 200) {
                    resultDiv.innerHTML = '<div class="error-box">' + (data.message || 'Error fetching details.') + '</div>';
                } else {
                    const info = data.data || {};
                    resultDiv.innerHTML = \`
                        <div class="info-card">
                            <div class="info-row"><span class="info-label">Reg No:</span><span class="info-val">\${info.registration_number || vehicleNo}</span></div>
                            <div class="info-row"><span class="info-label">Owner Name:</span><span class="info-val">\${info.owner_name || 'N/A'}</span></div>
                            <div class="info-row"><span class="info-label">Maker / Model:</span><span class="info-val">\${info.maker_model || 'N/A'}</span></div>
                            <div class="info-row"><span class="info-label">Financed / Bank:</span><span class="info-val">\${info.financer || 'No Finance / Clear'}</span></div>
                            <div class="info-row"><span class="info-label">Insurance Upto:</span><span class="info-val">\${info.insurance_upto || 'N/A'}</span></div>
                        </div>
                    \`;
                }
            } catch (err) {
                resultDiv.innerHTML = '<div class="error-box">Server error. Please try again.</div>';
            } finally {
                submitBtn.innerText = '⚡ Fetch Vehicle Info';
                submitBtn.disabled = false;
            }
        });
    </script>
</body>
</html>`);
});

// Legal Pages
app.get('/privacy-policy', (req, res) => {
    res.send("<h1>Privacy Policy</h1><p>We respect your privacy. This portal provides public vehicle registration details using third-party APIs and displays Google AdSense advertisements.</p><a href='/'>Back to Home</a>");
});

app.get('/terms', (req, res) => {
    res.send("<h1>Terms of Service</h1><p>This tool is for informational purposes only. Information is fetched from official available API sources.</p><a href='/'>Back to Home</a>");
});

app.get('/contact', (req, res) => {
    res.send("<h1>Contact Us</h1><p>For support or feedback, please contact: malekyunus44@gmail.com</p><a href='/'>Back to Home</a>");
});

// API Fetch Endpoint
app.post('/fetch-vehicle', async (req, res) => {
    const { vehicleNo } = req.body;
    const keys = getApiKeys();

    if (keys.length === 0) {
        return res.status(500).json({ message: "No RapidAPI keys configured in Render environment variables." });
    }

    let attempts = 0;
    let success = false;

    while (attempts < keys.length && !success) {
        const apiKey = getNextKey(keys);
        try {
            const response = await axios.get('https://rto-vehicle-information-verification-india.p.rapidapi.com/api/v1/rc/vehicleinfo', {
                headers: {
                    'x-rapidapi-key': apiKey,
                    'x-rapidapi-host': 'rto-vehicle-information-verification-india.p.rapidapi.com',
                    'Content-Type': 'application/json'
                },
                params: { reg_no: vehicleNo }
            });

            if (response.data) {
                success = true;
                return res.status(200).json({ data: response.data });
            }
        } catch (error) {
            attempts++;
        }
    }

    return res.status(429).json({ 
        message: "Monthly free quota exhausted for current API Key. Please add fresh keys in Render." 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
