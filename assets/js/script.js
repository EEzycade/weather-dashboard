// set GLOBAL variables
var submitBtn = document.getElementById("submit-btn");
var searchBar = document.getElementById("city");
var currentContainerEl = document.getElementById("current-container");
var futureContainerEl = document.getElementById("forecast-cards");
var previousSearchesEl = document.getElementById("previous-searches");
var previousSearchesList = document.getElementById("previous-searches-list");
var previousSearchListItem = document.querySelectorAll(".search-item");
var today = moment();

previousSearchesEl.appendChild(previousSearchesList);

// create empty array to store previous searches
var cityHistory = [];

// create function to initialize the app
function initializeApp() {
    var city = searchBar.value;
    if (localStorage.getItem("citySearchHistory")) {
        var pullHistory = JSON.parse(localStorage.getItem("citySearchHistory"));
        pullHistory.push(city);
        localStorage.setItem("citySearchHistory", JSON.stringify(pullHistory));
    } else {
        cityHistory.push(city);
        localStorage.setItem("citySearchHistory", JSON.stringify(cityHistory));
    }

    futureContainerEl.innerHTML = "";
    currentContainerEl.innerHTML = "";
    getCoordinates(city);
    previousSearchesList.innerHTML = "";
    cityHistoryListMaker();
}

function cityHistoryListMaker() {
    var pullHistory = JSON.parse(localStorage.getItem("citySearchHistory"));
    for (let i = 0; i < pullHistory.length; i++) {
        var listItem = document.createElement("li");
        listItem.setAttribute("class", "search-item");
        listItem.innerHTML = pullHistory[i];
        previousSearchesList.appendChild(listItem);
    }
}

// create function to get lat and lon of searched city
function getCoordinates(city) {
    fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=914422851b1b4c67eeeca21958292d40&units=imperial`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);

            var name = data.name;
            var lat = data.coord.lat;
            var lon = data.coord.lon;

            populateWeatherData(name, lat, lon);
        });
}

// create function to get weather data on searched city
function populateWeatherData(name, lat, lon) {
    // set variables
    // fetch current and future weather data
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=914422851b1b4c67eeeca21958292d40`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // log json response to console
            console.log(data);
            // set variables
            var response = data.current;
            var weatherIconCode = response.weather[0].icon;
            var iconUrl = `http://openweathermap.org/img/wn/${weatherIconCode}.png`;
            // create html to display current weather data
            var cityName = document.createElement("h3");
            cityName.innerHTML = name + " (" + today.format("dddd, MMMM Do") + ")" + "<img src='" + iconUrl + "' />";
            var cityTemp = document.createElement("h3");
            cityTemp.innerHTML = "Temp: " + response.temp + "°F";
            var cityWind = document.createElement("h3");
            cityWind.innerHTML = "Wind: " + response.wind_speed + " MPH";
            var cityHum = document.createElement("h3");
            cityHum.innerHTML = "Humidity: " + response.humidity + " %";
            var cityUvIndex = document.createElement("h3");
            if (response.uvi <= 2.99) {
                cityUvIndex.setAttribute("class", "uv-low");
            } else if (response.uvi >= 3 && response.uvi <= 5.99) {
                cityUvIndex.setAttribute("class", "uv-moderate");
            } else if (response.uvi >= 6 && response.uvi <= 7.99) {
                cityUvIndex.setAttribute("class", "uv-high");
            } else {

            }
            cityUvIndex.innerHTML = `<strong>UV index: ${response.uvi}</strong>`;
            // append current weather data elements
            currentContainerEl.append(cityName, cityTemp, cityWind, cityHum, cityUvIndex);

            // loop through next five days to populate future weather data
            for (var i = 0; i < 5; i++) {
                var forecast = data.daily[i];
                var date = moment.unix(forecast.dt).format("MM/DD/YYYY");
                var dailyIconCode = data.daily[i].weather[0].icon;
                var dailyIconUrl = `http://openweathermap.org/img/wn/${dailyIconCode}.png`;
                // create html content for five day forecast
                var dailyForecastCard = document.createElement("div");
                dailyForecastCard.setAttribute("class", "card");
                dailyForecastCard.setAttribute("id", "daily-card");
                var dailyForecastBody = document.createElement("div");
                dailyForecastBody.setAttribute("class", "card-body");
                var dailyDate = document.createElement("h4");
                dailyDate.setAttribute("class", "card-title");
                dailyDate.innerHTML = date;
                var dailyIcon = document.createElement("h4");
                dailyIcon.innerHTML = "<img src='" + dailyIconUrl + "' />";
                dailyTemp = document.createElement("p");
                dailyTemp.setAttribute("class", "card-text");
                dailyTemp.innerHTML = `Temp: ${forecast.temp.day}°F`;
                dailyWindSpeed = document.createElement("p");
                dailyWindSpeed.setAttribute("class", "card-text");
                dailyWindSpeed.innerHTML = `Wind: ${forecast.wind_speed} mph`;
                dailyHum = document.createElement("p");
                dailyHum.setAttribute("class", "card-text");
                dailyHum.innerHTML = `Humidity: ${forecast.humidity}%`

                futureContainerEl.appendChild(dailyForecastCard);
                dailyForecastCard.appendChild(dailyForecastBody)
                dailyForecastBody.append(dailyDate, dailyIcon, dailyTemp, dailyWindSpeed, dailyHum);

            }
        });


}

submitBtn.addEventListener("click", initializeApp);