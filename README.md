# NagarShield AI 🛡️
### Urban Mobility Intelligence & Climate Resilience Decision-Support Platform

**NagarShield AI** is an AI-powered urban decision-support platform designed to help municipal planners, emergency responders, and citizens monitor, simulate, and mitigate environmental and infrastructural hazards—including urban waterlogging/flooding, heat island extremes, and traffic congestion.

---

## 🌟 Key Features

- **🌐 Live Telemetry & Microclimate Monitoring**: Real-time integration with meteorological feeds (temperature, humidity, air quality, precipitation) for urban zones (Mirpur, Gulshan, Old Dhaka, Uttara, etc.).
- **🌊 Waterlogging & Flood Basin Analysis**: Elevation modeling, basin water level monitoring, pump station readiness, and proactive flood warnings.
- **🚦 Smart Mobility & Congestion Mitigation**: Real-time traffic flow index, congestion bottlenecks, arterial corridor safety, and dynamic rerouting suggestions.
- **🚆 Dhaka Metro Rail (MRT-6) Status**: Real-time line congestion, operational delays, frequency adjustments, and climate resilience safeguards.
- **🗺️ Safe Route Intelligence**: Safe navigation for emergency services and citizens to avoid inundated roads, blocked intersections, and severe heat zones.
- **📢 Citizen Hazard Reporter**: Crowdsourced incident reporting for waterlogged roads, fallen trees, damaged drainage, and power outages with automated severity triage.
- **🧪 Multi-Hazard Scenario Simulator**: Interactive stress-testing simulator (e.g. +100mm heavy cloudburst, power grid outage, rush hour surges) with predictive risk assessment.
- **🤖 Gemini AI Urban Copilot**: Conversational AI assistant for emergency dispatch, resilience audits, resource reallocation, and executive briefings.
- **🇧🇩 Bilingual Interface**: Seamless instant toggle between English and Bengali (বাংলা).

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion (Framer Motion), Lucide React
- **Data Visualization**: Recharts, GIS spatial maps
- **AI & Reasoning Engine**: Google Gemini API (`@google/genai`)
- **Backend & Middleware**: Express.js, Node.js (`server.ts`), Vite
- **Database / Cloud**: Firebase / Cloud Firestore

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sohancreation/NagarShield.git
   cd NagarShield
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables:**
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your API keys:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `OPENWEATHER_API_KEY`: OpenWeatherMap API key (optional, fallback provided)
   - `VITE_GOOGLE_MAPS_API_KEY`: Google Maps JavaScript API key (optional)

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🏗️ Project Structure

```
├── src/
│   ├── components/      # UI components (Header, Dashboard, Map, Copilot, etc.)
│   ├── context/         # React Context providers (State, Theme, Language)
│   ├── data/            # Spatial and urban simulation datasets
│   ├── services/        # Gemini AI, OpenWeather, and Firebase services
│   ├── types.ts         # TypeScript definitions
│   ├── App.tsx          # Main application orchestrator
│   └── main.tsx         # Entry point
├── server.ts            # Express backend & Vite middleware server
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```

---

## 📄 License

This project is licensed under the Apache-2.0 License.
