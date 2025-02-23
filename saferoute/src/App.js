import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, Autocomplete, LoadScript, DirectionsRenderer } from '@react-google-maps/api';
import './App.css';
import CrimeMap from './components/CrimeMap';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDni3sJh5FsQqwXEduYDypt7swK5YQq8SA';
const FLASK_API_URL = "/api/data";
const WEATHER_API_URL = "https://api.weather.gov/points/43.0731,-89.4012";

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
  const [startCoordinates, setStartCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routePath, setRoutePath] = useState([]);  
  const [selectedTheme, setSelectedTheme] = useState("light");


  const handlePlaceSelect = (place, setLocation, setCoordinates) => {
    if (place && place.formatted_address) {
      setLocation(place.formatted_address);
      setCoordinates({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }); 
    }
  };

  const sendRouteRequestToFlask = async () => {
    if (!startLocation || !destination) {
      console.error("Both addresses must be selected.");
      return;
    }

    try {
      const response = await fetch(FLASK_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_address: startLocation, destination_address: destination }),
      });

      const result = await response.json();
      console.log("Flask Response:", result);

      if (result.route) {
        setRoutePath(result.route.path);
        setRouteInfo({ distance: result.route.distance, duration: result.route.duration, alerts: result.route.alerts });
      }
    } catch (error) {
      console.error("Error sending request to Flask:", error);
    }
  };

  const fetchDirections = () => {
    if (!startCoordinates || !destinationCoordinates) {
      console.error("Start location and destination must be selected.");
      return;
    }

    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: startCoordinates,
        destination: destinationCoordinates,
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
  };

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
        <Autocomplete onLoad={(autocomplete) => autocomplete.addListener("place_changed", () => handlePlaceSelect(autocomplete.getPlace(), setStartLocation, setStartCoordinates))}>
          <input type="text" placeholder="Enter Start Location" />
        </Autocomplete>
        <Autocomplete onLoad={(autocomplete) => autocomplete.addListener("place_changed", () => handlePlaceSelect(autocomplete.getPlace(), setDestination, setDestinationCoordinates))}>
          <input type="text" placeholder="Enter Destination" />
        </Autocomplete>
        <button onClick={sendRouteRequestToFlask}>Get Safe Route</button>
        <button onClick={fetchDirections}>Show Directions</button>
      </div>

      {routeInfo && (
        <div className="route-info">
          <h3>Route Information</h3>
          <p><strong>Start:</strong> {startLocation}</p>
          <p><strong>Destination:</strong> {destination}</p>
          <p><strong>Distance:</strong> {routeInfo.distance} meters</p>
          <p><strong>Duration:</strong> {routeInfo.duration} minutes</p>
          <p><strong>Alerts:</strong> {routeInfo.alerts.length > 0 ? routeInfo.alerts.join(", ") : "No incidents reported"}</p>
        </div>
      )}

      <GoogleMap mapContainerClassName="map-container"
        center={{ lat: 43.0731, lng: -89.4012 }}
        zoom={12}
        options={{
          styles: mapStyles[selectedTheme],
          disableDefaultUI: true,
          zoomControl: true,
        }}>
        {startCoordinates && <Marker position={startCoordinates} />}
        {destinationCoordinates && <Marker position={destinationCoordinates} />}
        {routePath.map((point, index) => (
          <Marker key={index} position={{ lat: point[0], lng: point[1] }} />
        ))}
        {directions && <DirectionsRenderer directions={directions} />}
        <CrimeMap startLocation={startLocation} destination={destination} />
      </GoogleMap>
    </LoadScript>
  );
};

export default App;


