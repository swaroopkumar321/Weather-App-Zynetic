# Weather Dashboard

A React-based weather dashboard application that allows users to search for weather information by city name.

## Tech Stack

- React (Vite)
- Tailwind CSS
- Axios for API calls
- OpenWeatherMap API

## Features

- Search weather by city name
- Display current temperature, weather conditions, humidity, and wind speed
- Recent search history (last 5 searches)
- Loading states
- Error handling
- Responsive design

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an account at [OpenWeatherMap](https://openweathermap.org/api) and get your API key
4. Open `src/components/WeatherDashboard.jsx` and add your API key:
   ```javascript
   const API_KEY = 'your_api_key_here';
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## API Rate Limits

The OpenWeatherMap API has the following rate limits for free accounts:
- 60 calls/minute
- 1,000,000 calls/month

## Notes

- The application uses metric units (°C, km/h)
- Weather icons are served from OpenWeatherMap's CDN
- Recent searches are stored in component state (not persisted)
