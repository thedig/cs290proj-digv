console.log('testing 123 - script.js');

(function(global, doc) {
  var localPath = window.location.href
                    .replace('http://', '')
                    .replace('https://', '')
                    .replace(window.location.host, '');

  // debugger;

  doc.addEventListener("DOMContentLoaded", function(event) {

    console.log('on DOMContentLoaded');
    debugger;

    switch(localPath) {
      case '/':
        loadTodayWeather(true);
        loadMultiDayWeather(5, false);
        break;
      case '/activities':
        loadTodayWeather();
        break;
      case '/fiveday':
        load5dayWeather();
        break;
      case '/16day':
        loadMultiDayWeather();
        break;
    }

    initSlider();

  });

})(window, document);

function initSlider() {
  $(".slider").slick({
  	dots: true
  });
}

function loadMultiDayWeather(numDays=16, sixteenDay=true) {
  console.log('loadMultiDayWeather');
  var uri =
    'http://api.openweathermap.org/data/2.5/forecast/daily?q=94608&appid=fa7d80c48643dfadde2cced1b1be6ca1&cnt=' + numDays;
  var req = new XMLHttpRequest();
  console.log('new req', req);
  req.open('GET', uri, true);
  req.addEventListener('load', handleGetResponse.bind(req));
  req.send(null);

  function handleGetResponse(res) {

    console.log('handle get response', res);

    var response = JSON.parse(this.responseText);
    var statuscode = +parseInt(JSON.parse(this.status));

    if (statuscode >= 200 && statuscode < 400) {
      var days = response.list.map(function(el) {
        el.date = (new Date(+el.dt * 1000)).toDateString().slice(4, 10);
        return el;
      });
      if (sixteenDay) {
        updateSixteendayList(days);
      } else {
        updateSlider(days);
      }
    } else {
      console.log("Error in network request: " + this.statusText);
    }
  }
}

function updateSlider(weatherData) {
  weatherData.forEach(function(data, idx) {
    if (idx > 0) {
      var slideTitle = document.getElementsByClassName('slide-title')[idx];
      var slideBody = document.getElementsByClassName('slide-body')[idx];

      slideTitle.innerHTML = "Day " + (idx+1);
      slideBody.innerHTML =
        "<div>Day Temp: " + KelToFahr(data.temp.day) + "˚ F</div>" +
        "<div>Night Temp: " + KelToFahr(data.temp.night) + "˚ F</div>";
    }

  });
}

function updateSixteendayList(weatherData) {
  console.log('updateSixteendayList');
  weatherData.forEach(function(data, idx) {
    var dateEl = document.getElementsByClassName('sixteenday-day')[idx];
    dateEl.innerHTML = data.date;

    var forecastEl = document.getElementsByClassName('sixteenday-forecast')[idx];

    var forecastString = 'Temp: ' + KelToFahr(data.temp.day) + '˚ F';
    forecastString += ', High: ' + KelToFahr(data.temp.max) + '˚ F';
    forecastString += ', Low: ' + KelToFahr(data.temp.min) + '˚ F';
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
    tempCell.innerHTML = data.temp+ '˚ F';

    var highRow = document.getElementsByClassName('high-row')[0];
    var highCell = highRow.children[idx+1];
    highCell.innerHTML = data.high + '˚ F';

    var lowRow = document.getElementsByClassName('low-row')[0];
    var lowCell = lowRow.children[idx+1];
    lowCell.innerHTML = data.low + '˚ F';

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

function loadTodayWeather(populateDashboard) {
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
      if (populateDashboard) {
        updateWeatherDashboard(response.list[0]);
      } else {
        updateActivities(response.list[0]);
      }
    } else {
      console.log("Error in network request: " + this.statusText);
    }
  }
}

function updateActivities(weatherData) {
  var temp = KelToFahr(weatherData.temp.day);

  var imgsrc, description, download, downloadDesc;
  if (temp > 100) {
    // movies
    description = 'Go to the movies where there\'s air conditioning!';
    imgsrc =
      'https://st2.depositphotos.com/1003098/7026/i/950/depositphotos_70266429-stock-photo-boy-eating-popcorn-in-3d.jpg';
    download = 'https://static.googleusercontent.com/media/www.google.com/en//intl/en/landing/chrome/cadie/glasses.pdf';
    downloadDesc = 'Don\'t forget your 3d glasses';
  } else if (temp > 90) {
    // beach
    description = 'Great time to hit the beach.';
    imgsrc =
      'http://buzzive.com/wp-content/uploads/2015/05/1130.jpg';
    download = 'http://npmaps.com/wp-content/uploads/lands-end-map.jpg';
    downloadDesc = 'Map of San Francisco Beaches';
  } else if (temp > 70) {
    // picnic
    description = 'Beautiful day for a picnic.';
    imgsrc = 'https://c1.staticflickr.com/7/6056/5884967088_42c1469dd6_b.jpg';
    download = 'https://www.lakemerritt.org/uploads/7/7/2/9/7729843/screen-shot-2017-09-15-at-10-17-35-am_1.png';
    downloadDesc = 'Checkout Lake Merritt!';
  } else if (temp > 50) {
    // bicycle
    description = 'Great temperature for a vigorous bike ride';
    imgsrc = 'https://c1.staticflickr.com/3/2103/1496949592_9dc327ae77_z.jpg?zz=1';
    download = 'http://www2.oaklandnet.com/oakca1/groups/pwa/documents/marketingmaterial/oak058532.pdf';
    downloadDesc = 'Oakland Bike Map';
  } else {
    // read
    description = 'It\'s chilly! Stay in and cozy up with a book';
    imgsrc = 'https://pbs.twimg.com/media/BvJHGGJCYAICEzU.jpg';
    download = 'http://www.oaklandlibrary.org/sites/default/files/uploads/OPLLocationsMap.pdf';
    downloadDesc = 'Oakland Library Locations';
  }

  var mainDiv = document.getElementsByClassName('main-div')[0];
  var descDiv = document.getElementsByClassName('description')[0];
  var downLink = document.getElementsByClassName('download-link')[0];
  mainDiv.innerHTML = '<img class="activity-img" src="' + imgsrc + '">';
  descDiv.innerHTML = '<span>' + description + '</span>';
  downLink.innerHTML = '<a href="' + download + '" target="_blank"><button>' + downloadDesc + '</button></a>';
}

function updateWeatherDashboard(weatherData) {
  var clouds = weatherData.clouds;
  var cloudDiv = document.getElementsByClassName('sky-condition')[0];

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

  tempDiv.innerHTML = temp + '˚ F';

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
