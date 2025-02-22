import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleMap, Marker, Autocomplete, LoadScript } from '@react-google-maps/api';
import './App.css';
import CrimeMap from './components/CrimeMap';

const WEATHER_API_URL = "https://api.weather.gov/points/43.0731,-89.4012";
const GOOGLE_MAPS_API_KEY = 'AIzaSyDni3sJh5FsQqwXEduYDypt7swK5YQq8SA';

const App = () => {
  const [weather, setWeather] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [destination, setDestination] = useState(null);

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

  const handlePlaceSelect = (place, setLocation) => {
    if (place && place.geometry) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      setLocation(location);
    }
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <div className="weather-info">
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
      <div className="route-input">
        <h3>Enter Start & Destination</h3>
        <Autocomplete onLoad={(autocomplete) => autocomplete.addListener("place_changed", () => handlePlaceSelect(autocomplete.getPlace(), setStartLocation))}>
          <input type="text" placeholder="Enter Start Location" />
        </Autocomplete>
        <Autocomplete onLoad={(autocomplete) => autocomplete.addListener("place_changed", () => handlePlaceSelect(autocomplete.getPlace(), setDestination))}>
          <input type="text" placeholder="Enter Destination" />
        </Autocomplete>
      </div>
      <GoogleMap mapContainerClassName="map-container" center={{ lat: 43.0731, lng: -89.4012 }} zoom={12}>
        {startLocation && <Marker position={startLocation} />}
        {destination && <Marker position={destination} />}
        <CrimeMap startLocation={startLocation} destination={destination} />
      </GoogleMap>
    </LoadScript>
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
