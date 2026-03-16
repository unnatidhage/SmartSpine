# 🦴 SmartSpine AI — Smart Spine Curvature Monitoring Vest

Real-time IoT posture monitoring system using ESP32 flex sensor, Node.js backend,
React dashboard, and AI-powered posture analysis.

---

## 📁 FOLDER STRUCTURE

```
smartspine/
├── backend/
│   ├── models/
│   │   ├── User.js          ← MongoDB user schema + bcrypt
│   │   └── Record.js        ← Posture reading schema
│   ├── routes/
│   │   ├── auth.js          ← /api/auth/login, /api/auth/register
│   │   ├── data.js          ← /api/data/ingest, /history, /stats
│   │   └── user.js          ← /api/user/profile, /api/user/calibrate
│   ├── middleware/
│   │   └── auth.js          ← JWT middleware
│   ├── server.js            ← Express + Socket.io server
│   ├── package.json
│   └── .env                 ← MONGO_URI, JWT_SECRET, PORT
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── PostureGauge.js      ← Animated SVG score ring
│   │   │   ├── StatusBadge.js       ← Color-coded posture label
│   │   │   ├── StatCard.js          ← Metric card
│   │   │   └── CalibrationModal.js  ← Sensor calibration wizard
│   │   ├── hooks/
│   │   │   ├── useAuth.js           ← Auth context provider
│   │   │   └── usePostureSocket.js  ← Socket.io real-time hook
│   │   ├── pages/
│   │   │   ├── LoginPage.js         ← Login / Register
│   │   │   └── Dashboard.js        ← Main monitoring dashboard
│   │   ├── utils/
│   │   │   └── api.js               ← Axios instance with JWT
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── esp32_firmware/
    └── smartspine_esp32.ino  ← Arduino sketch for ESP32
```

---

## ⚙️ LOCAL SETUP

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Arduino IDE with ESP32 board support

### 1. Backend
```bash
cd backend
npm install
# Edit .env:
#   MONGO_URI=mongodb://localhost:27017/smartspine
#   JWT_SECRET=your_strong_secret
npm run dev          # starts on port 5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm start            # starts on port 3000
```

### 3. ESP32 Setup
1. Open `esp32_firmware/smartspine_esp32.ino` in Arduino IDE
2. Install `ArduinoJson` library (v6)
3. Edit the constants at the top:
   - `WIFI_SSID` / `WIFI_PASS` → your WiFi
   - `BACKEND_URL` → `http://<your-PC-IP>:5000/api/data/ingest`
   - `USER_ID` → copy your MongoDB `_id` from login response
4. Upload to ESP32

### 4. Wiring
```
ESP32 3.3V ──── Flex Sensor Pin 1
ESP32 GND  ──── 10kΩ resistor ──── GND
                      ↑
               Flex Sensor Pin 2
                      ↑
               GPIO 34 (A0) ← analog read
ESP32 GPIO 5 ──── Buzzer S pin
ESP32 GND  ──── Buzzer - pin
```

---

## 🚀 DEPLOYMENT

### Option A — Railway (Recommended, Free Tier)
1. Push your code to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Deploy backend folder, set environment variables
4. Deploy frontend as a separate service
5. Update `frontend/package.json` proxy to your Railway backend URL

### Option B — Render + Vercel
- **Backend**: render.com → New Web Service → connect repo → root dir: `backend`
- **Frontend**: vercel.com → Import repo → root dir: `frontend`
- Set `REACT_APP_API_URL` in Vercel env vars to your Render URL
- Update `frontend/src/utils/api.js` to use `process.env.REACT_APP_API_URL`

### Option C — VPS (DigitalOcean / Linode)
```bash
# On server:
sudo apt install nodejs npm mongodb nginx
cd smartspine/backend && npm install && npm start
cd smartspine/frontend && npm install && npm run build
# Serve build/ with nginx, proxy /api to :5000
```

### MongoDB Atlas (Cloud DB)
1. atlas.mongodb.com → Create free cluster
2. Get connection string → paste in backend `.env` as `MONGO_URI`

---

## 🤖 AI INTEGRATION POINTS

There are 3 places where you can plug in real AI/ML:

### 🔵 Point 1 — Posture Analysis Engine (backend/routes/data.js)
**Current**: Simple rule-based threshold logic  
**Upgrade Options**:
- **TensorFlow.js**: Train a model on labeled flex sensor data (time-series classification)
- **Python ML microservice**: Use scikit-learn / PyTorch, expose via FastAPI, call from Node
- **OpenAI / Claude API**: Send flex reading + recent history → get rich contextual advice  

```js
// Example: Claude API for advice
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'x-api-key': process.env.CLAUDE_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{ role: 'user', content: `Flex value: ${flexValue}, baseline: ${calibration}, last 5 scores: ${recentScores}. Give a 1-sentence posture correction tip.` }]
  })
});
```

### 🟡 Point 2 — Real-time WebSocket Push (backend/routes/data.js)
**Current**: Emits raw analysis result  
**Upgrade**: Include ML confidence scores, trend predictions, fatigue detection

### 🟢 Point 3 — Dashboard Trend Analysis (frontend/src/pages/Dashboard.js)
**Current**: Shows raw chart  
**Upgrade**:
- Send chart data to Claude API → get "You tend to slouch after 2pm" insights
- Add anomaly detection to flag sudden posture changes
- Weekly report generation using AI summarization

---

## 🔌 API REFERENCE

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | ❌ | Create account |
| POST | /api/auth/login | ❌ | Login → JWT |
| POST | /api/data/ingest | ❌ | ESP32 posts sensor data |
| GET | /api/data/history/:userId | ✅ | Get posture history |
| GET | /api/data/stats/:userId | ✅ | Get summary stats |
| GET | /api/user/profile | ✅ | Get user profile |
| POST | /api/user/calibrate | ✅ | Save baseline flex value |

---

## 📊 How the AI Score Works

```
flexValue = raw reading from sensor (0–1023)
calibrationValue = your "perfect posture" baseline

diff = |flexValue - calibrationValue|

diff < 20   → Excellent  (score 90–100)
diff < 50   → Good       (score 70–85)
diff < 100  → Poor       (score 40–60)
diff ≥ 100  → Critical   (score 10–35)
```

Swap `analyzePosture()` in `backend/routes/data.js` with your ML model at any time.
