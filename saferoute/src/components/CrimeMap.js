import React, { useEffect, useState } from 'react';
import { Marker, InfoWindow, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import crimeData from '../data/cleaned_crime_data_no_block.json';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDni3sJh5FsQqwXEduYDypt7swK5YQq8SA';

const timeRanges = {
  Morning: ["06:00", "12:00"],
  Afternoon: ["12:00", "18:00"],
  Night: ["18:00", "06:00"]
};

const severityColors = {
  High: 'red',
  Moderate: 'orange',
  Low: 'yellow'
};

const determineSeverity = (incident) => {
  const highSeverity = ["Homicide", "Weapons Violation", "Battery", "Robbery"];
  const moderateSeverity = ["Burglary", "Theft", "Assault"];

  if (highSeverity.includes(incident)) return "High";
  if (moderateSeverity.includes(incident)) return "Moderate";
  return "Low";
};

const CrimeMap = ({ startLocation, destination }) => {
  const [crimeLocations, setCrimeLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("Morning");
  const [safeRoute, setSafeRoute] = useState(null);

  useEffect(() => {
    const geocodeAddresses = async () => {
      console.log("Filtering crimes for:", selectedTimeRange);
      const geocodedData = [];
      for (let crime of crimeData) {
        const crimeTime = crime.time;
        const [start, end] = timeRanges[selectedTimeRange];

        if ((start <= crimeTime && crimeTime < end) || (start > end && (crimeTime >= start || crimeTime < end))) {
          console.log(`Geocoding: ${crime.address}`);
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(crime.address)}&key=${GOOGLE_MAPS_API_KEY}`);
          const data = await response.json();
          console.log("Geocode Response:", data);

          if (data.results.length > 0) {
            const location = data.results[0].geometry.location;
            const severity = determineSeverity(crime.incident);
            geocodedData.push({
              ...crime,
              lat: location.lat,
              lng: location.lng,
              severity: severity
            });
          }
        }
      }
      setCrimeLocations(geocodedData);
    };
    geocodeAddresses();
  }, [selectedTimeRange]);

  useEffect(() => {
    if (startLocation && destination) {
      const avoidCrimeAreas = crimeLocations
        .filter((crime) => crime.severity === "High")
        .map((crime) => ({ lat: crime.lat, lng: crime.lng }));

      const service = new window.google.maps.DirectionsService();
      service.route(
        {
          origin: startLocation,
          destination: destination,
          travelMode: window.google.maps.TravelMode.WALKING,
          avoid: avoidCrimeAreas.length > 0 ? avoidCrimeAreas : undefined,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setSafeRoute(result);
          } else {
            console.error("Error fetching safe walking route:", status);
          }
        }
      );
    }
  }, [startLocation, destination, crimeLocations]);

  return (
    <>
      <div className="time-filter">
        <label>Select Time of Day:</label>
        <select onChange={(e) => setSelectedTimeRange(e.target.value)}>
          <option value="Morning">Morning (06:00 - 12:00)</option>
          <option value="Afternoon">Afternoon (12:00 - 18:00)</option>
          <option value="Night">Night (18:00 - 06:00)</option>
        </select>
      </div>

      {crimeLocations.length > 0 ? (
        crimeLocations.map((crime, index) => (
          <Marker
            key={index}
            position={{ lat: crime.lat, lng: crime.lng }}
            icon={{
              url: `http://maps.google.com/mapfiles/ms/micons/${severityColors[crime.severity]}-dot.png`
            }}
            onClick={() => setSelectedLocation(crime)}
          />
        ))
      ) : (
        console.log("No markers loaded")
      )}

      {safeRoute && <DirectionsRenderer directions={safeRoute} />}

      {selectedLocation && (
        <InfoWindow
          position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div>
            <h3>{selectedLocation.address}</h3>
            <p><strong>Time:</strong> {selectedLocation.time}</p>
            <p><strong>Incident:</strong> {selectedLocation.incident}</p>
            <p><strong>Severity:</strong> {selectedLocation.severity}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default CrimeMap;
