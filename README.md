🚍 Dhaka Bus Route Finder
A sleek, bilingual web app to help commuters in Dhaka find bus routes between any two stops. Built with premium UI, heritage-inspired design, and a touch of humor.

✨ Features
- 🌐 Bilingual Interface — Switch between English and Bangla with one click
- 🧠 Smart Autocomplete — Custom input suggestions based on real bus stop data
- 📜 Service & Time Info — Displays service type and operating hours (or "N/A" if unknown)
- 🖼️ Dynamic Bus Cards — Each result includes a bus image, name, service, and route preview
- 🤖 Fallback Humor — Missing image? Enjoy a meme-style "Who's That Bus?" silhouette

📁 File Structure
├── index.html
├── app.js
├── buses.json
├── assets/
│   └── buses/
│       ├── fallback.png
│       ├── default.jpg
│       └── [bus images]



📦 Data Format (buses.json)
Each bus entry includes:
{
  "english": "Balaka",
  "bangle": "বলাকা",
  "service_type": "Semi-Sitting Service",
  "time": "7:30 AM - 10:00 PM",
  "routes": ["Sayedabad", "Kamalapur", "TT Para"],
  "image": "balaka.jpg"
}



🚀 Getting Started
- Clone the repo
- Open index.html in your browser
- Enter your start and end stops
- Click Search to explore results

🧪 Future Enhancements
- Route visualization on map
- Filter by service type or time range
- Save favorite routes
- Offline support

👨‍💻 Developer
Crafted by Fahim — CSE undergrad, UI perfectionist, and branding enthusiast.
Premium layout, pixel-perfect cards, and meme-powered fallback logic.
