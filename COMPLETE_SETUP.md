# 🚗 Check Vehicle Loan - Complete Setup Guide

A **secure**, **free**, and **open-source** application to check vehicle loan status in India. Built with HTML/CSS/JavaScript frontend and Node.js backend for maximum security.

## 📋 Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### 🔒 Security
- ✅ API key stored securely on backend (never exposed in frontend)
- ✅ CORS protection
- ✅ Rate limiting (30 requests per 15 minutes)
- ✅ Input validation and sanitization
- ✅ Privacy: Owner name is masked

### 🎨 User Experience
- ✅ Modern gradient UI design
- ✅ Smooth animations and transitions
- ✅ Loading spinner with visual feedback
- ✅ Real-time error messages in Hindi/English
- ✅ Fully responsive (mobile, tablet, desktop)

### 🛡️ Reliability
- ✅ Health check endpoint
- ✅ Comprehensive error handling
- ✅ Timeout protection (10 seconds)
- ✅ Network error detection
- ✅ Detailed logging for debugging

---

## 📁 Project Structure

```
CHECK-VEHICLE-LOAN/
├── 📄 index.html              # Frontend (HTML + CSS + JS)
├── 📄 package.json            # Node.js dependencies
├── 📄 .env.example            # Environment template
├── 📄 .gitignore              # Git ignore file
├── 📖 README.md               # Main documentation (this file)
├── 📖 BACKEND_SETUP.md        # Backend setup guide
│
├── 📁 backend/
│   └── 📄 server.js           # Express.js backend server
│
└── 📁 public/                 # (Optional) Static files folder
    └── 📄 index.html          # Can be copied here for serving
```

---

## 🎯 Frontend Setup

The frontend is a single `index.html` file that works standalone but communicates with the backend for security.

### Features:
- ✅ Vehicle number validation (Indian format)
- ✅ Beautiful gradient design with animations
- ✅ Real-time error messages
- ✅ Privacy-conscious data display
- ✅ Mobile-friendly responsive layout

### To Use (Without Backend - For Testing):
Simply open `index.html` in your browser. However, it will fail at the API call because it expects a backend server.

### View the Frontend:
```
Open: https://github.com/yuv693/CHECK-VEHICLE-LOAN/blob/main/index.html
```

---

## 🚀 Backend Setup

### Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **RapidAPI Account** - [Sign up free](https://rapidapi.com)

### Step 1: Get RapidAPI Key

1. Go to https://rapidapi.com
2. Sign up or log in
3. Search for "RTO Vehicle Information India"
4. Click on the API
5. Subscribe to the free plan (100 requests/month)
6. Copy your API Key from the "Authorization" header section

### Step 2: Clone/Download Repository

```bash
# Option A: If you have git
git clone https://github.com/yuv693/CHECK-VEHICLE-LOAN.git
cd CHECK-VEHICLE-LOAN

# Option B: Download as ZIP
# Download from GitHub and extract
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Cross-origin protection
- `dotenv` - Environment variables management
- `express-rate-limit` - Rate limiting

### Step 4: Create .env File

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your RapidAPI key:

```
PORT=3000
NODE_ENV=development
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=rto-vehicle-information-india.p.rapidapi.com
ALLOWED_ORIGINS=http://localhost:3000
```

**⚠️ WARNING:** Never commit .env file! It's already in .gitignore.

### Step 5: Run the Server

```bash
# Development mode (auto-reloads on file changes)
npm run dev

# Production mode
npm start
```

You should see:
```
╔════════════════════════════════════════════╗
║   🚗 Vehicle Loan Check Server Started    ║
╠════════════════════════════════════════════╣
║   Server running on: http://localhost:3000         ║
║   API Endpoint: /api/check-vehicle        ║
║   Health Check: /api/health               ║
╚════════════════════════════════════════════╝
```

### Step 6: Test the Server

Open a new terminal and test:

```bash
# Test the API
curl -X POST http://localhost:3000/api/check-vehicle \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_no":"UP16CD1993",
    "consent":"Y",
    "consent_text":"I give consent"
  }'

# Test health check
curl http://localhost:3000/api/health
```

### Step 7: Open Frontend

Open in your browser:
- http://localhost:3000/

Now try entering a vehicle number like `UP16CD1993` and click "चेक करें"

---

## 🌐 API Endpoints

### 1. Check Vehicle Status
**POST** `/api/check-vehicle`

**Request:**
```json
{
  "vehicle_no": "UP16CD1993",
  "consent": "Y",
  "consent_text": "I hereby give my consent for the API to fetch my vehicle information"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "vehicle_no": "UP-16-CD-1993",
  "finance_company": "HDFC Bank",
  "vehicle_class": "LMV",
  "owner_name": "J*****e",
  "loan_active": true,
  "registration_date": "2020-01-15",
  "fuel_type": "Petrol",
  "vehicle_type": "Car"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "अमान्य गाड़ी नंबर प्रारूप।",
  "error": "Invalid vehicle number format"
}
```

### 2. Health Check
**GET** `/api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Server is running"
}
```

---

## 📦 Deployment

### Deploy on Heroku (Free)

```bash
# Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variable
heroku config:set RAPIDAPI_KEY=your_key_here -a your-app-name

# Deploy
git push heroku main

# View logs
heroku logs --tail -a your-app-name
```

### Deploy on Vercel (Free)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy on Railway (Free)

1. Go to https://railway.app
2. Connect your GitHub repo
3. Add environment variables
4. Deploy automatically

### Deploy on AWS/Google Cloud/Azure

Refer to `BACKEND_SETUP.md` for detailed instructions.

---

## 🔧 Troubleshooting

### Frontend Issues

| Problem | Solution |
|---------|----------|
| "त्रुटि हुई" appears | Check if backend server is running on port 3000 |
| Form validation fails | Enter valid Indian vehicle number (e.g., UP16CD1993) |
| No data appears | Wait a moment, API calls take time |

### Backend Issues

| Problem | Solution |
|---------|----------|
| "RAPIDAPI_KEY not found" | Check .env file has your API key |
| "Invalid API key" error | Verify API key is correct in .env file |
| "Port 3000 already in use" | Change PORT in .env or kill the process using port 3000 |
| "Rate limit exceeded" | Wait 15 minutes for rate limit to reset |

### Network Issues

| Problem | Solution |
|---------|----------|
| "नेटवर्क में समस्या" | Check internet connection |
| "Timeout occurred" | Try again, server might be slow |
| CORS error | Check ALLOWED_ORIGINS in .env file |

---

## 📚 Additional Resources

- **Express.js Docs**: https://expressjs.com/
- **RapidAPI Docs**: https://docs.rapidapi.com/
- **Node.js Docs**: https://nodejs.org/docs/
- **Heroku Deployment**: https://devcenter.heroku.com/

---

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

### Ideas for Enhancement:
- Add database to store search history
- Add user authentication
- Add multiple vehicle support
- Add SMS/Email notifications
- Translate to other Indian languages

---

## 📄 License

MIT License - You're free to use this for personal and commercial projects.

---

## ❓ FAQ

**Q: Is this app free to use?**
A: Yes! The frontend is free. RapidAPI gives 100 free requests/month on the free plan.

**Q: Is my data safe?**
A: Yes! Your vehicle number is validated and processed on the backend. We don't store any personal data.

**Q: Can I use this commercially?**
A: Yes, but you'll need a paid RapidAPI plan for higher request limits.

**Q: How do I update the vehicle number format?**
A: Edit the regex pattern in both `index.html` (frontend) and `backend/server.js` (backend).

**Q: Can I self-host this?**
A: Yes! Follow the deployment section to host on any server or cloud platform.

---

## 📞 Support

- 🐛 Found a bug? Create an issue on GitHub
- 💡 Have a suggestion? Open a discussion
- 📧 Need help? Check BACKEND_SETUP.md for detailed guide

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2024-01-15 | Initial release with frontend + backend |

---

**Made with ❤️ for Indian vehicle owners**

**Star ⭐ this repo if you found it helpful!**
