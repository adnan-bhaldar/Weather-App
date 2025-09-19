import React, { useEffect, useState } from 'react';

// Tailwind CSS is assumed to be available.
// All helper functions and icons have been moved to this file.

// Helper Functions
const convertTemperature = (temp, unit) => {
  if (unit === 'F') {
    return (temp * 9 / 5 + 32).toFixed(1);
  }
  return temp.toFixed(1);
};

const getHumidityValue = (humidity) => {
  if (humidity > 70) return 'High';
  if (humidity > 40) return 'Moderate';
  return 'Low';
};

const getVisibilityValue = (visibility) => {
  if (visibility > 10000) return 'Excellent';
  if (visibility > 5000) return 'Good';
  if (visibility > 2000) return 'Fair';
  return 'Poor';
};

const getWindDirection = (deg) => {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(deg / (360 / directions.length)) % directions.length;
  return directions[index];
};

// Icons (as functional components using emojis)
const HumidityIcon = () => (
  <span className="text-3xl transition-transform transform group-hover:scale-110">💧</span>
);

const SunriseIcon = () => (
  <span className="text-3xl transition-transform transform group-hover:scale-110">🌅</span>
);

const SunsetIcon = () => (
  <span className="text-3xl transition-transform transform group-hover:scale-110">🌇</span>
);

const VisibilityIcon = () => (
  <span className="text-3xl transition-transform transform group-hover:scale-110">👁️</span>
);

const WindIcon = () => (
  <span className="text-3xl transition-transform transform group-hover:scale-110">🌬️</span>
);

// Background mapping for different weather conditions
const backgroundMap = {
  day: {
    Clear: 'bg-gradient-to-br from-blue-300 to-sky-500',
    Clouds: 'bg-gradient-to-br from-gray-300 to-gray-500',
    Rain: 'bg-gradient-to-br from-gray-600 to-indigo-800',
    Thunderstorm: 'bg-gradient-to-br from-gray-800 to-gray-900',
    Drizzle: 'bg-gradient-to-br from-slate-400 to-sky-600',
    Snow: 'bg-gradient-to-br from-sky-200 to-cyan-500',
    Mist: 'bg-gradient-to-br from-gray-400 to-gray-600',
    Smoke: 'bg-gradient-to-br from-gray-400 to-gray-600',
    Haze: 'bg-gradient-to-br from-gray-400 to-gray-600',
    Fog: 'bg-gradient-to-br from-gray-400 to-gray-600',
    Sand: 'bg-gradient-to-br from-yellow-500 to-orange-700',
    Ash: 'bg-gradient-to-br from-gray-400 to-gray-600',
    Squall: 'bg-gradient-to-br from-sky-600 to-indigo-900',
    Tornado: 'bg-gradient-to-br from-gray-800 to-red-900',
    Default: 'bg-gradient-to-br from-blue-400 to-purple-600'
  },
  night: {
    Clear: 'bg-gradient-to-br from-gray-900 to-indigo-900',
    Clouds: 'bg-gradient-to-br from-slate-800 to-gray-700',
    Rain: 'bg-gradient-to-br from-gray-800 to-blue-900',
    Thunderstorm: 'bg-gradient-to-br from-gray-900 to-black',
    Drizzle: 'bg-gradient-to-br from-slate-600 to-slate-800',
    Snow: 'bg-gradient-to-br from-slate-500 to-gray-700',
    Mist: 'bg-gradient-to-br from-gray-700 to-gray-900',
    Smoke: 'bg-gradient-to-br from-gray-700 to-gray-900',
    Haze: 'bg-gradient-to-br from-gray-700 to-gray-900',
    Fog: 'bg-gradient-to-br from-gray-700 to-gray-900',
    Sand: 'bg-gradient-to-br from-gray-800 to-orange-900',
    Ash: 'bg-gradient-to-br from-gray-700 to-gray-900',
    Squall: 'bg-gradient-to-br from-gray-800 to-indigo-900',
    Tornado: 'bg-gradient-to-br from-gray-900 to-red-900',
    Default: 'bg-gradient-to-br from-slate-800 to-purple-900'
  },
};

const WeatherBackground = ({ condition }) => {
  const isDay = condition?.isDay ?? true;
  const weatherMain = condition?.main ?? 'Default';
  const backgroundClass = isDay
    ? backgroundMap.day[weatherMain] || backgroundMap.day.Default
    : backgroundMap.night[weatherMain] || backgroundMap.night.Default;

  return (
    <div className={`fixed inset-0 z-0 transition-colors duration-1000 ${backgroundClass}`}></div>
  );
};

// Main App Component
const App = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('');
  const [suggestion, setSuggestion] = useState([]);
  const [unit, setUnit] = useState('C');
  const [error, setError] = useState('');

  const API_KEY = 'f3f042e3f51bee7bfc1b9d9557ce1fb1';

  // Fetch 5 locations suggestions from api and updates
  const fetchSuggestions = async (query) => {
    try {
      const res = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      res.ok ? setSuggestion(await res.json()) : setSuggestion([]);
    } catch {
      setSuggestion([]);
    }
  };

  useEffect(() => {
    if (city.trim().length >= 3 && !weather) {
      const timer = setTimeout(() => fetchSuggestions(city), 500);
      return () => clearTimeout(timer);
    }
    setSuggestion([]);
  }, [city, weather]);

  // This will fetch data from url
  const fetchWeatherData = async (url, name = '') => {
    setError('');
    setWeather(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error((await response.json()).message || 'City not found');
      }
      const data = await response.json();
      setWeather(data);
      setCity(name || data.name);
      setSuggestion([]);
    } catch (error) {
      setError(error.message);
    }
  };

  // This function prevents from submission validates city and fetches data via APi key
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      return setError("Please enter a valid city name.");
    }
    await fetchWeatherData(
      `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=${API_KEY}&units=metric`
    );
  };

  // This function checks weather and returns function
  const getWeatherCondition = () =>
    weather && {
      main: weather.weather[0].main,
      isDay: Date.now() / 1000 > weather.sys.sunrise && Date.now() / 1000 < weather.sys.sunset,
    };

  return (
    <div className='min-h-screen font-sans'>
      <WeatherBackground condition={getWeatherCondition()} />
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="bg-white/10 backdrop-blur-3xl rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] p-8 max-w-sm text-white w-full border border-white/20 relative z-10 animate-fade-in transition-all duration-500">
          <h1 className="text-4xl font-extrabold text-center mb-6 drop-shadow-lg">
            Weather App
          </h1>

          {!weather ? (
            <form onSubmit={handleSearch} className='flex flex-col relative'>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder='Enter City or Country (min 3 letters)'
                className='mb-4 p-3 rounded-lg border border-white/50 bg-white/20 text-white placeholder-white/80 focus:outline-none focus:border-white transition-colors duration-300' />
              {suggestion.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/20 backdrop-blur-lg rounded-lg shadow-xl z-20 border border-white/30 overflow-hidden">
                  {suggestion.map((s) => (
                    <button type='button' key={`${s.lat}-${s.lon}`}
                      onClick={() => fetchWeatherData(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_KEY}&units=metric`,
                        `${s.name}, ${s.country}${s.state ? `, ${s.state}` : ''}`
                      )} className='block hover:bg-white/30 bg-transparent px-4 py-3 text-sm text-left w-full transition-colors'>
                      {s.name}, {s.country} {s.state && `, ${s.state}`}
                    </button>
                  ))}
                </div>
              )}

              <button type='submit' className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105">
                Get Weather
              </button>
            </form>
          ) : (
            <div className="mt-6 text-center transition-opacity duration-500">
              <button onClick={() => { setWeather(null); setCity(''); }} className="mb-4 bg-purple-900 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105">
                New search
              </button>

              <div className='flex justify-between items-center mb-4'>
                <h2 className="font-bold text-4xl drop-shadow-lg">
                  {weather.name}
                </h2>
                <button onClick={() => { setUnit(u => u === 'C' ? 'F' : 'C') }}
                  className='bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-3 rounded-full transition-colors'>
                  &deg;{unit}
                </button>
              </div>
              <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt={weather.weather[0].icon.description}
                className='mx-auto my-4 w-24 h-24 animate-fade-in' />
              <p className='text-6xl font-light drop-shadow-lg'>
                {convertTemperature(weather.main.temp, unit)} &deg;{unit}
              </p>
              <p className="capitalize text-lg font-light mt-2">{weather.weather[0].description}</p>
              
              <div className='grid grid-cols-3 gap-4 mt-8'>
                {[
                  [HumidityIcon, 'Humidity', `${weather.main.humidity}% (${getHumidityValue(weather.main.humidity)})`],
                  [WindIcon, 'Wind', `${weather.wind.speed} m/s ${weather.wind.deg ? `(${getWindDirection(weather.wind.deg)})` : ''}`],
                  [VisibilityIcon, 'Visibility', getVisibilityValue(weather.visibility)]
                ].map(([Icon, label, value]) => (
                  <div key={label} className='flex flex-col items-center p-2 rounded-lg bg-white/10 backdrop-blur-md transition-all duration-300 transform hover:scale-105 group caret-color'>
                    <Icon />
                    <p className='mt-2 text-sm font-medium'>{label}</p>
                    <p className='text-xs font-light'>{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {[
                  [SunriseIcon, 'Sunrise', weather.sys.sunrise],
                  [SunsetIcon, 'Sunset', weather.sys.sunset],
                ].map(([Icon, label, time]) => (
                  <div key={label} className='flex flex-col items-center p-2 rounded-lg bg-white/10 backdrop-blur-md transition-all duration-300 transform hover:scale-105 group'>
                    <Icon />
                    <p className='mt-2 text-sm font-medium'>{label}</p>
                    <p className='text-xs font-light'>
                      {new Date(time * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-sm">
                <p><strong>Feels Like: </strong><span className="font-medium">{convertTemperature(weather.main.feels_like, unit)} &deg;{unit}</span></p>
                <p><strong>Pressure: </strong><span className="font-medium">{weather.main.pressure} hPa</span></p>
              </div>
            </div>
          )}
          {error && <p className='mt-4 text-red-300 text-center text-sm'>{error}</p>}
        </div>
      </div>
    </div>
  )
}
export default App;
