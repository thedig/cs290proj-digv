(function(global, doc) {
  var localPath = window.location.href
                    .replace('http://', '')
                    .replace(window.location.host, '');

  switch(localPath) {
    case '/':
      loadTodayWeather();
      break;
    case '/activities':
      load5dayWeather();
      break;
    case '/fiveday':
      load5dayWeather();
      break;
    case '/tenday':
      load10dayWeather();
      break;
  }

  doc.addEventListener("DOMContentLoaded", function(event) {
    // load weather data here

    // setup handlers here
  });

  // Get data on load:



})(window, document);


function load10dayWeather() {
  var uri =
    'http://api.openweathermap.org/data/2.5/forecast/daily?q=94608&appid=fa7d80c48643dfadde2cced1b1be6ca1&cnt=10';
  var req = new XMLHttpRequest();
  req.open('GET', uri, true);
  req.addEventListener('load', handleGetResponse.bind(req));
  req.send(null);

  function handleGetResponse() {

    var response = JSON.parse(this.responseText);
    var statuscode = +parseInt(JSON.parse(this.status));

    if (statuscode >= 200 && statuscode < 400) {
      var days = response.list.map(function(el) {
        el.date = (new Date(+el.dt * 1000)).toDateString().slice(4, 10);
        return el;
      });

      updateTendayList(days);

    } else {
      console.log("Error in network request: " + this.statusText);
    }
  }
}

function updateTendayList(weatherData) {
  weatherData.forEach(function(data, idx) {
    var dateEl = document.getElementsByClassName('tenday-day')[idx];
    dateEl.innerHTML = data.date;

    var forecastEl = document.getElementsByClassName('tenday-forecast')[idx];

    var forecastString = 'Temp: ' + KelToFahr(data.temp.day) + '˚';
    forecastString += ', High: ' + KelToFahr(data.temp.max) + '˚';
    forecastString += ', Low: ' + KelToFahr(data.temp.min) + '˚';
    forecastString += ', ' + sunnyDay(data.clouds);

    forecastEl.innerHTML = forecastString;

  });
}

function load5dayWeather() {
  var uri =
    'http://api.openweathermap.org/data/2.5/forecast?q=94608&appid=fa7d80c48643dfadde2cced1b1be6ca1';
  var req = new XMLHttpRequest();
  req.open('GET', uri, true);
  req.addEventListener('load', handleGetResponse.bind(req));
  req.send(null);

  function handleGetResponse() {

    var response = JSON.parse(this.responseText);
    var statuscode = +parseInt(JSON.parse(this.status));

    if (statuscode >= 200 && statuscode < 400) {
      var list = response.list;

      var days = {};

      list.forEach(function(stat) {
        var dayStamp = stat.dt_txt.slice(0, 10);
        if (days[dayStamp]) {
          days[dayStamp].push(stat);
        } else {
          days[dayStamp] = [ stat ];
        }
      });

      var dayGroups = Object.keys(days).map(function(key) {
        var dayList = days[key];
        return dayList.reduce(processDayData, {date: key});
      });

      updateFivedayTable(dayGroups);

    } else {
      console.log("Error in network request: " + this.statusText);
    }
  }
}

function updateFivedayTable(weatherData) {
  weatherData.forEach(function(data, idx) {
    if (idx > 1) {
      var title = document.getElementById("day" + idx + "__title");
      title.innerHTML = data.date.slice(5);
    }

    var tempRow = document.getElementsByClassName('temp-row')[0];
    var tempCell = tempRow.children[idx+1];
    tempCell.innerHTML = data.temp+ '˚';

    var highRow = document.getElementsByClassName('high-row')[0];
    var highCell = highRow.children[idx+1];
    highCell.innerHTML = data.high + '˚';

    var lowRow = document.getElementsByClassName('low-row')[0];
    var lowCell = lowRow.children[idx+1];
    lowCell.innerHTML = data.low + '˚';

    var humidRow = document.getElementsByClassName('humid-row')[0];
    var humidCell = humidRow.children[idx+1];
    humidCell.innerHTML = data.humidity + ' %';
  });
}


function processDayData(accum, data) {
  var high = accum.high;
  var dataHigh = KelToFahr(data.main.temp_max);
  if (!high || high < dataHigh) {
    accum.high = dataHigh;
  }

  var low = accum.low;
  var dataLow = KelToFahr(data.main.temp_min);
  if (!low || low > dataLow) {
    accum.low = dataLow;
  }

  if (data.dt_txt.slice(11) === '12:00:00') {
    accum.temp = KelToFahr(data.main.temp);
    accum.humidity = data.main.humidity;
  }

  return accum;
}


function loadTodayWeather() {
  var uri =
    'http://api.openweathermap.org/data/2.5/forecast/daily?q=94608&appid=fa7d80c48643dfadde2cced1b1be6ca1&cnt=1';
  var req = new XMLHttpRequest();
  req.open('GET', uri, true);
  req.addEventListener('load', handleGetResponse.bind(req));
  req.send(null);

  function handleGetResponse() {

    var response = JSON.parse(this.responseText);
    var statuscode = +parseInt(JSON.parse(this.status));

    if (statuscode >= 200 && statuscode < 400) {
      updateWeatherDashboard(response.list[0]);
    } else {
      console.log("Error in network request: " + this.statusText);
    }
  }
}

function updateWeatherDashboard(weatherData) {
  console.log(weatherData);

  var clouds = weatherData.clouds;
  var cloudDiv = document.getElementsByClassName('sky-condition')[0]

  cloudDiv.innerHTML = sunnyDay(clouds);


  var cloudBubble = cloudDiv.parentNode;
  if (clouds > 75) {
    cloudBubble.style = 'background-color: gray';
  } else if (clouds > 25) {
    cloudBubble.style = 'background-color: lightgray';
  } else {
    cloudBubble.style = 'background-color: white';
  }

  document.getElementsByClassName('condition-icon')[0].innerHTML =
    '<img class="icon" src="' + conditionIcon(weatherData.weather[0].icon) + '">';

  var temp = KelToFahr(weatherData.temp.day);
  var tempDiv = document.getElementsByClassName('temp')[0];

  tempDiv.innerHTML = temp + '˚';

  var tempBubble = tempDiv.parentNode;
  if ( temp > 100) {
    tempBubble.style = 'background-color: red';
  } else if (temp > 90) {
    tempBubble.style = 'background-color: orange';
  } else if (temp > 70) {
    tempBubble.style = 'background-color: yellow';
  } else {
    tempBubble.style = 'background-color: #0055ff';
  }

  document.getElementsByClassName('humidity')[0].innerHTML =
    weatherData.humidity + ' %';

}

function KelToFahr(temp) {
  return Math.round((temp - 273) * 9 / 5 + 32)
}

function sunnyDay(clouds) {
  if (clouds > 90) {
    return 'Overcast';
  } else if (clouds > 75) {
    return 'Mostly Cloudy';
  } else if (clouds > 50) {
    return 'Partly Clear';
  } else if (clouds > 25) {
    return 'Mostly Clear';
  } else {
    return 'Clear';
  }
}

function conditionIcon(icon) {
  return 'http://openweathermap.org/img/w/' + icon + '.png';
}
