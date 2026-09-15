# Check Vehicle Loan 🚗

गाड़ी के लोन की स्थिति सुरक्षित रूप से जांचें | Securely check vehicle loan status

## Features ✨

- 🔍 तुरंत गाड़ी का लोन स्टेटस जांचें
- 🔒 सुरक्षित API Key हैंडलिंग (Backend से)
- 🎨 User-friendly Hindi/English Interface
- 📱 Mobile Responsive Design
- ⚡ Fast & Reliable

## Setup 🚀

### Prerequisites
- Node.js (v14+)
- npm या yarn
- RapidAPI Account + API Key

### Installation

1. **Repository को clone करें:**
```bash
git clone https://github.com/yuv693/CHECK-VEHICLE-LOAN.git
cd CHECK-VEHICLE-LOAN
```

2. **Dependencies install करें:**
```bash
npm install
```

3. **`.env` फाइल बनाएं:**
```bash
cp .env.example .env
```

4. **अपनी RapidAPI Key जोड़ें:**
```
RAPIDAPI_KEY=your_actual_key_here
```

5. **Server को run करें:**
```bash
npm start
```

6. **Browser में खोलें:**
```
http://localhost:3000
```

## How to Get RapidAPI Key? 🔑

1. [RapidAPI.com](https://rapidapi.com) पर जाएं
2. Sign up करें या login करें
3. "rto-vehicle-information-india" API को search करें
4. Subscribe करें (Free plan available)
5. API Key को `.env` फाइल में paste करें

## File Structure 📁

```
CHECK-VEHICLE-LOAN/
├── index.html          # Frontend (Hindi UI)
├── server.js           # Backend (Express.js)
├── package.json        # Dependencies
├── .env.example        # Environment template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Security Features 🔒

✅ API Key को `.env` फाइल में store करते हैं
✅ Frontend से API को directly call नहीं करते
✅ Backend से सभी requests को handle करते हैं
✅ CORS protection enabled
✅ Error handling implemented

## API Endpoints 🔌

### POST `/api/check-vehicle`
Vehicle loan status check करने के लिए

**Request:**
```json
{
  "vehicle_no": "UP16CD1993",
  "consent": "Y",
  "consent_text": "I hereby give my consent for the API to fetch my information"
}
```

**Response:**
```json
{
  "vehicle_no": "UP16CD1993",
  "finance_company": "HDFC Bank",
  "vehicle_class": "LMV",
  "owner_name": "John Doe",
  "loan_active": true
}
```

## Deployment 🌐

### Heroku पर Deploy करने के लिए:

```bash
# Heroku CLI install करें
# फिर:
heroku login
heroku create your-app-name
git push heroku main
heroku config:set RAPIDAPI_KEY=your_key_here
```

### Render/Railway पर भी deploy कर सकते हैं

## Troubleshooting 🔧

### "API Key not found" Error
- ✅ `.env` फाइल में RAPIDAPI_KEY जोड़ा है?
- ✅ Server को restart किया है?

### "Vehicle not found" Error
- ✅ Vehicle number सही है?
- ✅ RapidAPI subscription active है?

### CORS Error
- ✅ Server चल रहा है?
- ✅ Frontend और backend का URL सही है?

## License 📜

MIT License - See LICENSE file

## Support 💬

Issues या suggestions के लिए GitHub Issues में post करें।

---

**Made with ❤️ by yuv693**
