import  { useEffect, useState } from "react";

export default function WeatherApp() {
  const [forecast, setForecast] = useState([]);
  const [todayWeather, setTodayWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [timezone, setTimezone] = useState("auto");
  const [customLocation, setCustomLocation] = useState({ lat: "", lon: "" });

  const fetchWeather = async (lat, lon, tz) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max&current_weather=true&timezone=${tz}`
      );
      const data = await response.json();

      const weatherDescriptions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Light snow",
        73: "Moderate snow",
        75: "Heavy snow",
        80: "Rain showers",
        81: "Moderate showers",
        82: "Violent showers",
        95: "Thunderstorm",
        96: "Thunderstorm w/ hail",
        99: "Severe thunderstorm",
      };

      const dailyData = data.daily.time.map((date, i) => ({
        date,
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        precipitation: data.daily.precipitation_sum[i],
        weather: weatherDescriptions[data.daily.weathercode[i]] || "Unknown",
        wind: data.daily.windspeed_10m_max[i],
      }));

      const today = {
        temperature: data.current_weather.temperature,
        wind: data.current_weather.windspeed,
        weather: weatherDescriptions[data.current_weather.weathercode] || "Unknown",
      };

      setTodayWeather(today);
      setForecast(dailyData);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch weather data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLatitude(latitude);
        setLongitude(longitude);
        fetchWeather(latitude, longitude, timezone);
      },
      () => {
        setError("Location access denied.");
        setLoading(false);
      }
    );
  }, [timezone]);

  const handleCustomLocation = () => {
    if (customLocation.lat && customLocation.lon) {
      setLatitude(customLocation.lat);
      setLongitude(customLocation.lon);
      fetchWeather(customLocation.lat, customLocation.lon, timezone);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white">Loading weather...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-8 text-center tracking-wide">Weather Dashboard</h1>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Latitude"
          value={customLocation.lat}
          onChange={(e) => setCustomLocation({ ...customLocation, lat: e.target.value })}
          className="bg-gray-700 text-white p-3 rounded-xl w-full sm:w-40 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Longitude"
          value={customLocation.lon}
          onChange={(e) => setCustomLocation({ ...customLocation, lon: e.target.value })}
          className="bg-gray-700 text-white p-3 rounded-xl w-full sm:w-40 focus:outline-none"
        />
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="bg-gray-700 text-white p-3 rounded-xl w-full sm:w-48"
        >
          <option value="auto">Auto</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">New York</option>
          <option value="Europe/London">London</option>
          <option value="Asia/Tokyo">Tokyo</option>
          <option value="Australia/Sydney">Sydney</option>
        </select>
        <button
          onClick={handleCustomLocation}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-semibold"
        >
          Update
        </button>
      </div>

      {/* Today */}
      {todayWeather && (
        <div className="bg-gray-900/60 backdrop-blur-md shadow-lg rounded-3xl p-8 mb-10 text-center border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Today</h2>
          <p className="text-5xl font-bold mb-2">{todayWeather.temperature}°C</p>
          <p className="text-lg italic mb-2">{todayWeather.weather}</p>
          <p className="text-sm text-gray-400">Wind: {todayWeather.wind} km/h</p>
        </div>
      )}

      {/* Forecast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="bg-gray-900/50 backdrop-blur-md shadow-md rounded-3xl p-6 flex flex-col items-center border border-gray-700"
          >
            <p className="text-sm text-gray-400 mb-2">{new Date(day.date).toDateString()}</p>
            <p className="text-2xl font-bold mb-1">{day.tempMax}°C</p>
            <p className="text-sm text-gray-300 mb-2">Low: {day.tempMin}°C</p>
            <p className="text-sm italic mb-1">{day.weather}</p>
            <p className="text-xs text-gray-400">Precip: {day.precipitation} mm</p>
            <p className="text-xs text-gray-400">Wind: {day.wind} km/h</p>
          </div>
        ))}
      </div>
    </div>
  );
}
