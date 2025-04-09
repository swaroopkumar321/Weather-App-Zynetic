import { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherDashboard = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
  const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

  useEffect(() => {
    // Check system preference initially
    if (!localStorage.getItem('darkMode')) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemPrefersDark);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(`${WEATHER_API_URL}?q=${city}&appid=${API_KEY}&units=metric`),
        axios.get(`${FORECAST_API_URL}?q=${city}&appid=${API_KEY}&units=metric`)
      ]);

      setWeather(weatherResponse.data);
      setForecast(forecastResponse.data);
      
      setSearchHistory(prev => {
        const newHistory = [city, ...prev.filter(item => item !== city)].slice(0, 5);
        return newHistory;
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!weather) return; // Only refresh if we have a city loaded
    setCity(weather.name);
    setLoading(true);
    setError(null);

    try {
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(`${WEATHER_API_URL}?q=${weather.name}&appid=${API_KEY}&units=metric`),
        axios.get(`${FORECAST_API_URL}?q=${weather.name}&appid=${API_KEY}&units=metric`)
      ]);

      setWeather(weatherResponse.data);
      setForecast(forecastResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dt) => {
    return new Date(dt * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen p-4 transition-all duration-300 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-[1400px] mx-auto">
        {/* Header with increased bottom margin */}
        <header className="mb-8 px-2 flex justify-between items-center sticky top-0 z-20 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md py-4">
          <h1 className="text-4xl font-light metro-title">Weather</h1>
          <div className="flex gap-2">
            {weather && (
              <button
                onClick={handleRefresh}
                className="p-3 bg-gray-800 text-white hover:bg-gray-700 transition-all rounded-md"
                aria-label="Refresh weather"
                disabled={loading}
              >
                <span className="text-xl">{loading ? '⌛' : '🔄'}</span>
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-3 bg-gray-800 text-white hover:bg-gray-700 transition-all rounded-md"
              aria-label="Toggle dark mode"
            >
              <span className="text-xl">{darkMode ? '🌞' : '🌙'}</span>
            </button>
          </div>
        </header>

        {/* Recent Searches Panel - Fixed with better positioning */}
        <div className="fixed left-4 top-28 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <h2 className="text-xl font-light mb-4 metro-title flex items-center gap-2 sticky top-0 bg-white dark:bg-gray-800 py-2">
            <span className="text-gray-600 dark:text-gray-400">🕒</span> Recent Searches
          </h2>
          {searchHistory.length > 0 ? (
            <div className="flex flex-col gap-2">
              {searchHistory.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setCity(item);
                    handleSearch({ preventDefault: () => {} });
                  }}
                  className="w-full text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-all flex items-center justify-between group"
                >
                  <span className="font-light metro-title">{item}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No recent searches
            </p>
          )}
        </div>

        {/* Main Content Area - Improved spacing */}
        <div className="ml-72 pl-4">
          {/* Search Section */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search for any city..."
                className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gray-800 text-white hover:bg-gray-700 rounded-md transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="loading-spinner w-5 h-5 rounded-full"></div>
                  </span>
                ) : (
                  'Search'
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}
          </div>

          {weather && (
            <div className="space-y-8">
              {/* Current Weather Card */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl"></div>
                    <img
                      src={`https://openweathermap.org/img/w/${weather.weather[0].icon}.png`}
                      alt={weather.weather[0].description}
                      className="weather-icon w-24 h-24 relative z-10"
                    />
                  </div>
                  <div>
                    <h3 className="text-3xl font-light mb-2 metro-title">{weather.name}</h3>
                    <p className="text-5xl font-light metro-title text-blue-600 dark:text-blue-400">
                      {Math.round(weather.main.temp)}°C
                    </p>
                    <p className="text-xl text-gray-600 dark:text-gray-400 capitalize mt-2">
                      {weather.weather[0].description}
                    </p>
                  </div>
                </div>

                {/* Weather Details Grid - Improved spacing */}
                <div className="grid grid-cols-4 gap-6 mt-8">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Humidity</p>
                    <p className="text-2xl font-light metro-title">{weather.main.humidity}%</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Wind Speed</p>
                    <p className="text-2xl font-light metro-title">{weather.wind.speed} km/h</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Feels Like</p>
                    <p className="text-2xl font-light metro-title">{Math.round(weather.main.feels_like)}°C</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pressure</p>
                    <p className="text-2xl font-light metro-title">{weather.main.pressure} hPa</p>
                  </div>
                </div>
              </div>

              {/* 5-Day Forecast - Better spacing and padding */}
              {forecast && (
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-8 rounded-lg">
                  <h2 className="text-xl font-light mb-6 metro-title flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">📅</span> 
                    5-Day Forecast
                  </h2>
                  <div className="flex gap-6 overflow-x-auto pb-4 -mx-2 px-2">
                    {forecast.list
                      .filter((item, index) => index % 8 === 0)
                      .slice(0, 5)
                      .map((item) => (
                        <div
                          key={item.dt}
                          className="min-w-[180px] flex-1 bg-white dark:bg-gray-700 p-5 rounded-lg shadow-sm hover:shadow-md transition-all"
                        >
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{formatDate(item.dt)}</p>
                          <div className="my-3">
                            <img
                              src={`https://openweathermap.org/img/w/${item.weather[0].icon}.png`}
                              alt={item.weather[0].description}
                              className="weather-icon mx-auto w-16 h-16"
                            />
                          </div>
                          <p className="text-2xl font-light metro-title mb-2">
                            {Math.round(item.main.temp)}°C
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {item.weather[0].description}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;