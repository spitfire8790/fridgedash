// Weather API constants

const WEATHER_API_URL = "https://api.open-meteo.com/v1/bom";

const LAT = -33.80007150250232;

const LONG = 151.06689458521106;



function updateTime() {

    const timeDisplay = document.getElementById('timeDisplay');

    const now = new Date();

    const options = { 

        hour: '2-digit', 

        minute: '2-digit', 

        second: '2-digit',

        hour12: true 

    };

    timeDisplay.textContent = now.toLocaleTimeString('en-US', options);

}



async function fetchWeatherData() {

    try {

        const response = await fetch(`${WEATHER_API_URL}?latitude=${LAT}&longitude=${LONG}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,rain,showers&hourly=precipitation_probability,rain,showers&daily=rain_sum&timezone=Australia/Sydney`);

        

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

    const weatherDescription = getWeatherDescription(data.current.weather_code);

    const weatherIcon = getWeatherIcon(data.current.weather_code);

    

    const nextHours = data.hourly.precipitation_probability.slice(0, 6);

    const currentHour = new Date().getHours();

    

    const hours = nextHours.map((_, index) => {

        const hour = (currentHour + index) % 24;

        return `${hour}:00`;

    });

    

    weatherWidget.innerHTML = `

        <div class="weather-content">

            <div class="current-weather">

                <h2>Current Weather</h2>

                <div class="weather-main">

                    <i class="wi ${weatherIcon} weather-icon"></i>

                    <div id="temperature">${Math.round(data.current.temperature_2m)}°C</div>

                </div>

                <div id="condition">${weatherDescription}</div>

                <div class="weather-details">

                    <div class="detail-item">

                        <i class="wi wi-thermometer"></i>

                        <p>Feels like: ${Math.round(data.current.apparent_temperature)}°C</p>

                    </div>

                    <div class="detail-item">

                        <i class="wi wi-humidity"></i>

                        <p>Humidity: ${data.current.relative_humidity_2m}%</p>

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

                <h3>Rain Probability (Next 6 Hours)</h3>

                <canvas id="precipitationChart"></canvas>

            </div>

        </div>

    `;



    // Create precipitation probability chart

    const ctx = document.getElementById('precipitationChart').getContext('2d');

    new Chart(ctx, {

        type: 'bar',

        data: {

            labels: hours,

            datasets: [{

                label: 'Rain Probability (%)',

                data: nextHours,

                backgroundColor: 'rgba(54, 162, 235, 0.5)',

                borderColor: 'rgba(54, 162, 235, 1)',

                borderWidth: 1

            }]

        },

        options: {

            scales: {

                y: {

                    beginAtZero: true,

                    max: 100

                }

            },

            plugins: {

                legend: {

                    display: false

                }

            }

        }

    });

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



// Add this new mapping for weather icons

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



// Initialize

document.addEventListener('DOMContentLoaded', () => {

    // Start time updates

    updateTime();

    setInterval(updateTime, 1000);



    // Start weather updates

    fetchWeatherData();

    setInterval(fetchWeatherData, 300000); // Every 5 minutes

});


