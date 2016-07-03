// Load config.
var config = require('../config.json');

// Set up express and socket.io.
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var Weather = require('./weather.js');
var TfL = require('./tfl.js');
var Conversation = require('./conversation.js');
var Trains = require('./trains.js');

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

const getConversation = () => {
  Conversation.get().then((conversationData) => {
    console.log(conversationData);
    dataStore.conversation = conversationData;
    io.emit('conversation', dataStore.conversation);
  });
};

const getWeather = () => {
  Weather.get().then((weatherData) => {
    dataStore.weather = weatherData;
    io.emit('weather', dataStore.weather);
  });
};

const getTfLData = () => {
  TfL.getArrivals(config.TfLLines).then((data) => {
    dataStore.TfL = data;
    io.emit('TfLData', dataStore.TfL);
  });
  TfL.getDisruptions().then((data) => {
    dataStore.TfL = data;
    io.emit('TfLData', dataStore.TfL);
  });
};

const getTrains = () => {
  Trains.getDepartures(config.trainStation).then((data) => {
    dataStore.trains = data;
    io.emit('trains', dataStore.trains);
  })
};

const sendCurrentDataToClients = () => {
  for (var i in dataStore) {
    io.emit(i, dataStore[i]);
  }
};

const refreshData = () => {
  console.log('Refreshing data..');
  getWeather();
  getTfLData();
  getConversation();
  getTrains();
};

// Refresh data on load.
refreshData();

// Refresh data every 60 seconds.
setInterval(() => {
  refreshData();
}, 60*1000);
