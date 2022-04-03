let weatherAPIKey = "cc54566e126220500f6c6d30924fedaf";
let weatherBaseEndPoint = "https://api.openweathermap.org/data/2.5/weather?appid=" + weatherAPIKey + "&units=metric";
let forecastBaseEndPoint = "https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=" + weatherAPIKey;
let geocodingBaseEndpoint = "https://api.openweathermap.org/geo/1.0/direct?limit=5&appid=" + weatherAPIKey + "&q=";
let reversegeocodingBaseEndPoint = "https://api.openweathermap.org/geo/1.0/reverse?&limit=1&appid=" + weatherAPIKey;

let searchInp = document.querySelector(".weather_search");
let city = document.querySelector(".weather_city");
let day = document.querySelector(".weather_day");
let humidity = document.querySelector(".weather_indicator--humidity>.value");
let wind = document.querySelector(".weather_indicator--wind>.value");
let pressure = document.querySelector(".weather_indicator--pressure>.value");
let temperature = document.querySelector(".weather_temperature>.value");
let image = document.querySelector(".weather_image");
let forecastBlock = document.querySelector(".weather_forecast");
let cities = document.querySelector("#suggestions");

let weatherImages = [{
        url: "images/broken-clouds.png",
        ids: [803, 804],
    },
    {
        url: "images/clear-sky.png",
        ids: [800],
    },
    {
        url: "images/few-clouds.png",
        ids: [801],
    },
    {
        url: "images/mist.png",
        ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781],
    },
    {
        url: "images/rain.png",
        ids: [500, 501, 502, 503, 504],
    },
    {
        url: "images/scattered-clouds.png",
        ids: [802],
    },
    {
        url: "images/shower-rain.png",
        ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321],
    },
    {
        url: "images/snow.png",
        ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
    },
    {
        url: "images/thunderstorm.png",
        ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
    },
];


let getWeaterByCity = async(city) => {
    let endPoint = weatherBaseEndPoint + "&q=" + city;
    let response = await fetch(endPoint);
    let weather = await response.json();
    return weather;
};

let getForecastByCity = async(id) => {
    let endPoint = forecastBaseEndPoint + "&id=" + id;
    let response = await fetch(endPoint);
    let forecast = await response.json();
    let forecastList = forecast.list;
    let daily = [];
    forecastList.forEach((day) => {
        let date_txt = day.dt_txt;
        date_txt = date_txt.replace(" ", "T");
        let date = new Date(date_txt);
        let hours = date.getHours();
        if (hours === 12) {
            daily.push(day);
        }
    });
    return daily;
};

let dayOfWeek = (dt = new Date().getTime()) => {
    let today = new Date(dt).toLocaleDateString("en-EN", { weekday: "long" });
    return today;
};

let updateCurrentWeather = (data) => {
    city.innerText = data.name;
    day.innerText = dayOfWeek();
    humidity.innerText = data.main.humidity;
    pressure.innerText = data.main.pressure;
    let windDirection;
    let deg = data.wind.deg;

    if (deg > 45 && deg <= 135)
        windDirection = "East";
    else if (deg > 135 && deg <= 225)
        windDirection = "South";
    else if (deg > 225 && deg <= 315)
        windDirection = "West";
    else
        windDirection = "North";

    wind.innerText = windDirection + "," + data.wind.speed;

    temperature.innerText = data.main.temp > 0 ?
        "+" + Math.round(data.main.temp) :
        Math.round(data.main.temp);

    let imgId = data.weather[0].id;
    weatherImages.forEach((obj) => {
        if (obj.ids.indexOf(imgId) != -1) {
            image.src = obj.url;
        }
    });
};

let updateForcast = (forecast) => {
    forecastBlock.innerHTML = "";
    let forecastItem = "";
    forecast.forEach((day) => {
        let iconUrl = "http://openweathermap.org/img/wn/" + day.weather[0].icon + "@2x.png";

        let temperature = day.main.temp > 0 ?
            "+" + Math.round(day.main.temp) :
            Math.round(day.main.temp);

        let dayName = dayOfWeek(day.dt * 1000);

        forecastItem += `<div class="col">
        <div class="card weather_forecast_item bg-primary">
          <img
            class="card-img-top weather_forecast_icon"
            src="${iconUrl}"
            alt="${day.weather[0].description}"
          />
          <div class="card-body">
            <div class="card-title weather_forecast_day">
              <h2>${dayName}</h2>
            </div>
            <div class="card-text">
              <p class="weather_forecast_temperature">
                <span class="value">${temperature}</span> &deg;C
              </p>
            </div>
          </div>
        </div>
      </div>`;

    });

    forecastBlock.innerHTML = forecastItem;
};

let weatherForCity = async(city) => {
    let weather = await getWeaterByCity(city);
    if (weather.cod === "404") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Wrong City Name!',
            color: "white",
        });
        return;
    }
    updateCurrentWeather(weather);
    console.log(weather);
    let cityId = weather.id;
    let forecast = await getForecastByCity(cityId);
    //console.log(forecast);
    updateForcast(forecast);
};

searchInp.addEventListener("keydown", async(e) => {
    if (e.keyCode === 13) {
        weatherForCity(searchInp.value);
    }
});

searchInp.addEventListener("input", async() => {
    if (searchInp.value.length <= 2) {
        return;
    }
    let endPoint = geocodingBaseEndpoint + searchInp.value;
    let response = await fetch(endPoint);
    let result = await response.json();
    cities.innerHTML = "";
    let option = "";
    result.forEach((city) => {
        let value = `${city.name}${city.state ? ","+city.state : ""},${city.country}`;
        option += "<option value=" + value + ">";
    });
    console.log(option);
    cities.innerHTML = option;
});

window.onload = async() => {
    const options = {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
    };
    navigator.geolocation.getCurrentPosition(getLocation, error, options);
}

async function getLocation(pos) {
    let crd = pos.coords;
    let lat = crd.latitude.toString();
    let lon = crd.longitude.toString();
    let endPoint = reversegeocodingBaseEndPoint + "&lat=" + lat + "&lon=" + lon;
    let response = await fetch(endPoint);
    let weather = await response.json();
    //console.log(weather[0].name);
    weatherForCity(weather[0].name);
    Swal.fire({
        icon: 'success',
        title: 'Welcome',
        color: "white",
    });
}

function error(err) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Can not find your location!',
        color: "white",
    });
}