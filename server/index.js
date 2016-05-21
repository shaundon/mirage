// Load config.
var config = require('../config.json');

// Set up express and socket.io.
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var Weather = require('./weather.js');
var TfL = require('./tfl.js');

var dataStore = {};

// Serve static files.
app.use(express.static('web-app/src'));

io.on('connection', (socket) => {
  console.log('Client connected.');

  // Send initial data to client.
  sendCurrentDataToClients();

  // Trigger a refresh.
  refreshData();

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
server.listen(3000, function() {
  console.log('***** Mirage running on port 3000 *****');
});

const getWeather = () => {
  Weather.get().then((weatherData) => {
    dataStore.weather = weatherData;
    io.emit('weather', dataStore.weather);
  });
};

TfL.getArrivals([
  {
    modeName: 'bus',
    lineId: '171',
    stationName: 'Millmark Grove',
    direction: 'outbound'
  },
  {
    modeName: 'bus',
    lineId: '172',
    stationName: 'Millmark Grove',
    direction: 'outbound'
  },
  {
    modeName: 'bus',
    lineId: '484',
    stationName: 'Endwell Road',
    direction: 'outbound'
  },
  {
    modeName: 'overground',
    lineId: 'london-overground',
    stationName: 'Brockley Rail Station',
  }
]).then((data) => {
  dataStore.TfLArrivals = data;
  io.emit('TfLArrivals', dataStore.TfLArrivals);
});

TfL.getDisruptions().then((data) => {
  dataStore.TflDisruptions = data;
  io.emit('TflDisruptions', dataStore.TflDisruptions);
});

const sendCurrentDataToClients = () => {
  for (var i in dataStore) {
    io.emit(i, dataStore[i]);
  }
};

const refreshData = () => {
  getWeather();
};
refreshData();
setTimeout(() => {
  refreshData();
}, 600000);
