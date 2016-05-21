// Load config.
var config = require('../config.json');
var Forecast = require('forecast.io');

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
