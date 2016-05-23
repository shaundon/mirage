// var socket = io.connect();
// socket.on('weather', (data) => {
//   console.log(data);
// });
// socket.on('TfLArrivals', (data) => {
//   console.log(data);
// });
// socket.on('TfLDisruptions', (data) => {
//   console.log(data);
// });

angular.module('mirage', [
  'btford.socket-io'
])
  .service('SocketService', function(socketFactory) {
    return socketFactory({
      ioSocket: io.connect(location.origin),
    });
  })

  .service('WeatherService', function (SocketService) {
    let ws = {
      currently: null,
      minutely: null,
      hourly: null,
      daily: null
    };
    SocketService.on('weather', (data) => {
      console.log('Weather', data);
      if (data.status = 'success') {
        ws.currently = data.currently;
        ws.minutely = data.minutely;
        ws.hourly = data.hourly;
        ws.daily = data.daily;
      }
    });
    return ws;
  })

  .service('TfLService', function (SocketService, $filter) {
    let ts = {
      arrivals: null,
      disruptions: null
    };
    SocketService.on('TfLData', (data) => {
      console.log('TfL Data', data);
      ts.arrivals = $filter('formatTfLArrivals')(data.arrivals);
      ts.disruption = data.disruption;
    });
    return ts;
  })

  .service('TrainsService', function(SocketService) {
    let ts = {
      departures: null
    };
    SocketService.on('trains', (data) => {
      console.log('Train Departures', data);
      ts.departures = data;
    })
    return ts;
  })

  .service('WelcomeService', function(SocketService) {
    var ws = {
      message: '',
      extra: ''
    };
    SocketService.on('conversation', (data) => {
      console.log('Conversation', data);
      ws.message = data.message || '';
      ws.extra = data.extra || '';
    });
    return ws;
  })

  .directive('date', function($interval, $filter) {
    const renderDate = function() {
      const date = new Date();
      let dateString = date.toDateString();

      // Remove the year.
      dateString = $filter('replaceText')(dateString, ` ${date.getFullYear()}`);

      // Add a suffix to the date.
      switch (date.getDate()) {
        case 1:
        case 21:
        case 31:
          dateString += 'st';
          break;
        case 2:
        case 22:
          dateString += 'nd';
          break;
        case 3:
        case 23:
          dateString += 'rd';
          break;
        default:
          dateString += 'th';
          break;
      }

      return dateString;
    };
    return {
      restrict: 'E',
      template: '{{date}}',
      link: function(scope, elem, attrs) {
        scope.date = renderDate();
        $interval(function() {
          scope.date = renderDate();
        }, 60000);
      }
    }
  })

  .directive('time', function($interval) {
    const formatTime = function(date) {
      let formatted = '';
      formatted += leftPad(date.getHours()) + ':';
      formatted += leftPad(date.getMinutes());
      return formatted;
    };
    const leftPad = function(digit) {
      if (digit < 10) {
        return '0' + digit;
      }
      return digit;
    }
    return {
      restrict: 'E',
      template: '{{time}}',
      link: function(scope, elem, attrs) {
        scope.time = formatTime(new Date());
        $interval(function() {
          scope.time = formatTime(new Date());
        }, 1000);
      }
    }
  })

  .filter('formatTfLArrivals', function($filter) {
    return function(lines) {
      let formatted = {};
      angular.forEach(lines, function(arrivals, line) {
        let currentLine = {
          modeName: '',
          arrivals: {}
        };

        // Iterate through the arrivals and form an array
        // of timings for each one.
        angular.forEach(arrivals, function(arrival) {
          currentLine.modeName = arrival.modeName;
          // Get destination and add to arrivals.
          if (!currentLine.arrivals[arrival.destinationName]) {
            currentLine.arrivals[arrival.destinationName] = [];
          }
          // Store the time to live.
          currentLine.arrivals[arrival.destinationName].push(arrival.timeToStation);
        });

        // Iterate through the new structure created earlier.
        angular.forEach(currentLine.arrivals, function(arrivalTimes, destination) {
          // Sort the array of arrival times.
          let sortedArrivalTimes = currentLine.arrivals[destination].sort(function(a,b) {
            return a-b;
          });

          // If there are more than two arrivals, leave only two.
          sortedArrivalTimes = sortedArrivalTimes.splice(0, 2);

          // Convert to minutes.
          sortedArrivalTimes = sortedArrivalTimes.map(function(arrivalTime) {
            return Math.floor(arrivalTime/60);
          });
          let termToUse = ' mins';
          if (sortedArrivalTimes[sortedArrivalTimes.length-1] === 1) {
            termToUse = ' min';
          }
          sortedArrivalTimes = sortedArrivalTimes.join(', ') + termToUse;
          currentLine.arrivals[destination] = sortedArrivalTimes;
        });

        let lineName = line;

        // If line name is overground, change to the station.
        if (arrivals.length > 0 && lineName === 'london-overground') {
          lineName = $filter('replaceText')(arrivals[0].stationName, ' Rail Station');
        }

        // Store the created object.
        formatted[lineName] = currentLine;
      });
      return formatted;
    }
  })

  .filter('truncate', function() {
    return function(text, length, truncateWith) {
      if (!truncateWith) {
        truncateWith = '';
      }
      if (text.length > length) {
        return text.substr(0, length) + truncateWith;
      }
      return text;
    };
  })

  .filter('round', function() {
    return function(numberToRound) {
      const parsed = parseFloat(numberToRound);
      if (isNaN(parsed)) {
        return 'Could not parse';
      }
      return Math.round(parsed);
    }
  })

  .filter('replaceText', function() {
    return function(input, textToReplace, replaceWith) {
      if (!replaceWith) {
        replaceWith = '';
      }
      return input.replace(textToReplace, replaceWith);
    }
  })

  .controller('WelcomeController', function(WelcomeService) {
    this.welcomeService = WelcomeService;
  })

  .controller('WeatherController', function(WeatherService) {
    this.weatherService = WeatherService;
  })

  .controller('TfLController', function(TfLService) {
    this.tflService = TfLService;
  })

  .controller('TrainsController', function(TrainsService) {
    this.trainsService = TrainsService;
  })
;
