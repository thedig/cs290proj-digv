var weatherStatus = {};

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

      break;
  }

  doc.addEventListener("DOMContentLoaded", function(event) {
    // load weather data here

    // setup handlers here
  });

  // Get data on load:



})(window, document);


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
    tempCell.innerHTML = data.temp;

    var highRow = document.getElementsByClassName('high-row')[0];
    var highCell = highRow.children[idx+1];
    highCell.innerHTML = data.high;

    var lowRow = document.getElementsByClassName('low-row')[0];
    var lowCell = lowRow.children[idx+1];
    lowCell.innerHTML = data.low;

    var humidRow = document.getElementsByClassName('humid-row')[0];
    var humidCell = humidRow.children[idx+1];
    humidCell.innerHTML = data.humidity + ' %';
  });
}


function processDayData(accum, data) {
  var high = accum.high;
  var dataHigh = Math.round((data.main.temp_max - 273) * 9 / 5 + 32);
  if (!high || high < dataHigh) {
    accum.high = dataHigh;
  }

  var low = accum.low;
  var dataLow = Math.round((data.main.temp_min - 273) * 9 / 5 + 32);
  if (!low || low > dataLow) {
    accum.low = dataLow;
  }

  if (data.dt_txt.slice(11) === '12:00:00') {
    accum.temp = Math.round((data.main.temp - 273) * 9 / 5 + 32);
    accum.humidity = data.main.humidity;
  }

  return accum;
}


function loadTodayWeather() {
  var uri =
    'http://api.openweathermap.org/data/2.5/weather?q=94608&appid=fa7d80c48643dfadde2cced1b1be6ca1';
  var req = new XMLHttpRequest();
  req.open('GET', uri, true);
  req.addEventListener('load', handleGetResponse.bind(req));
  req.send(null);

  function handleGetResponse() {

    var response = JSON.parse(this.responseText);
    var statuscode = +parseInt(JSON.parse(this.status));

    if (statuscode >= 200 && statuscode < 400) {
      var main = response.main;

      weatherStatus.ktemp = main.temp;
      weatherStatus.humidity = main.humidity;
      weatherStatus.ktempmin = main.temp_min;
      weatherStatus.ktempmax = main.temp_max;
      weatherStatus.pressure = main.pressure;

      weatherStatus.forecast =
        'For ' + response.name + ', temp: ' + main.temp + ' kelvin, humidity: ' + main.humidity + '&, pressure: ' + main.pressure;

    } else {
      console.log("Error in network request: " + this.statusText);
    }
  }
}
