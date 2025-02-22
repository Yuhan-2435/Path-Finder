import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { APIProvider, Map } from '@vis.gl/react-google-maps';

const WEATHER_API_URL = "https://api.weather.gov/points/43.0731,-89.4012";

const App = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(WEATHER_API_URL);
        const data = await response.json();
        const forecastUrl = data.properties.forecastHourly;

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        const current = forecastData.properties.periods[0];

        setWeather({
          time: current.startTime,
          temperature: current.temperature,
          windSpeed: current.windSpeed,
          humidity: current.relativeHumidity.value,
          shortForecast: current.shortForecast,
          rain: current.probabilityOfPrecipitation.value
        });
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchWeather();
  }, []);

  // Define bounds for Madison, WI
  const madisonBounds = {
    north: 43.15,  // Upper latitude limit
    south: 43.00,  // Lower latitude limit
    west: -89.5,   // Left longitude limit
    east: -89.3    // Right longitude limit
  };

  return (
    <APIProvider apiKey={'AIzaSyAe82-Ug3bst9LJ40PItH5M1TBzupFFQ5Y'}>
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '8px', zIndex: 1000 }}>
        {weather ? (
          <>
            <h3>Madison, WI Weather</h3>
            <p><strong>Temperature:</strong> {weather.temperature}°F</p>
            <p><strong>Wind Speed:</strong> {weather.windSpeed}</p>
            <p><strong>Humidity:</strong> {weather.humidity}%</p>
            <p><strong>Forecast:</strong> {weather.shortForecast}</p>
            <p><strong>Rain Chance:</strong> {weather.rain}%</p>
          </>
        ) : (
          <p>Loading weather...</p>
        )}
      </div>
      <Map
        style={{ width: '100vw', height: '100vh' }}
        defaultCenter={{ lat: 43.0731, lng: -89.4012 }}
        defaultZoom={12}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        restriction={{
          latLngBounds: madisonBounds,
          strictBounds: true // Prevents users from panning outside the defined area
        }}
      />
    </APIProvider>
  );
};

document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById('app');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error("Error: 'app' element not found.");
  }
});

export default App;
