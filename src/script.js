const API_KEY = "d66df621c8aa0de343d3efa69e049ec3"; // your key
const citiesContainer = document.getElementById("cities");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// Fetch weather by city name
async function fetchWeather(city) {
  try {
    // Show loading state
    const loadingCard = document.createElement("div");
    loadingCard.className = "city-card";
    loadingCard.textContent = `Loading ${city}...`;
    citiesContainer.appendChild(loadingCard);

    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
    ]);

    if (!currentRes.ok) throw new Error("City not found");

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    // Filter forecast (next 3 days at 12:00)
    const daily = forecast.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 3);

    loadingCard.remove();
    renderCityCard(current, daily);

  } catch (err) {
    alert("Error: " + err.message);
  }
}

// Fetch weather by coordinates (bonus feature)
async function fetchWeatherByCoords(lat, lon) {
  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    ]);

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    const daily = forecast.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 3);

    renderCityCard(current, daily);
  } catch (err) {
    console.log("Location fetch failed", err);
  }
}

// Render city weather card
function renderCityCard(current, forecast) {
  const card = document.createElement("div");
  card.className = "city-card";

  card.innerHTML = `
    <div class="city-header">
      <h2>${current.name}, ${current.sys.country}</h2>
      <span>${Math.round(current.main.temp)}°C</span>
      <button class="remove-btn">❌</button>
    </div>
    <div class="current">
      <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" alt="">
      <span>${current.weather[0].description}</span>
    </div>
    <div class="forecast">
      ${forecast.map(day => `
        <div class="forecast-day">
          <div>${new Date(day.dt_txt).toLocaleDateString(undefined,{weekday:"short"})}</div>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="">
          <div>${Math.round(day.main.temp)}°C</div>
        </div>
      `).join("")}
    </div>
  `;

  // ❌ Remove card button
  card.querySelector(".remove-btn").addEventListener("click", () => {
    card.remove();
  });

  citiesContainer.appendChild(card);
}

// --- Search button ---
searchBtn.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (city) {
    fetchWeather(city);
    searchInput.value = "";
  }
});

// --- Press Enter to search ---
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// --- Auto-fetch user's current location on load ---
window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      () => console.log("User denied location access")
    );
  }
});
