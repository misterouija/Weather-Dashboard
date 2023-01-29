// Function to format date
const formatDate = (dt) => {
    return moment.unix(dt).format('MMM Do, YYYY');
};

// Function to get items from local storage
const getFromLocalStorage = (name) => {
    return JSON.parse(localStorage.getItem(name));
};
// Function to store items to local storage
const addToLocalStorage = (name, item) => {
    // Check if data already stored
    let list = [];
    if (getFromLocalStorage(name) !== null) {
        list = getFromLocalStorage(name);
    }
    // Check if item is empty or already in storage
    if (item.length === 0 || list.includes(item)) {
        list = getFromLocalStorage(name);
    } else {
        // Add new items to array and save to local storage
        list.unshift(item);
        localStorage.setItem(name, JSON.stringify(list));
    }
};


// Add buttons expect default search
let searchCount = 0;
const addRecent = (search) => {
    if (searchCount > 0 && getFromLocalStorage('recentSearches').includes(search) === false) {

        let button = `<button type="button" class="btn btn-secondary d-flex justify-content-between">${search}<span
        class="fa fa-times"></span></button>`;
        $(button).appendTo('#history');
    }
    searchCount++;
};

const renderRecentSearches = () => {
    // Call getFromLocalStorage function to get recent searches
    const recent = getFromLocalStorage('recentSearches');
    if (recent !== null) {
        let button = '';
        // Loop through recent and render all buttons except default search
        for (let i = 0; i < recent.length - 1; i++) {
            button += `<button type="button" class="btn btn-secondary d-flex justify-content-between">${recent[i]}<span
        class="fa fa-times remove"></span></button>`;
        }

        $(button).appendTo('#history');
    }

};


// Function to fetch forecast data
const getForecast = (lat, lon, cityName, appid = '9270527dd2d838bcebaf2aaf5a875cff') => {
    let queryURL = `https://api.openweathermap.org/data/2.5/onecall?`;
    queryURL += `lat=${lat}&lon=${lon}&units=metric&exclude=current,minutely,hourly,alerts&appid=${appid}`;
    return fetch(queryURL)
        .then((response) => {
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
            } else {
                throw Error(response.statusText);
            }
        })
        .then(forecast => {
            // Object store required data from dump
            const dailyObj = {
                date: 0,
                humidity: 0,
                temp: 0,
                wind: 0,
                icon: '',
            };
            // Array to store Objects
            const dailyArr = [];
            //Loop through data dump and set object values
            forecast.daily.forEach(d => {
                dailyObj.date = formatDate(d.dt);
                dailyObj.humidity = d.humidity;
                dailyObj.temp = d.temp.day;
                dailyObj.wind = d.wind_speed;
                dailyObj.icon = d.weather[0].icon;
                // Stringify objects and push to array
                dailyArr.push(JSON.stringify(dailyObj));
            });

            // Array to store processed data
            const fiveDayForecast = [];

            // Loop through dailyArr and parse data
            for (let i = 0; i < 6; i++) {
                // Push data to array
                fiveDayForecast.push(JSON.parse(dailyArr[i]));
            }
            // Loop through array and construct element with data
            //fiveDayForecast.forEach((day) => {
            for (let day = 0; day < fiveDayForecast.length; day++)
                if (day === 0) {
                    // Render todays weather
                    $('.today').addClass(`state-${fiveDayForecast[day].icon}`);
                    $('#cityName').text(`${cityName}`);
                    $('#todayIcon').html(`<i class="owi owi-5x owi-${fiveDayForecast[day].icon}"></i>`);
                    // ('#todayIcon').html(`<img src="http://openweathermap.org/img/w/${today.icon}.png" "alt="Weather icon">`);
                    $('#todayTemp').html(`Temp:  ${fiveDayForecast[day].temp} &deg;C`);
                    $('#todayWind').html(`Wind:  ${fiveDayForecast[day].wind} KPH`);
                    $('#todayHumidity').html(`Humidity:  ${fiveDayForecast[day].humidity} %`);
                    $('#todayDate').text(fiveDayForecast[day].date);
                } else {
                    // Create elements to display data
                    let elements = '';
                    elements = `<div class="col">`;
                    elements += `<div class="p-3 border bg-light rounded-3 state-${fiveDayForecast[day].icon}">`;
                    elements += `<p class="date fs-6 fw-bold">${fiveDayForecast[day].date}</p>`;
                    elements += `<ul class="weatherData">`;
                    //elements += `<li><img src="https://openweathermap.org/img/wn/${fiveDayForecast[day].icon}@2x.png" "alt="Weather icon"></li>`;
                    elements += `<li><i class='owi owi-4x owi-${fiveDayForecast[day].icon}'></i></li>`;
                    elements += `<li>Temp:  ${fiveDayForecast[day].temp} &deg;C</li>`;
                    elements += `<li>Wind:  ${fiveDayForecast[day].wind} KPH</li>`;
                    elements += `<li>Humidity:  ${fiveDayForecast[day].humidity} %</li>`;
                    elements += `</ul></div></div>`;

                    // Append elements to render forecast display
                    $(elements).appendTo($('#weatherData'));
                }
        })
        .catch(err => {
            alert(err);
        });
};

// Function to get coordinates
const renderForecast = (city = 'London', appid = 'e56b324652925293f54beb9630933db8') => {
    // Api call to get lat and lon data from city name
    let queryURL = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${appid}`;
    return fetch(queryURL)
        .then((response) => {
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
            } else {
                throw Error(response.statusText);
            }
        })
        .then(geo => {
            // Get lat, lon and city name
            const lat = geo[0].lat;
            const lon = geo[0].lon;
            const cityName = `${geo[0].name}, ${geo[0].country}`;

            // Clear display before updating
            $('#weatherData').html('');

            // Call addRecent function to add recent searches
            addRecent(cityName);
            // Call addToLocalStorage function with name and cityName
            addToLocalStorage('recentSearches', cityName);
            // Call getForecast function with lat, lon, and City Name data
            getForecast(lat, lon, cityName, appid);


        })
        .catch(err => alert(err));

};

const removeSearch = (search) => {
    // Get recent searches from localstorage
    const recentSearches = getFromLocalStorage('recentSearches');
    // Find index of search
    const index = recentSearches.indexOf(search);
    // Remove Item from array
    recentSearches.splice(index, 1);
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));

};



//removeSearch("New York County, US");



export { renderForecast, renderRecentSearches, removeSearch };