const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

app.post('/api/check-vehicle', async (req, res) => {
  try {
    const { vehicle_no } = req.body;
    
    const response = await fetch("https://rto-vehicle-information-india.p.rapidapi.com/getVehicleChallan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": "rto-vehicle-information-india.p.rapidapi.com",
        "x-rapidapi-key": "9e90b931e9mshbXXXXXXXXXXXXXXXXXXXXX"

      },
      body: JSON.stringify({
        vehicle_no: vehicle_no,
        consent: "Y",
        consent_text: "I hereby give my consent"
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
