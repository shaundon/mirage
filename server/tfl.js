const request = require('request');

// Load config.
const config = require('../config.json');

const TfL = {
  current: {
    status: null,
    arrivals: {},
    disruption: {}
  },
  _findMatchedArrival: (lineRequests, arrival) => {
    // Check each line request to see if it matches
    // the arrival.
    for (var i in lineRequests) {
      var lineRequest = lineRequests[i];
      if (arrival.lineId === lineRequest.lineId &&
          arrival.modeName === lineRequest.modeName &&
          arrival.stationName === lineRequest.stationName) {
            if (lineRequest.direction) {
              if (arrival.direction === lineRequest.direction) {
                return true;
              }
              return false;
            }
            return true;
      }
    }
    return false;
  },
  _formatLineStatusData: (err, res, data) => {
    if (err) {
      console.log(err);
      TfL.current.status = 'error';
    }
    else if (res.statusCode !== 200) {
      console.log(`Error! Status code was ${res.statusCode}`, data);
      TfL.current.status = 'error';
    }
    else {
      TfL.current.status = 'success';
      // Data is an array of stops with arrival info.
      try {
        data = JSON.parse(data);
        TfL.current.disruption = data;
      } catch (err) {
        console.log('Could not parse TfL line status data', err, data);
        TfL.current.status = 'error';
      }
    }
  },
  _formatLineArrivalData: (lineRequests, err, res, data) => {
    if (err) {
      console.log(err);
      TfL.current.status = 'error';
    }
    else if (res.statusCode !== 200) {
      console.log(`Error! Status code was ${res.statusCode}`, data);
      TfL.current.status = 'error';
    }
    else {
      TfL.current.status = 'success';
      // Data is an array of stops with arrival info.
      try {
        data = JSON.parse(data);
        for (var i in data) {
          var arrival = data[i];
          if (TfL._findMatchedArrival(lineRequests, arrival)) {
            if (!TfL.current.arrivals[arrival.lineId]) {
              TfL.current.arrivals[arrival.lineId] = [];
            }
            TfL.current.arrivals[arrival.lineId].push(arrival);
          }
        }
      } catch (err) {
        console.log('Could not parse TfL arrival data', err, data);
        TfL.current.status = 'error';
      }
    }
  },
  getDisruptions: () => {
    console.log('Requesting TfL disruption data..');

    return new Promise((fulfill, reject) => {
      // Request data for the lines.
      request(`https://api.tfl.gov.uk/Line/Mode/tube,dlr,overground/Disruption`, (err, res, data) => {
        console.log('Got TfL disruption data.');
        TfL._formatLineStatusData(err, res, data);
        fulfill(TfL.current);
      });
    });
  },
  getArrivals: (lineRequests) => {

    console.log('Requesting TfL arrival data..');

    /*
    lineRequests is an array of objects with the following format:
    {lineId: 172, modeName: bus, stationName: Millmark Grove, direction: outbound}
    */

    if (!lineRequests) {
      throw new Error('Provide some line requests.');
    }
    if (!Array.isArray(lineRequests)) {
      throw new Error('lineRequests must be an array of objects.');
    }
    if (lineRequests.length === 0) {
      throw new Error('lineRequests is empty.');
    }

    // Get all lineIds.
    const lineIds = lineRequests.map((lineRequest) => lineRequest.lineId).join(',');

    return new Promise((fulfill, reject) => {
      // Request data for the lines.
      request(`https://api.tfl.gov.uk/Line/${lineIds}/Arrivals`, (err, res, data) => {
        console.log('Got TfL arrival data.');
        TfL._formatLineArrivalData(lineRequests, err, res, data);
        fulfill(TfL.current);
      });
    });

  }
};
module.exports = TfL;
