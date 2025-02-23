import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleMap, Marker, Autocomplete, LoadScript, DirectionsRenderer } from '@react-google-maps/api';
import './App.css';
import CrimeMap from './components/CrimeMap';

const WEATHER_API_URL = "https://api.weather.gov/points/43.0731,-89.4012";
const GOOGLE_MAPS_API_KEY = 'AIzaSyDni3sJh5FsQqwXEduYDypt7swK5YQq8SA';
//const FLASK_API_URL = "http://127.0.0.1:5000/api/data";

const mapStyles = {
  pastel: [
    { elementType: "geometry", stylers: [{ color: "#f3e5f5" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#333333" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#b3e5fc" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffc1e3" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#e1bee7" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#f8bbd0" }] },
  ],
  dark: [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f252e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#383838" }] },
  ],
  light: [],
  colorblind: [
    { elementType: "geometry", stylers: [{ color: "#d0d0d0" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#000000" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#87bdd8" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#d6d6d6" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#c8c8c8" }] },
  ],
};

const App = () => {
  const [weather, setWeather] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState("light");

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


  const fetchDirections = () => {
    if (startLocation && destination) {
      const service = new window.google.maps.DirectionsService();
      service.route(
        {
          origin: startLocation,
          destination: destination,
          travelMode: window.google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error("Error fetching directions:", status);
          }
        }
      );
    }
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <div className="theme-selector" style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '10px', borderRadius: '5px', zIndex: 1000 }}>
        <label>Select Map Theme: </label>
        <select onChange={(e) => setSelectedTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="pastel">Pastel</option>
          <option value="dark">Dark</option>
          <option value="colorblind">Colorblind Friendly</option>
        </select>
      </div>
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
        <button onClick={fetchDirections}>Get Route</button>
      </div>
      <GoogleMap
        mapContainerClassName="map-container"
        center={{ lat: 43.0731, lng: -89.4012 }}
        zoom={12}
        options={{
          styles: mapStyles[selectedTheme],
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {startLocation && <Marker position={startLocation} />}
        {destination && <Marker position={destination} />}
        {directions && <DirectionsRenderer directions={directions} />}
        <CrimeMap startLocation={startLocation} destination={destination} />
      </GoogleMap>
    </LoadScript>
  );
};

export default App;

