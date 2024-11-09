function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;

    // Format time
    const timeString = `${hours12}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
    
    // Format date (e.g., "Tuesday, March 19")
    const dateString = now.toLocaleDateString('en-AU', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('dateDisplay').textContent = dateString;
    document.getElementById('timeDisplay').textContent = timeString;
}

// Weather API constants
const WEATHER_API_URL = "https://api.open-meteo.com/v1/bom";
const LAT = -33.80007150250232;
const LONG = 151.06689458521106;

// Add the weather data functions
async function fetchWeatherData() {
    try {
        const response = await fetch(`${WEATHER_API_URL}?latitude=${LAT}&longitude=${LONG}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,rain,showers&hourly=precipitation_probability,rain,showers&daily=rain_sum,temperature_2m_min&timezone=Australia/Sydney`);
        
        if (!response.ok) {
            throw new Error('Weather data fetch failed');
        }

        const data = await response.json();
        updateWeatherDisplay(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById('weather-widget').innerHTML = '<p>Failed to load weather data</p>';
    }
}

function updateWeatherDisplay(data) {
    const weatherWidget = document.getElementById('weather-widget');
    const container = document.querySelector('.container');
    const nextHours = data.hourly.precipitation_probability.slice(0, 6);
    const currentHour = new Date().getHours();
    
    // Check if it's likely to rain in the next hour (e.g., > 50% probability)
    const rainSoon = nextHours[0] > 50;
    
    // Add or remove warning class from container
    if (rainSoon) {
        container.classList.add('rain-warning');
    } else {
        container.classList.remove('rain-warning');
    }

    const weatherDescription = getWeatherDescription(data.current.weather_code);
    const weatherIcon = getWeatherIcon(data.current.weather_code);
    const humidity = Math.round(data.current.relative_humidity_2m);
    
    // Get tomorrow's forecast low
    const overnightLow = Math.round(data.daily.temperature_2m_min[0]); // Today's minimum
    let tempIcon, tempClass;
    if (overnightLow < 10) {
        tempIcon = 'wi-snowflake-cold';  // freezing icon
        tempClass = 'temp-cold';
    } else if (overnightLow <= 17) {
        tempIcon = 'wi-day-sunny';       // smiling/pleasant icon
        tempClass = 'temp-mild';
    } else {
        tempIcon = 'wi-hot';             // hot icon
        tempClass = 'temp-hot';
    }
    
    weatherWidget.innerHTML = `
        <div class="weather-content">
            <div class="current-weather">
                <h2>Current Weather</h2>
                <div class="weather-main">
                    <i class="wi ${weatherIcon} weather-icon"></i>
                    <div id="temperature">${Math.round(data.current.temperature_2m)}°C</div>
                </div>
                <div id="condition">${weatherDescription}</div>
                <div class="overnight-low ${tempClass}">
                    <i class="wi ${tempIcon}"></i>
                    Overnight Low: ${overnightLow}°C
                </div>
                <div class="weather-details">
                    <div class="detail-item">
                        <i class="wi wi-thermometer"></i>
                        <p>Feels like: ${Math.round(data.current.apparent_temperature)}°C</p>
                    </div>
                    <div class="detail-item">
                        <i class="wi wi-humidity"></i>
                        <div class="humidity-container">
                            <div class="humidity-label">Humidity: ${humidity}%</div>
                            <div class="humidity-bar">
                                <div class="humidity-fill" style="width: ${humidity}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="wi wi-strong-wind"></i>
                        <p>Wind Speed: ${data.current.wind_speed_10m} km/h</p>
                    </div>
                    <div class="rain-details">
                        <h3><i class="wi wi-rain"></i> Rain Information</h3>
                        <p>Current Rain: ${data.current.rain} mm</p>
                        <p>Current Showers: ${data.current.showers} mm</p>
                        <p>Total Today: ${data.daily.rain_sum[0]} mm</p>
                    </div>
                </div>
            </div>
            <div class="precipitation-forecast">
                <h3>Rain Probability</h3>
                <div class="hourly-probabilities">
                    ${nextHours.map((prob, index) => {
                        const hour = (currentHour + index + 1) % 24;
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const hour12 = hour % 12 || 12;
                        const hasRain = prob > 0;
                        
                        return `
                            <div class="prob-card ${hasRain ? 'has-rain' : ''}">
                                <div class="time">${hour12}:00 ${ampm}</div>
                                <i class="wi wi-raindrops"></i>
                                <div class="probability">${prob}%</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${rainSoon ? `
                    <div class="rain-warning-message">
                        <i class="wi wi-tsunami"></i>
                        WARNING - ABOUT TO RAIN!
                        <i class="wi wi-tsunami"></i>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    return weatherCodes[code] || 'Unknown';
}

function getWeatherIcon(code) {
    const iconMappings = {
        0: 'wi-day-sunny',
        1: 'wi-day-sunny-overcast',
        2: 'wi-day-cloudy',
        3: 'wi-cloudy',
        45: 'wi-fog',
        48: 'wi-fog',
        51: 'wi-sprinkle',
        53: 'wi-sprinkle',
        55: 'wi-sprinkle',
        61: 'wi-rain',
        63: 'wi-rain',
        65: 'wi-rain',
        71: 'wi-snow',
        73: 'wi-snow',
        75: 'wi-snow',
        77: 'wi-snow',
        80: 'wi-showers',
        81: 'wi-showers',
        82: 'wi-rain',
        95: 'wi-thunderstorm',
        96: 'wi-thunderstorm',
        99: 'wi-thunderstorm'
    };
    return iconMappings[code] || 'wi-na';
}

async function fetchTransportData(latitude, longitude) {
    try {
        const response = await fetch(`http://localhost:3000/api/transport?latitude=${latitude}&longitude=${longitude}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Transport data received:', data);
        return data;
    } catch (error) {
        console.error('Error fetching transport data:', error);
        throw error;
    }
}

function updateTransportDisplay(data) {
    const transportWidget = document.createElement('div');
    transportWidget.className = 'transport-widget';
    
    // Get next few departures
    const departures = data.stopEvents
        .slice(0, 3)
        .map(stop => {
            const time = new Date(stop.departureTimePlanned);
            return `
                <div class="departure">
                    <span class="route">${stop.transportation.number}</span>
                    <span class="destination">${stop.transportation.destination.name}</span>
                    <span class="time">${time.toLocaleTimeString('en-AU', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            `;
        })
        .join('');

    transportWidget.innerHTML = `
        <div class="transport-content">
            <h2>Next Departures</h2>
            ${departures}
        </div>
    `;
    
    document.querySelector('.container').appendChild(transportWidget);
}

// Add this near the top where you initialize your variables
const WEST_RYDE_COORDS = {
    latitude: -33.8075,
    longitude: 151.1037
};

// Modify your initialization code
async function initializeWeatherDashboard() {
    try {
        // Start both fetches in parallel
        const [weatherData, transportData] = await Promise.all([
            fetchWeatherData(),
            fetchTransportData(WEST_RYDE_COORDS.latitude, WEST_RYDE_COORDS.longitude)
        ]);
        
        // Weather and transport will update independently
        updateWeatherDisplay(weatherData);
        updateTransportDisplay(transportData);
        
        // Set up refresh intervals
        setInterval(updateTime, 1000);
        setInterval(async () => {
            const weatherData = await fetchWeatherData();
            updateWeatherDisplay(weatherData);
        }, 300000); // Update weather every 5 minutes
        
        setInterval(async () => {
            const transportData = await fetchTransportData(WEST_RYDE_COORDS.latitude, WEST_RYDE_COORDS.longitude);
            updateTransportDisplay(transportData);
        }, 60000); // Update transport every minute
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', initializeWeatherDashboard);



