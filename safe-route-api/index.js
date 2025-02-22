require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const CRIME_API_KEY = process.env.CRIME_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Route to get safest route
app.get('/route', async (req, res) => {
    try {
        const { start, destination } = req.query;
        
        // Fetch directions
        const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;
        const directionsResponse = await axios.get(directionsUrl);
        const route = directionsResponse.data;
        
        // Fetch crime data (Example API Call)
        const crimeUrl = `https://api.crimeometer.com/v1/incidents/raw-data?lat=40.7128&lon=-74.0060&key=${CRIME_API_KEY}`;
        const crimeResponse = await axios.get(crimeUrl);
        const crimeData = crimeResponse.data;

        // Fetch weather data
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=New York&appid=${WEATHER_API_KEY}`;
        const weatherResponse = await axios.get(weatherUrl);
        const weatherData = weatherResponse.data;
        
        res.json({ route, crimeData, weatherData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
