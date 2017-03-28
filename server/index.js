// Load config.
const config = require('../config.json');

// Set up express and socket.io.
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const Weather = require('./weather.js');
const TfL = require('./tfl.js');
const Conversation = require('./conversation.js');
const Trains = require('./trains.js');

let dataStore = {};

// Serve static files.
app.use(express.static('web-app/src'));

// Secret route for triggering all clients to refresh.
app.get('/refresh', function(req, res) {
  io.emit('refresh');
  res.send('Refresh command sent to all connected clients.');
});

// When a client connects.
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
  getConversation();

  // If it's after 11:00pm or before 6:00am, don't refresh TfL
  // or trains.
  const currentHours = new Date().getHours();
  if (currentHours > 5) {
    getTfLData();
    getTrains();
  }
};

// Refresh data on load.
refreshData();

// Refresh data every 60 seconds.
setInterval(() => {
  refreshData();
}, 60*2000);
