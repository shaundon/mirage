const request = require('request');

// Load config.
const config = require('../config.json');

const Trains = {
  current: {
    status: null,
    arrivals: {},
    disruption: {}
  },
  _formatLiveDepartures: function(station, err, res, data) {
    if (err) {
      console.log(err);
    }
    else if (res.statusCode !== 200) {
      console.log(`Error! Status code was ${res.statusCode}`, data);
    }
    else {
      try {
        data = JSON.parse(data);
        return data;
      } catch (err) {
        console.log('Could not parse train departure data', err, data);
        return [];
      }
    }
  },
  getDepartures: (station) => {
    return new Promise((fulfill, reject) => {
      console.log(`Requesting National Rail departures from ${station}`);
      // Request data for the lines.
      request(`http://transportapi.com/v3/uk/train/station/${station}/live.json?app_id=${config.apiKeys.transportApi.appId}&app_key=${config.apiKeys.transportApi.appKey}`, (err, res, data) => {
        console.log('Got National Rail departures.');
        let status = Trains._formatLiveDepartures(station, err, res, data);
        fulfill(status);
      });
    });

  }
};
module.exports = Trains;
