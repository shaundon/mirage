// Load config.
var config = require('../config.json');
var Forecast = require('forecast.io');

var sampleData = {
  currently: {
    summary: 'Clear',
    icon: 'clear-day',
    precipProbability: 0,
    temperature: 19.89,
    apparentTemperature: 19.89,
    windSpeed: 8.17
  },
  minutely: {
    summary: 'Clear for the hour.',
    icon: 'clear-day'
  },
  hourly: {
    summary: 'Clear throughout the day.',
    icon: 'clear-day'
  },
  daily: {
    summary: 'Light rain tomorrow through Sunday, with temperatures falling to 13C on Saturday.',
    icon: 'rain'
  }
};
const Weather = {
  forecast: null,
  current: {
    status: null,
    lastUpdated: null
  },
  _init: () => {
    if (!Weather.forecast) {
      Weather.forecast = new Forecast({
        APIKey: config.apiKeys['forecast.io']
      });
    }
  },
  _formatData: (err, res, data) => {
    if (err) {
      Weather.current.status = 'error';
    }
    else {
      Weather.current.lastUpdated = new Date();
      Weather.current.status = 'success';
      Weather.current.currently = data.currently || {};
      Weather.current.minutely = data.minutely || {};
      Weather.current.hourly = data.hourly || {};
      Weather.current.daily = data.daily || {};
    }
  },
  get: () => {
    return new Promise(function(fulfill, reject) {
      Weather._init();
      Weather.forecast.get(config.geo.latitude, config.geo.longitude, {units: 'auto'}, (err, res, data) => {
        Weather._formatData(err, res, data);
        fulfill(Weather.current);
      });
    });
  }
};
module.exports = Weather;
